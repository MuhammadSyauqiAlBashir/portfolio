// BashGames demo: the 3D dice from Ludo / Monopoly-style games, then a round of Spot the Twin.
// The die is ported from bashgames/web/js/games/common.js (a CSS 3D cube that tumbles and lands on its value).
import { h } from "./util.js"

const PIP_CELLS = { 1: [5], 2: [3, 7], 3: [3, 5, 7], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] }
const FACE_ROT = { 1: [0, 0], 6: [0, 180], 3: [0, -90], 4: [0, 90], 5: [-90, 0], 2: [90, 0] }

function makeDie(size) {
  const cube = h("div", { class: "cube" })
  for (const n of [1, 2, 3, 4, 5, 6]) {
    const face = h("div", { class: `face f${n}` })
    for (let c = 1; c <= 9; c++) face.append(h("i", { class: PIP_CELLS[n].includes(c) ? `pip${n === 1 ? " red" : ""}` : "" }))
    cube.append(face)
  }
  const node = h("div", { class: "die3d" }, cube, h("span", { class: "die-shadow" }))
  node.style.setProperty("--s", `${size}px`)
  let cur = [-18, 24], from = cur, to = cur, t0 = 0, dur = 0, raf = 0
  const apply = (rx, ry, lift = 0) => { cube.style.transform = `translateY(${-lift}px) rotateX(${rx}deg) rotateY(${ry}deg)` }
  const tick = () => {
    const p = Math.min(1, (performance.now() - t0) / dur)
    const e = 1 - (1 - p) ** 3
    const lift = Math.sin(Math.min(1, p * 1.25) * Math.PI) * size * 0.55
    apply(from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * e, lift)
    if (p < 1) raf = requestAnimationFrame(tick); else { cur = to; node.classList.remove("rolling") }
  }
  apply(...cur)
  return {
    el: node,
    show(n) { const [fx, fy] = FACE_ROT[n]; cur = [fx - 14, fy + 18]; apply(...cur) },
    roll(n) {
      const [fx, fy] = FACE_ROT[n]
      cancelAnimationFrame(raf)
      from = cur
      const spinX = 360 * (2 + Math.floor(Math.random() * 2)), spinY = 360 * (1 + Math.floor(Math.random() * 2))
      to = [fx - 14 + spinX + Math.round(from[0] / 360) * 360, fy + 18 + spinY + Math.round(from[1] / 360) * 360]
      t0 = performance.now(); dur = 900
      node.classList.add("rolling")
      raf = requestAnimationFrame(tick)
    },
  }
}

// ---- Spot the Twin: projective plane of order 7 → 57 cards × 8 pictures; any two cards share exactly one.
const SYMBOLS = ["🍎", "🍌", "🍇", "🍉", "🍓", "🍕", "🍩", "🍦", "🧀", "🥕", "🌶️", "🍄", "🌵", "🌻", "🍀", "🌙", "⭐", "☀️", "⚡",
  "❄️", "🔥", "💧", "🌈", "⛄", "🐱", "🐶", "🐸", "🐵", "🐼", "🦁", "🐢", "🐙", "🦋", "🐝", "🐞", "🦀", "🐘", "🦒",
  "🐧", "🦉", "🚗", "🚀", "✈️", "🚲", "⚽", "🎈", "🎸", "🎁", "🔑", "⏰", "💡", "📷", "✏️", "🎩", "👓", "❤️", "💎"]
function deck(n = 7) {
  const cards = []
  for (let i = 0; i <= n; i++) cards.push([0, ...Array.from({ length: n }, (_, j) => 1 + i * n + j)])
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) cards.push([i + 1, ...Array.from({ length: n }, (_, k) => n + 1 + n * k + ((i * k + j) % n))])
  return cards
}
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
const rnd = (a, b) => a + Math.random() * (b - a)

