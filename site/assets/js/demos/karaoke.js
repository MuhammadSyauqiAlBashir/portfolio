// BashGames karaoke demo: sing a public-domain melody; YIN pitch tracking every 50 ms, drawn over the melody bars.
// Pitch is folded into the melody's key and octave, so any voice (high, low, off-key start) lands on the bars.
// Everything runs in the browser: the microphone audio never leaves the device.
import { h, s } from "./util.js"

// "Twinkle, Twinkle, Little Star": melody (French folk tune, 1761) and words (Jane Taylor, 1806), public domain.
const SONG = { bpm: 96, notes: [[60, 1, "Twin-"], [60, 1, "kle"], [67, 1, "twin-"], [67, 1, "kle"], [69, 1, "lit-"], [69, 1, "tle"], [67, 2, "star,"],
  [65, 1, "how"], [65, 1, "I"], [64, 1, "won-"], [64, 1, "der"], [62, 1, "what"], [62, 1, "you"], [60, 2, "are."]] }
const DT = 0.05, COUNT_IN = 3
const beat = 60 / SONG.bpm
let t = 0
const SYL = SONG.notes.map(([m, b, w]) => { const x = { t: t * beat, len: b * beat, m, w }; t += b; return x })
const SECS = t * beat
const MIN = 58, MAX = 71
const Y = (m) => 37 - ((m - MIN) / (MAX - MIN)) * 34

let AC = null
const ac = () => (AC ||= new (window.AudioContext || window.webkitAudioContext)())
const hz = (m) => 440 * 2 ** ((m - 69) / 12)

function tone(out, midi, at, dur, vol = 0.16, type = "triangle") {
  const a = ac(), o = a.createOscillator(), g = a.createGain()
  o.type = type; o.frequency.value = hz(midi)
  o.connect(g).connect(out)
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(vol, at + 0.015)
  g.gain.exponentialRampToValueAtTime(vol * 0.4, at + Math.min(dur, 0.3))
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.05)
  o.start(at); o.stop(at + dur + 0.1)
}
function playMelody(at, vol) {
  const out = ac().createGain(); out.gain.value = 1; out.connect(ac().destination)
  for (const x of SYL) tone(out, x.m, at + x.t, x.len * 0.92, vol)
  return () => { try { out.disconnect() } catch { /* already gone */ } }
}

// YIN (de Cheveigné & Kawahara), voice range ~70–1000 Hz. Same code as BashGames' audiokit.js.
function detectPitch(buf, sr) {
  const W = 1024
  let rms = 0
  for (let i = buf.length - W; i < buf.length; i++) rms += buf[i] * buf[i]
  if (Math.sqrt(rms / W) < 0.012) return null
  const maxLag = Math.min(Math.floor(sr / 70), buf.length - W - 1), minLag = Math.floor(sr / 1000)
  const off = buf.length - W - maxLag
  const d = new Float32Array(maxLag + 1)
  for (let tau = 1; tau <= maxLag; tau++) {
    let sum = 0
    for (let i = 0; i < W; i++) { const v = buf[off + i] - buf[off + i + tau]; sum += v * v }
    d[tau] = sum
  }
  let run = 0, tau = -1
  for (let k = 1; k <= maxLag; k++) {
    run += d[k]
    const c = run ? (d[k] * k) / run : 1
    d[k] = c
    if (k > minLag && tau < 0 && c < 0.13) tau = k
    if (tau > 0 && k > tau && d[k] > d[k - 1]) break
    if (tau > 0 && d[k] < d[tau]) tau = k
  }
  if (tau < 0) return null
  const a = d[tau - 1] ?? d[tau], b = d[tau], c = d[tau + 1] ?? d[tau]
  const shift = (a - c) / (2 * (a - 2 * b + c) || 1)
  const f = sr / (tau + (Math.abs(shift) < 1 ? shift : 0))
  return 69 + 12 * Math.log2(f / 440)
}

class Mic {
  async start() {
    if (!navigator.mediaDevices?.getUserMedia || !window.AudioWorkletNode) throw new Error("This browser can't use the microphone here.")
    const a = ac()
    if (a.state !== "running") await a.resume()
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 } })
    } catch (e) {
      throw new Error(e && e.name === "NotAllowedError" ? "Microphone permission was denied. Allow it in the browser's site settings to try singing." : "The microphone couldn't start.")
    }
    if (!Mic.loaded) { await a.audioWorklet.addModule(new URL("./tap-worklet.js", import.meta.url)); Mic.loaded = true }
    this.src = a.createMediaStreamSource(this.stream)
    this.tap = new AudioWorkletNode(a, "tap")
    const mute = a.createGain(); mute.gain.value = 0
    this.src.connect(this.tap).connect(mute).connect(a.destination)
    this.rate = a.sampleRate
    this.win = new Float32Array(2048)
    this.tap.port.onmessage = (e) => { const x = e.data; this.win.copyWithin(0, x.length); this.win.set(x, this.win.length - x.length) }
  }
  pitch() { return detectPitch(this.win, this.rate) }
  stop() {
    try { this.src?.disconnect(); this.tap?.disconnect() } catch { /* gone */ }
    for (const tr of this.stream?.getTracks() || []) tr.stop()
  }
}

