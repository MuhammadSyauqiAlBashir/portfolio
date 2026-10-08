// lyrsync demo: synced lyrics with tap-to-sync. The song "starts somewhere in the middle" (like music already playing
// in a café); tap the line you're hearing and the lyrics lock on. Melody played by the browser; public-domain song.
import { h } from "./util.js"

const BPM = 100, beat = 60 / BPM
const A = [[60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2]]
const B = [[65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2]]
const C = [[67, 1], [67, 1], [65, 1], [65, 1], [64, 1], [64, 1], [62, 2]]
// "Twinkle, Twinkle, Little Star", words by Jane Taylor (1806), traditional melody: public domain.
const LINES = [["Twinkle, twinkle, little star,", A], ["How I wonder what you are!", B], ["Up above the world so high,", C],
  ["Like a diamond in the sky.", C], ["Twinkle, twinkle, little star,", A], ["How I wonder what you are!", B]]
const T = []
let acc = 0
for (const [, notes] of LINES) { T.push(acc); acc += notes.reduce((a, [, b]) => a + b, 0) * beat }
const SECS = acc

let AC = null
const ac = () => (AC ||= new (window.AudioContext || window.webkitAudioContext)())
const hz = (m) => 440 * 2 ** ((m - 69) / 12)

export function mount(node) {
  const lines = LINES.map(([text], i) => {
    const b = h("button", { class: "ly-line", type: "button", text })
    b.addEventListener("click", () => tapSync(i))
    return b
  })
  const box = h("div", { class: "ly-box" }, ...lines)
  const status = h("p", { class: "ly-status", text: "Press play: the song starts at a random point, like music that's already playing." })
  const play = h("button", { class: "btn primary", type: "button", text: "Play the song" })
  const minus = h("button", { class: "btn small", type: "button", text: "−0.5 s", disabled: true })
  const plus = h("button", { class: "btn small", type: "button", text: "+0.5 s", disabled: true })
  node.append(h("div", { class: "panel ly" }, h("div", { class: "ly-head" }, h("span", { class: "ly-dot" }), h("div", {}, h("b", { text: "Twinkle, Twinkle, Little Star" }), h("small", { text: "Traditional · words by Jane Taylor (1806) · public domain" }))),
    box, status, h("div", { class: "row" }, play, h("span", { class: "hint", text: "Nudge:" }), minus, plus)))

  let start = 0, out = null, raf = 0, offset = null, playing = false
  // song position = audio clock - start; lyrics position = song position guessed by the user's tap (+ nudges)
  function stop() {
    playing = false; cancelAnimationFrame(raf)
    try { out?.disconnect() } catch { /* gone */ }
    play.textContent = "Play again"
    minus.disabled = plus.disabled = true
  }
  play.addEventListener("click", async () => {
    if (playing) { stop(); status.textContent = "Stopped."; return }
    await ac().resume()
    const from = T[1 + Math.floor(Math.random() * 3)] + Math.random() * 2 * beat   // somewhere in lines 2–4
    out = ac().createGain(); out.gain.value = 1; out.connect(ac().destination)
    start = ac().currentTime + 0.15 - from
    let t = 0
    for (const [, notes] of LINES) for (const [m, b] of notes) {
      const at = start + t, dur = b * beat * 0.92
      if (at >= ac().currentTime) {
        const o = ac().createOscillator(), g = ac().createGain()
        o.type = "triangle"; o.frequency.value = hz(m); o.connect(g).connect(out)
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.18, at + 0.015)
        g.gain.exponentialRampToValueAtTime(0.06, at + Math.min(dur, 0.3)); g.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.05)
        o.start(at); o.stop(at + dur + 0.1)
      }
      t += b * beat
    }
    offset = null; playing = true
    play.textContent = "Stop"
    status.textContent = "Not synced yet: tap the line you're hearing."
    box.classList.add("waiting")
    lines.forEach((l) => l.classList.remove("on", "past"))
    tick()
  })
  function tapSync(i) {
    if (!playing) return
    const song = ac().currentTime - start
    offset = T[i] - song + 0.25          // the tap usually comes a little after the line starts
    box.classList.remove("waiting")
    minus.disabled = plus.disabled = false
    const err = Math.abs(T[i] - song)
    status.textContent = err < beat * 9 ? "Synced. Lyrics now follow the song; nudge if they drift." : "Synced to that line. If it's the wrong one, tap again."
  }
  minus.addEventListener("click", () => { if (offset != null) offset -= 0.5 })
  plus.addEventListener("click", () => { if (offset != null) offset += 0.5 })
  function tick() {
    const song = ac().currentTime - start
    if (song > SECS + 0.5) { stop(); status.textContent = "That's the verse. Play again and try a different line."; box.classList.remove("waiting"); return }
    if (offset != null) {
      const pos = song + offset
      let cur = -1
      T.forEach((t, i) => { if (pos >= t) cur = i })
      lines.forEach((l, i) => { l.classList.toggle("on", i === cur); l.classList.toggle("past", i < cur) })
      const el = lines[Math.max(0, cur)]
      box.scrollTo({ top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2, behavior: "smooth" })
    }
    raf = requestAnimationFrame(tick)
  }
}
