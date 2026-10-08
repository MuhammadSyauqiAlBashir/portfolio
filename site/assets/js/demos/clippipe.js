// Clip Studio demo: a synthetic walk-through of the pipeline for one clip. Nothing here is real footage:
// a drawn two-person "podcast", a made-up transcript, a generated loudness curve.
//   1 transcribe (word timings) → 2 loudness → 3 the AI picks a moment → 4 face-tracked 9:16 crop → 5 karaoke captions
import { h, visible } from "./util.js"

const SCRIPT = [ // [speaker, word, start s]
  [0, "So", 0.0], [0, "what's", 0.25], [0, "the", 0.5], [0, "one", 0.65], [0, "habit", 0.9], [0, "that", 1.25], [0, "changed", 1.45], [0, "everything?", 1.8],
  [1, "Honestly?", 2.6], [1, "Going", 3.2], [1, "to", 3.45], [1, "bed", 3.6], [1, "at", 3.85], [1, "ten.", 4.0],
  [1, "Sounds", 4.6], [1, "boring,", 4.95], [1, "but", 5.4], [1, "my", 5.6], [1, "mornings", 5.8], [1, "became", 6.2], [1, "mine.", 6.55],
  [0, "Ten?!", 7.2], [0, "That's", 7.6], [0, "illegal", 7.85], [0, "for", 8.25], [0, "a", 8.4], [0, "podcaster.", 8.5],
]
const CLIP = 9.6
const STEPS = ["Transcribe (word timings)", "Measure loudness", "AI picks the moment", "Track faces → 9:16 crop", "Burn karaoke captions"]
const PHASE = [0, 2.6, 4.2, 6.0, 7.4]   // when each step starts in the walk-through (s); the clip plays from 7.4
const TOTAL = PHASE[4] + CLIP + 1.2
const W = 480, H = 270, OW = 180, OH = 320

function speakerAt(t) { let s = 0; for (const [sp, , st] of SCRIPT) if (st <= t) s = sp; return s }
function wordIdx(t) { let k = -1; SCRIPT.forEach(([, , st], i) => { if (st <= t) k = i }); return k }
const talking = (t) => { const k = wordIdx(t); return k >= 0 && t - SCRIPT[k][2] < 0.32 && t < 9.2 }
// a loudness curve with a laugh burst after "illegal"
const LOUD = Array.from({ length: 120 }, (_, i) => {
  const t = (i / 120) * 30, base = 0.35 + 0.18 * Math.sin(i * 1.7) * Math.sin(i * 0.33)
  return Math.max(0.08, Math.min(1, base + (t > 19 && t < 22 ? 0.45 : 0) + (Math.sin(i * 12.9) * 0.07)))
})
const MOMENT = [0.33, 0.66]   // where the chosen clip sits in the 30 s source window (fraction)

function scene(g, t, people) {
  const bg = g.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, "#2b2f3a"); bg.addColorStop(1, "#191b22")
  g.fillStyle = bg; g.fillRect(0, 0, W, H)
  g.fillStyle = "rgba(255,190,120,.10)"; g.beginPath(); g.arc(W * 0.5, 40, 120, 0, 7); g.fill()
  g.fillStyle = "#3a2e26"; g.fillRect(0, H * 0.78, W, H * 0.22)        // table
  for (const p of people) {
    const sp = people.indexOf(p), talk = speakerAt(t) === sp && talking(t)
    const bob = Math.sin(t * 2.1 + sp) * 2 + (talk ? Math.sin(t * 18) * 1.2 : 0)
    g.fillStyle = p.shirt; g.beginPath(); g.roundRect(p.x - 44, H * 0.55 + bob, 88, 110, 30); g.fill()
    g.fillStyle = p.skin; g.beginPath(); g.arc(p.x, H * 0.42 + bob, 27, 0, 7); g.fill()
    g.fillStyle = p.hair; g.beginPath(); g.arc(p.x, H * 0.40 + bob, 28, Math.PI * 1.05, Math.PI * 1.95); g.fill()
    g.fillStyle = "#1a1a1a"; const ey = H * 0.41 + bob
    g.beginPath(); g.arc(p.x - 9, ey, 2.4, 0, 7); g.arc(p.x + 9, ey, 2.4, 0, 7); g.fill()
    g.fillStyle = "#6b2a2a"; g.beginPath(); g.ellipse(p.x, H * 0.47 + bob, 7, talk ? 4.5 : 1.3, 0, 0, 7); g.fill()
    g.fillStyle = "#111"; g.fillRect(p.x + (sp ? -40 : 30), H * 0.62, 8, 34); g.beginPath(); g.arc(p.x + (sp ? -36 : 34), H * 0.6, 9, 0, 7); g.fill()  // mic
  }
}

