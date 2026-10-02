// clawd-ears: listens to what the Mac is playing, never the microphone, and prints how loud it
// is and when a beat lands, for the mod's music mode.
//
// It taps the system's audio output with a Core Audio process tap (macOS 14.2 or later). The
// audio itself never leaves this process: only its loudness is kept, a number per 50 ms.
//
// Recording system audio needs a permission, which macOS asks for in the name of the app
// responsible for the process. Started from a terminal, that's the terminal app, which says
// nothing of recording audio, so macOS refuses without asking and the tap hears silence. So
// the program first starts a copy of itself responsible for itself, as an app's helper is: the
// copy asks in its own name, with the reason in the Info.plist linked into it, and macOS shows
// "clawd-ears would like to record system audio" the first time.
//
// Output, one line at a time:
//   ok            the tap is running
//   error <why>   it could not start; the program then exits
//   <level> <beat>  loudness from 0 to 9, and 1 when a beat landed in the last 50 ms, else 0.
//                   Printed when one of them changes, and once a second regardless, so the
//                   mod hears from it even in silence and can stop it promptly.
//
// It stops on SIGTERM or SIGINT, and by itself when the program that started it is gone.
//
// Build: xcrun swiftc -O -o build/clawd-ears clawd-ears.swift \
//          -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __info_plist -Xlinker Info.plist

import Accelerate
import AudioToolbox
import CoreAudio
import Foundation

setvbuf(stdout, nil, _IOLBF, 0)

// The copy responsible for itself, while the first program waits on it. The copy shares this
// program's output, so its lines reach whoever started this one.
var copy: pid_t = 0
if getenv("CLAWD_EARS_ON_ITS_OWN") == nil,
  let found = dlsym(UnsafeMutableRawPointer(bitPattern: -2), "responsibility_spawnattrs_setdisclaim")
{
  typealias Disclaim = @convention(c) (UnsafeMutablePointer<posix_spawnattr_t?>, Int32) -> Int32
  var attributes: posix_spawnattr_t?
  posix_spawnattr_init(&attributes)
  _ = unsafeBitCast(found, to: Disclaim.self)(&attributes, 1)
  setenv("CLAWD_EARS_ON_ITS_OWN", "1", 1)
  var path = [CChar](repeating: 0, count: Int(PATH_MAX))
  var size = UInt32(path.count)
  _NSGetExecutablePath(&path, &size)
  let argv = CommandLine.arguments.map { strdup($0) } + [nil]
  if posix_spawn(&copy, path, nil, &attributes, argv, environ) == 0 {
    // Asked to stop, stop the copy too; and if whoever started this program is gone, stop both
    for signal in [SIGTERM, SIGINT, SIGHUP] {
      Foundation.signal(signal) { _ in
        kill(copy, SIGTERM)
        exit(0)
      }
    }
    let parent = getppid()
    var status: Int32 = 0
    while waitpid(copy, &status, WNOHANG) == 0 {
      if getppid() != parent {
        kill(copy, SIGTERM)
        exit(0)
      }
      usleep(200_000)
    }
    exit(0)
  }
  // The copy couldn't start: listen from here, as the terminal's
}

func fail(_ why: String) -> Never {
  print("error \(why)")
  exit(1)
}

