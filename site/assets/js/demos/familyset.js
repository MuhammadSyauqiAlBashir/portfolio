// Couple Suits demo: build a matching family set. Family-set discount as in the shop: 3+ people 5 %, 5+ people 10 %.
// Prices are demo values.
import { h, rp } from "./util.js"

const ROLES = { Father: ["Shirt", "Polo"], Mother: ["Dress", "Blouse"], Son: ["Shirt", "Polo"], Daughter: ["Dress", "Blouse"], Baby: ["Romper"], Grandpa: ["Shirt"], Grandma: ["Dress", "Blouse"] }
const PRICE = { Shirt: 289000, Polo: 249000, Dress: 359000, Blouse: 279000, Romper: 179000 }
const KID = { Son: 0.7, Daughter: 0.7, Baby: 1 }
const SIZES = { adult: ["S", "M", "L", "XL", "XXL"], kid: ["2", "4", "6", "8", "10", "12"], Baby: ["0–6 m", "6–12 m", "12–18 m"] }
const RULES = [[5, 10], [3, 5]]

export function mount(node) {
  const people = [{ role: "Father", cut: "Shirt", size: "L" }, { role: "Mother", cut: "Dress", size: "M" }]
  const list = h("div", { class: "fs-list" })
  const sum = h("div", { class: "fs-sum" })
  const add = h("div", { class: "fs-add" }, h("span", { class: "hint", text: "Add someone:" }),
    ...Object.keys(ROLES).map((r) => { const b = h("button", { class: "btn small", type: "button", text: `+ ${r}` }); b.addEventListener("click", () => { people.push({ role: r, cut: ROLES[r][0], size: sizes(r)[1] || sizes(r)[0] }); draw() }); return b }))
  const sizes = (r) => r === "Baby" ? SIZES.Baby : KID[r] ? SIZES.kid : SIZES.adult
  const price = (p) => Math.round(PRICE[p.cut] * (KID[p.role] && p.role !== "Baby" ? KID[p.role] : 1) / 1000) * 1000
  function draw() {
    list.replaceChildren(...people.map((p, i) => {
      const cut = h("select", { "aria-label": `${p.role} cut` }, ...ROLES[p.role].map((c) => h("option", { value: c, text: c, selected: c === p.cut })))
      const size = h("select", { "aria-label": `${p.role} size` }, ...sizes(p.role).map((s) => h("option", { value: s, text: s, selected: s === p.size })))
      cut.addEventListener("change", () => { p.cut = cut.value; draw() })
      size.addEventListener("change", () => { p.size = size.value })
      const rm = h("button", { class: "fs-rm", type: "button", "aria-label": `Remove ${p.role}`, text: "×" })
      rm.addEventListener("click", () => { people.splice(i, 1); draw() })
      return h("div", { class: "fs-row" }, h("b", { text: p.role }), cut, size, h("span", { class: "fs-p", text: rp(price(p)) }), rm)
    }))
    const n = people.length, sub = people.reduce((a, p) => a + price(p), 0)
    const rule = RULES.find(([m]) => n >= m)
    const disc = rule ? Math.round(sub * rule[1] / 100) : 0
    const next = RULES.slice().reverse().find(([m]) => n < m)
    sum.replaceChildren(
      h("div", {}, h("span", { text: `Subtotal (${n} ${n === 1 ? "person" : "people"})` }), h("span", { text: rp(sub) })),
      h("div", { class: disc ? "ok" : "" }, h("span", { text: rule ? `Family set discount ${rule[1]}%` : "Family set discount" }), h("span", { text: disc ? `−${rp(disc)}` : "—" })),
      h("div", { class: "fs-total" }, h("span", { text: "Total" }), h("b", { text: rp(sub - disc) })),
      h("p", { class: "hint", text: next ? `Add ${next[0] - n} more for ${next[1]}% off the whole set.` : "Best family discount unlocked." }))
  }
  node.append(h("div", { class: "split" }, h("div", { class: "panel" }, h("h4", { text: "Who's wearing it?" }), list, add),
    h("div", { class: "panel" }, h("h4", { text: "Your set" }), sum, h("p", { class: "hint", text: "In the shop, the cart is re-priced on the server and the order goes out through WhatsApp. Demo prices." }))))
  draw()
}
