// Financial Management demo: zero-based ("envelope") budgeting. Assign income until nothing is left unassigned.
import { h, rp } from "./util.js"

const ENV = [["Housing", 3000000], ["Groceries", 2200000], ["Transport", 800000], ["Bills & phone", 900000], ["Eating out", 600000],
  ["Giving", 600000], ["Savings", 2000000], ["Fun", 400000]]

export function mount(node) {
  let income = 12000000
  const vals = ENV.map(([, v]) => v)
  const left = h("b", { class: "env-left" })
  const leftNote = h("span", { class: "hint" })
  const bar = h("div", { class: "env-bar", "aria-hidden": "true" })
  const inc = h("input", { type: "range", min: 6000000, max: 25000000, step: 250000, value: income, "aria-label": "Monthly income" })
  const incV = h("b")
  const rows = ENV.map(([name], i) => {
    const r = h("input", { type: "range", min: 0, max: 8000000, step: 50000, value: vals[i], "aria-label": name })
    const v = h("span", { class: "env-v" })
    r.addEventListener("input", () => { vals[i] = +r.value; draw() })
    return { r, v, row: h("div", { class: "env-row" }, h("span", { class: "env-n" }, h("i", { class: `sw s${i}` }), name), r, v) }
  })
  const fill = h("button", { class: "btn small", type: "button", text: "Put the rest into Savings" })
  fill.addEventListener("click", () => { const l = income - vals.reduce((a, b) => a + b, 0); vals[6] = Math.max(0, vals[6] + l); rows[6].r.value = vals[6]; draw() })
  inc.addEventListener("input", () => { income = +inc.value; draw() })
  function draw() {
    const used = vals.reduce((a, b) => a + b, 0), l = income - used
    incV.textContent = rp(income)
    left.textContent = rp(Math.abs(l))
    left.className = `env-left ${l === 0 ? "ok" : l < 0 ? "bad" : ""}`
    leftNote.textContent = l === 0 ? "Every rupiah has a job." : l > 0 ? "left to assign" : "over-assigned: take it from another envelope"
    rows.forEach(({ v }, i) => { v.textContent = rp(vals[i]) })
    bar.replaceChildren(...vals.map((x, i) => { const s = h("i", { class: `s${i}` }); s.style.flexGrow = String(x); return s }), ...(l > 0 ? [Object.assign(h("i", { class: "rest" }), {})] : []))
    if (l > 0) bar.lastChild.style.flexGrow = String(l)
  }
  node.append(h("div", { class: "panel env" },
    h("div", { class: "env-top" }, h("label", { class: "env-inc" }, h("span", { class: "hint", text: "Monthly income" }), incV, inc),
      h("div", { class: "env-sum" }, left, leftNote, fill)),
    bar, ...rows.map((x) => x.row)))
  draw()
}