function cardSvg(symbols, onTap) {
  const NS = "http://www.w3.org/2000/svg"
  const g = document.createElementNS(NS, "svg")
  g.setAttribute("viewBox", "0 0 100 100")
  g.setAttribute("class", "km")
  const bg = document.createElementNS(NS, "circle")
  for (const [k, v] of Object.entries({ cx: 50, cy: 50, r: 49, class: "km-bg" })) bg.setAttribute(k, v)
  g.append(bg)
  const syms = shuffle(symbols.slice())
  const base = rnd(0, 360)
  syms.forEach((sym, i) => {
    let x, y, r
    if (i === 0) { x = 50 + rnd(-2, 2); y = 50 + rnd(-2, 2); r = rnd(11.5, 14) } else {
      const a = (base + (i - 1) * 360 / 7 + rnd(-7, 7)) * Math.PI / 180, d = rnd(30, 32.5)
      x = 50 + d * Math.cos(a); y = 50 + d * Math.sin(a); r = rnd(7.5, 10.5)
    }
    const rot = Math.random() < 0.7 ? Math.round(rnd(-45, 45)) : Math.round(rnd(0, 360))
    const t = document.createElementNS(NS, "text")
    for (const [k, v] of Object.entries({ x, y, "font-size": r * 1.85, "text-anchor": "middle", "dominant-baseline": "central", transform: `rotate(${rot} ${x} ${y})`, class: "km-sym" })) t.setAttribute(k, v)
    t.textContent = SYMBOLS[sym]
    const hit = document.createElementNS(NS, "circle")
    for (const [k, v] of Object.entries({ cx: x, cy: y, r: r * 0.95, class: "km-hit" })) hit.setAttribute(k, v)
    hit.addEventListener("pointerdown", (e) => { e.preventDefault(); onTap(sym, t) })
    g.append(t, hit)
  })
  return g
}

export function mount(node) {
  // dice
  const d1 = makeDie(78), d2 = makeDie(78)
  d1.show(5); d2.show(3)
  const total = h("p", { class: "dice-total", text: "Tap Roll to throw" })
  const roll = h("button", { class: "btn primary", type: "button", text: "Roll the dice" })
  roll.addEventListener("click", () => {
    const a = 1 + Math.floor(Math.random() * 6), b = 1 + Math.floor(Math.random() * 6)
    d1.roll(a); setTimeout(() => d2.roll(b), 90)
    total.textContent = "…"
    setTimeout(() => { total.textContent = a === b ? `${a} + ${b} = ${a + b} · doubles, roll again!` : `${a} + ${b} = ${a + b}` }, 1000)
  })
  const dice = h("div", { class: "panel dice-panel" }, h("div", { class: "dice-row" }, d1.el, d2.el), total, roll)

  // spot the twin
  const D = deck()
  let order = shuffle([...D.keys()]), center = order.pop(), mine = order.pop()
  let found = 0, t0 = 0, best = null, frozen = 0
  const cards = h("div", { class: "km-wrap" })
  const msg = h("p", { class: "km-msg", text: "Find the one picture both cards share, and tap it." })
  const stats = h("p", { class: "hint", text: "" })
  const start = h("button", { class: "btn primary", type: "button", text: "Deal" })
  const draw = () => {
    const shared = D[center].find((x) => D[mine].includes(x))
    const tap = (sym, t) => {
      if (performance.now() < frozen) return
      if (sym === shared) {
        const secs = (performance.now() - t0) / 1000
        found++
        best = best == null ? secs : Math.min(best, secs)
        msg.textContent = `${SYMBOLS[sym]} in ${secs.toFixed(1)} s`
        stats.textContent = `Found ${found} · best ${best.toFixed(1)} s · ${order.length} cards left`
        t.classList.add("got")
        center = mine
        if (order.length < 1) order = shuffle([...D.keys()].filter((k) => k !== center))
        mine = order.pop()
        setTimeout(draw, 350)
      } else {
        frozen = performance.now() + 1200
        cards.classList.remove("miss"); void cards.offsetWidth; cards.classList.add("miss")
        msg.textContent = "Not that one: frozen for a moment."
      }
    }
    cards.replaceChildren(
      h("figure", {}, cardSvg(D[center], tap), h("figcaption", { text: "Middle card" })),
      h("figure", {}, cardSvg(D[mine], tap), h("figcaption", { text: "Your card" })))
    t0 = performance.now()
  }
  start.addEventListener("click", () => { start.textContent = "New cards"; msg.textContent = "Go!"; order = shuffle([...D.keys()]); center = order.pop(); mine = order.pop(); draw() })
  start.textContent = "New cards"
  const twin = h("div", { class: "panel" }, h("h4", { text: "Spot the Twin" }), cards, msg, h("div", { class: "row" }, start, stats))
  draw()
  twin.append(h("p", { class: "hint", text: "57 cards, 8 pictures each. Any two cards always share exactly one picture: the deck is a finite projective plane of order 7." }))
  node.append(h("div", { class: "split" }, dice, twin))
}