const refAt = (i) => { const tt = i * DT; for (const x of SYL) if (tt >= x.t && tt < x.t + x.len) return x.m; return null }
function keyShift(f) {
  const d = []
  f.forEach((v, i) => { const r = v == null ? null : refAt(i); if (r != null) d.push((((r - v) % 12) + 18) % 12 - 6) })
  if (d.length < 6) return 0
  d.sort((a, b) => a - b)
  return Math.round(d[d.length >> 1])
}
const MID = (MIN + MAX) / 2
const fold = (v, k) => v + k + 12 * Math.round((MID - v - k) / 12)

export function mount(node) {
  const lane = s("svg", { viewBox: "0 0 100 40", class: "ko-lane", preserveAspectRatio: "none" })
  for (const x of SYL) lane.append(s("rect", { x: (x.t / SECS) * 100, y: Y(x.m) - 1.3, width: Math.max(0.6, (x.len / SECS) * 100 - 0.5), height: 2.6, rx: 1.1, class: "ko-bar" }))
  const sung = s("polyline", { class: "ko-sung", points: "" })
  const head = s("line", { class: "ko-head", x1: -5, x2: -5, y1: 0, y2: 40 })
  lane.append(sung, head)
  const words = h("p", { class: "ko-words" }, ...SYL.map((x) => h("span", { text: x.w.replace(/-$/, "") + (x.w.endsWith("-") ? "" : " ") })))
  const big = h("div", { class: "ko-big", text: "" })
  const status = h("p", { class: "hint", text: "Tip: headphones help, so the mic hears you and not the guide melody." })
  const listen = h("button", { class: "btn", type: "button", text: "Listen first" })
  const sing = h("button", { class: "btn primary", type: "button", text: "Sing (uses the microphone)" })
  const guide = h("input", { type: "checkbox", checked: true, id: "ko-guide" })
  const opts = h("label", { class: "hint ko-opt", for: "ko-guide" }, guide, " Play the guide melody while I sing")
  node.append(h("div", { class: "panel ko" }, h("div", { class: "ko-stage" }, lane, big), words, h("div", { class: "row" }, listen, sing, opts), status))

  let raf = 0, stopAudio = null, mic = null, timer = 0, busy = false
  const spans = words.children
  const run = (t0, onTick) => {
    cancelAnimationFrame(raf)
    const frame = () => {
      const tt = ac().currentTime - t0
      const x = tt < 0 || tt > SECS + 0.2 ? -5 : (tt / SECS) * 100
      head.setAttribute("x1", x); head.setAttribute("x2", x)
      for (let i = 0; i < SYL.length; i++) spans[i].classList.toggle("on", tt >= SYL[i].t && (i + 1 >= SYL.length ? tt < SECS : tt < SYL[i + 1].t))
      big.textContent = tt < 0 ? String(Math.ceil(-tt)) : ""
      onTick && onTick(tt)
      if (tt <= SECS + 0.4) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
  }
  const done = () => { busy = false; listen.disabled = sing.disabled = false; clearInterval(timer); mic?.stop(); mic = null }

  listen.addEventListener("click", async () => {
    if (busy) return
    busy = true; listen.disabled = sing.disabled = true
    await ac().resume()
    const t0 = ac().currentTime + 0.2
    stopAudio = playMelody(t0, 0.18)
    sung.setAttribute("points", "")
    status.textContent = "Listening…"
    run(t0, (tt) => { if (tt > SECS + 0.3) { status.textContent = "Now try singing it."; done() } })
  })

  sing.addEventListener("click", async () => {
    if (busy) return
    busy = true; listen.disabled = sing.disabled = true
    ac().resume()
    mic = new Mic()
    try { await mic.start() } catch (e) { status.textContent = e.message; status.className = "err"; done(); return }
    status.className = "hint"
    const t0 = ac().currentTime + COUNT_IN
    const out = ac().createGain(); out.connect(ac().destination)
    for (let k = 0; k < COUNT_IN; k++) tone(out, 84, ac().currentTime + k, 0.05, 0.12, "square")
    if (guide.checked) stopAudio = playMelody(t0, 0.07)
    const f = []
    sung.setAttribute("points", "")
    status.textContent = "Sing when the countdown ends…"
    timer = setInterval(() => {
      const tt = ac().currentTime - t0
      if (tt < 0) return
      const i = Math.round(tt / DT)
      if (i > SECS / DT) return
      f[i] = mic.pitch()
      const k = keyShift(f)
      const pts = []
      f.forEach((v, j) => { if (v != null) pts.push(`${((j * DT) / SECS * 100).toFixed(2)},${Y(fold(v, k)).toFixed(2)}`) })
      sung.setAttribute("points", pts.join(" "))
    }, DT * 1000)
    run(t0, (tt) => {
      if (tt <= SECS + 0.3) return
      const k = keyShift(f)
      let ref = 0, hit = 0, voiced = 0
      for (let i = 0; i <= SECS / DT; i++) {
        const r = refAt(i)
        if (r == null) continue
        ref++
        if (f[i] != null) { voiced++; if (Math.abs(fold(f[i], k) - r) <= 1) hit++ }
      }
      const score = ref ? Math.round(100 * (0.75 * hit + 0.25 * voiced) / ref) : 0
      status.textContent = voiced < 6 ? "I couldn't hear singing. Check the microphone and try again." : `Score ${score}/100 · in tune ${Math.round(100 * hit / ref)}% of the time${k ? ` · your key: ${k > 0 ? "+" : ""}${k} semitones from the melody` : ""}`
      done()
    })
  })
}
