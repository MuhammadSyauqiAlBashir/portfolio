// JobRadar demo: the explainable score. The AI rates five parts of the fit (0–100); the server applies the user's
// weights and hard caps (same rules as backend/jr/score.py). Sample jobs are made up.
import { h } from "./util.js"

const PARTS = [["skills", "Skills"], ["seniority", "Seniority"], ["pay", "Pay"], ["eligibility", "Eligibility"], ["preferences", "Preferences"]]
const JOBS = [
  { title: "Data Engineer (GCP)", co: "Logistics scale-up · Remote (APAC)", sub: { skills: 92, seniority: 85, pay: 80, eligibility: 95, preferences: 88 },
    why: "BigQuery, Dataform, Cloud Run and Workflows all match; remote from Indonesia is allowed." },
  { title: "Odoo Developer", co: "Manufacturing group · Jakarta, hybrid", sub: { skills: 85, seniority: 80, pay: 55, eligibility: 100, preferences: 60 },
    why: "Strong Odoo match; the pay range is on the low side for the role." },
  { title: "Senior ML Engineer", co: "AI lab · On-site, Tokyo (no visa support)", sub: { skills: 45, seniority: 40, pay: 95, eligibility: 15, preferences: 50 },
    why: "Deep-learning research focus and no visa sponsorship.", core: true },
]
const CORE_CAP = 60, ELIG_CAP = 40

function score(job, w) {
  const ws = Object.values(w).reduce((a, b) => a + b, 0) || 1
  let s = Math.round(PARTS.reduce((a, [k]) => a + job.sub[k] * w[k], 0) / ws)
  const notes = []
  if (job.core && s > CORE_CAP) { notes.push(`Capped at ${CORE_CAP}: a must-have requirement is missing`); s = CORE_CAP }
  if (job.sub.eligibility <= 20 && s > ELIG_CAP) { notes.push(`Capped at ${ELIG_CAP}: probably not open to someone in Indonesia`); s = ELIG_CAP }
  return { s, notes }
}

export function mount(node) {
  const w = { skills: 40, seniority: 15, pay: 15, eligibility: 15, preferences: 15 }
  const sliders = PARTS.map(([k, label]) => {
    const r = h("input", { type: "range", min: 0, max: 60, step: 5, value: w[k], "aria-label": `${label} weight` })
    const v = h("b", { text: w[k] })
    r.addEventListener("input", () => { w[k] = +r.value; v.textContent = r.value; draw() })
    return h("label", { class: "sc-w" }, h("span", { text: label }), r, v)
  })
  const list = h("div", { class: "sc-list" })
  const reset = h("button", { class: "btn small", type: "button", text: "Reset to defaults" })
  reset.addEventListener("click", () => { Object.assign(w, { skills: 40, seniority: 15, pay: 15, eligibility: 15, preferences: 15 }); sliders.forEach((l, i) => { l.querySelector("input").value = w[PARTS[i][0]]; l.querySelector("b").textContent = w[PARTS[i][0]] }); draw() })
  function draw() {
    const rows = JOBS.map((j) => ({ j, ...score(j, w) })).sort((a, b) => b.s - a.s)
    list.replaceChildren(...rows.map(({ j, s, notes }) => {
      const band = s >= 85 ? "hi" : s >= 70 ? "mid" : "lo"
      const bars = PARTS.map(([k, label]) => { const f = h("i"); f.style.width = `${j.sub[k]}%`; return h("div", { class: "sc-bar" }, h("span", { text: label }), h("span", { class: "sc-track" }, f), h("small", { text: j.sub[k] })) })
      return h("article", { class: "sc-job" },
        h("div", { class: "sc-top" }, h("div", {}, h("b", { text: j.title }), h("small", { text: j.co })), h("span", { class: `sc-score ${band}`, text: s })),
        h("p", { class: "hint", text: j.why }), ...bars,
        ...notes.map((n) => h("p", { class: "sc-note", text: n })),
        h("p", { class: "sc-act", text: s >= 85 ? "Instant phone notification + draft" : s >= 70 ? "In the digest, draft written" : "Kept, but quiet" }))
    }))
  }
  node.append(h("div", { class: "split sc" }, h("div", { class: "panel" }, h("h4", { text: "Your weights" }), ...sliders, reset), list))
  draw()
}