export function mount(node) {
  const src = h("canvas", { width: W, height: H, class: "cp-src", "aria-label": "Source video (drawn)" })
  const out = h("canvas", { width: OW, height: OH, class: "cp-out", "aria-label": "Vertical clip with captions" })
  const steps = h("ol", { class: "cp-steps" }, ...STEPS.map((s) => h("li", { text: s })))
  const words = h("p", { class: "cp-words" }, ...SCRIPT.map(([sp, w, st]) => h("span", { class: `sp${sp}`, title: `${st.toFixed(2)} s`, text: w + " " })))
  const wave = h("canvas", { width: 600, height: 70, class: "cp-wave", "aria-label": "Loudness" })
  const pick = h("div", { class: "cp-pick" }, h("b", { text: "Score 87 / 100" }), h("span", { text: "Hook: “The habit that sounds boring but changed everything”" }),
    h("small", { text: "No music · laughter at the end (+) · cut snapped to sentence ends · faces found in 100% of frames" }))
  const replay = h("button", { class: "btn small", type: "button", text: "Replay" })
  node.append(h("div", { class: "cp" },
    h("div", { class: "cp-left" }, steps, h("div", { class: "cp-frame" }, src), h("div", { class: "panel cp-info" }, words, wave, pick), replay),
    h("div", { class: "cp-right" }, h("div", { class: "frame phone cp-phone" }, out), h("p", { class: "hint", text: "Output: 1080×1920 in the real app" }))))

  const people = [{ x: W * 0.3, skin: "#e0b48f", hair: "#2a1d14", shirt: "#3b6ea5" }, { x: W * 0.7, skin: "#c98f68", hair: "#111", shirt: "#c2554a" }]
  const sg = src.getContext("2d"), og = out.getContext("2d"), wg = wave.getContext("2d")
  const cropW = H * 9 / 16
  let cx = people[0].x, t0 = performance.now(), raf = 0, on = false
  replay.addEventListener("click", () => { t0 = performance.now(); cx = people[0].x })

  function frame() {
    if (!on) return
    const T = ((performance.now() - t0) / 1000) % TOTAL
    if (T < 0.05) cx = people[0].x
    const phase = PHASE.filter((p) => T >= p).length - 1
    steps.querySelectorAll("li").forEach((li, i) => { li.className = i < phase ? "done" : i === phase ? "on" : "" })
    const ct = Math.max(0, T - PHASE[4])                 // clip time
    const sceneT = phase >= 4 ? ct : (T * 0.9) % CLIP
    scene(sg, sceneT, people)
    // transcript: words appear during step 1, the chosen range is marked from step 3
    const shown = phase === 0 ? Math.floor((T / PHASE[1]) * SCRIPT.length) : SCRIPT.length
    const cur = phase >= 4 ? wordIdx(ct) : -1
    ;[...words.children].forEach((s, i) => { s.classList.toggle("in", i < shown); s.classList.toggle("sel", phase >= 2); s.classList.toggle("now", i === cur) })
    // loudness
    const drawn = phase === 1 ? (T - PHASE[1]) / (PHASE[2] - PHASE[1]) : phase > 1 ? 1 : 0
    wg.clearRect(0, 0, 600, 70)
    if (phase >= 2) { wg.fillStyle = "rgba(232,89,12,.16)"; wg.fillRect(MOMENT[0] * 600, 0, (MOMENT[1] - MOMENT[0]) * 600, 70) }
    LOUD.forEach((v, i) => {
      if (i / LOUD.length > drawn) return
      const inM = phase >= 2 && i / LOUD.length >= MOMENT[0] && i / LOUD.length <= MOMENT[1]
      wg.fillStyle = inM ? "#e8590c" : "#8a8f98"
      wg.fillRect(i * 5, 66 - v * 60, 3, v * 60)
    })
    pick.classList.toggle("in", phase >= 2)
    // crop window follows the active speaker (smoothed), drawn on the source from step 4
    const target = people[speakerAt(phase >= 4 ? ct : sceneT)].x
    cx += (target - cx) * 0.06
    const x0 = Math.max(0, Math.min(W - cropW, cx - cropW / 2))
    if (phase >= 3) {
      sg.strokeStyle = "#ffd43b"; sg.lineWidth = 2; sg.setLineDash([6, 4]); sg.strokeRect(x0 + 1, 1, cropW - 2, H - 2); sg.setLineDash([])
      sg.fillStyle = "rgba(0,0,0,.45)"; sg.fillRect(0, 0, x0, H); sg.fillRect(x0 + cropW, 0, W - x0 - cropW, H)
      for (const p of people) { sg.strokeStyle = "rgba(81,207,102,.9)"; sg.lineWidth = 1.5; sg.strokeRect(p.x - 32, H * 0.3, 64, 70) }
    }
    // output phone
    og.fillStyle = "#0d0d0f"; og.fillRect(0, 0, OW, OH)
    if (phase >= 3) {
      og.drawImage(src, x0, 0, cropW, H, 0, 0, OW, OH)
    } else {
      og.fillStyle = "#777"; og.font = "13px system-ui"; og.textAlign = "center"; og.fillText("waiting for the crop…", OW / 2, OH / 2)
    }
    if (phase >= 4 && cur >= 0) {                     // karaoke captions: 3-word groups, current word highlighted
      const g0 = cur - (cur % 3), group = SCRIPT.slice(g0, g0 + 3)
      og.font = "800 17px system-ui, sans-serif"; og.textAlign = "left"; og.textBaseline = "middle"; og.lineJoin = "round"
      const texts = group.map(([, w]) => w.toUpperCase())
      const widths = texts.map((s) => og.measureText(s + " ").width)
      let x = (OW - widths.reduce((a, b) => a + b, 0)) / 2
      texts.forEach((s, i) => {
        og.lineWidth = 4; og.strokeStyle = "#000"; og.strokeText(s, x, OH * 0.72)
        og.fillStyle = g0 + i === cur ? "#ffd43b" : "#fff"; og.fillText(s, x, OH * 0.72)
        x += widths[i]
      })
    }
    raf = requestAnimationFrame(frame)
  }
  visible(node, (v) => { on = v; cancelAnimationFrame(raf); if (v) raf = requestAnimationFrame(frame) })
}