func property<T>(_ object: AudioObjectID, _ selector: AudioObjectPropertySelector, _ initial: T) -> T? {
  var address = AudioObjectPropertyAddress(
    mSelector: selector, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
  var value = initial
  var size = UInt32(MemoryLayout<T>.size)
  let status = withUnsafeMutablePointer(to: &value) { AudioObjectGetPropertyData(object, &address, 0, nil, &size, $0) }
  return status == noErr ? value : nil
}

// The device the Mac plays through now, as the aggregate device's clock
guard let output = property(AudioObjectID(kAudioObjectSystemObject), kAudioHardwarePropertyDefaultOutputDevice, AudioObjectID(0)),
  let outputUID = property(output, kAudioDevicePropertyDeviceUID, "" as CFString)
else { fail("no output device") }

// A private tap on everything every process plays, which leaves the sound playing as it was
let tapDescription = CATapDescription(stereoGlobalTapButExcludeProcesses: [])
tapDescription.uuid = UUID()
tapDescription.name = "clawd-ears"
tapDescription.isPrivate = true
tapDescription.muteBehavior = .unmuted
var tap = AudioObjectID(kAudioObjectUnknown)
var status = AudioHardwareCreateProcessTap(tapDescription, &tap)
guard status == noErr else { fail("tap \(status)") }

guard let format = property(tap, kAudioTapPropertyFormat, AudioStreamBasicDescription()),
  format.mFormatID == kAudioFormatLinearPCM, format.mFormatFlags & kAudioFormatFlagIsFloat != 0,
  format.mBitsPerChannel == 32
else { fail("unexpected tap format") }

// A private aggregate device that reads the tap, so an IO proc can receive its buffers
let aggregate: [String: Any] = [
  kAudioAggregateDeviceNameKey: "clawd-ears",
  kAudioAggregateDeviceUIDKey: UUID().uuidString,
  kAudioAggregateDeviceMainSubDeviceKey: outputUID as String,
  kAudioAggregateDeviceIsPrivateKey: true,
  kAudioAggregateDeviceIsStackedKey: false,
  kAudioAggregateDeviceTapAutoStartKey: true,
  kAudioAggregateDeviceSubDeviceListKey: [[kAudioSubDeviceUIDKey: outputUID as String]],
  kAudioAggregateDeviceTapListKey: [
    [kAudioSubTapDriftCompensationKey: true, kAudioSubTapUIDKey: tapDescription.uuid.uuidString]
  ],
]
var device = AudioObjectID(kAudioObjectUnknown)
status = AudioHardwareCreateAggregateDevice(aggregate as CFDictionary, &device)
guard status == noErr else { fail("aggregate device \(status)") }

// Everything below runs on this one queue, so the totals need no lock
let queue = DispatchQueue(label: "clawd-ears")
var sumOfSquares: Float = 0
var samples = 0

var proc: AudioDeviceIOProcID?
status = AudioDeviceCreateIOProcIDWithBlock(&proc, device, queue) { _, input, _, _, _ in
  for buffer in UnsafeMutableAudioBufferListPointer(UnsafeMutablePointer(mutating: input)) {
    guard let data = buffer.mData else { continue }
    let count = Int(buffer.mDataByteSize) / MemoryLayout<Float>.size
    var squares: Float = 0
    vDSP_svesq(data.assumingMemoryBound(to: Float.self), 1, &squares, vDSP_Length(count))
    sumOfSquares += squares
    samples += count
  }
}
guard status == noErr, let proc else { fail("io proc \(status)") }

func stop() -> Never {
  AudioDeviceStop(device, proc)
  AudioDeviceDestroyIOProcID(device, proc)
  AudioHardwareDestroyAggregateDevice(device)
  AudioHardwareDestroyProcessTap(tap)
  exit(0)
}

status = AudioDeviceStart(device, proc)
guard status == noErr else { fail("start \(status)") }
print("ok")

// Beat detection on loudness alone: a beat is a window clearly louder than the second before
// it, at most one every 250 ms. The loudest recent window sets what level 9 means.
let parent = getppid()
var history = [Float](repeating: 0, count: 20)
var next = 0
var peak: Float = 0.05
var previous: Float = 0
var sinceBeat = 100
var said = (level: 0, beat: false)
var quiet = 0

let timer = DispatchSource.makeTimerSource(queue: queue)
timer.schedule(deadline: .now() + .milliseconds(50), repeating: .milliseconds(50))
timer.setEventHandler {
  if getppid() != parent { stop() }
  let loudness = samples > 0 ? (sumOfSquares / Float(samples)).squareRoot() : 0
  #if DEBUG_EARS
    FileHandle.standardError.write("samples \(samples) loudness \(loudness)\n".data(using: .utf8)!)
  #endif
  sumOfSquares = 0
  samples = 0
  let average = history.reduce(0, +) / Float(history.count)
  history[next] = loudness
  next = (next + 1) % history.count
  peak = max(loudness, peak * 0.998, 0.05)
  sinceBeat += 1
  let audible = loudness > 0.003
  let beat = audible && sinceBeat >= 5 && loudness > average * 1.35 && loudness > previous
  if beat { sinceBeat = 0 }
  previous = loudness
  let level = audible ? min(9, max(1, Int((loudness / peak * 9).rounded()))) : 0
  quiet += 1
  if level != said.level || beat || said.beat || quiet >= 20 {
    print("\(level) \(beat ? 1 : 0)")
    said = (level, beat)
    quiet = 0
  }
}
timer.resume()

var signalSources: [DispatchSourceSignal] = []
for signal in [SIGTERM, SIGINT, SIGHUP] {
  Foundation.signal(signal, SIG_IGN)
  let source = DispatchSource.makeSignalSource(signal: signal, queue: queue)
  source.setEventHandler { stop() }
  source.resume()
  signalSources.append(source)
}

dispatchMain()
