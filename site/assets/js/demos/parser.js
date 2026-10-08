// Financial Management demo: a simplified port of the app's bank-email parser and redaction (backend/fin/parsers.py,
// redact.py). Everything here is made up; the real app runs this on the server before anything is stored or sent to AI.
import { h, rp } from "./util.js"

const SAMPLES = {
  "QRIS payment": `From: Bank notifications <alerts@bank.example>
Subject: Internet Transaction Journal

Hello SITI RAHMAWATI,
You just made a transaction through mobile banking.
Here are the details of your transaction :

Status : Successful
Transaction Date : 03 Oct 2026 19:42:10
Transaction Type : QRIS Payment
Payment to : Bakso Pak Kumis
Merchant Location : BEKASI, 17141, ID
Source of Fund : TAHAPAN - 0123456789
Customer PAN : 9360 0012 3456 7890 123
Total Payment : IDR 48,500.00
Reference No. : 2026100319421088123
Questions? Reply to siti.rahma@example.com`,
  "Transfer to myself": `From: Bank notifications <alerts@bank.example>
Subject: Transfer Successful

Hello SITI RAHMAWATI,
Transfer details:

Status : Successful
Transaction Date : 05 Oct 2026 08:15:44
Transfer Type : BI-FAST Transfer
Beneficiary Name : SITI RAHMAWATI
Source of Fund : TAHAPAN - 0123456789
Transfer Amount : IDR 2,500,000.00
Admin Fee : IDR 2,500.00
Total Payment : IDR 2,502,500.00
Remarks : savings`,
  "E-wallet top-up": `From: Bank notifications <alerts@bank.example>
Subject: Internet Transaction Journal

Hello SITI RAHMAWATI,

Status : Successful
Transaction Date : 06 Oct 2026 12:01:09
Transaction Type : Transfer to Virtual Account
Company/Product Name : GOPAY TOP UP
Source of Fund : TAHAPAN - 0123456789
Total Payment : IDR 200,000.00`,
  "Failed payment": `From: Bank notifications <alerts@bank.example>
Subject: Transaction Unsuccessful

Hello SITI RAHMAWATI,

Status : Unsuccessful
Transaction Date : 07 Oct 2026 21:30:00
Transaction Type : QRIS Payment
Payment to : Kopi Senja
Total Payment : IDR 32,000.00`,
}

const KEYS = {
  status: ["status"], date: ["transaction date", "tanggal transaksi", "date"],
  type: ["transfer type", "transaction type", "jenis transaksi"],
  payee: ["payment to", "beneficiary name", "company/product name", "merchant name", "nama penerima"],
  total: ["total payment", "total pembayaran", "total"], amount: ["transfer amount", "amount", "jumlah"],
  fee: ["admin fee", "biaya admin", "fee"], source: ["source of fund", "sumber dana"], remarks: ["remarks", "berita"],
}
const WALLETS = ["gopay", "ovo", "dana", "shopeepay", "linkaja"]
const CATS = [[/bakso|kopi|warung|resto|cafe|makan|food/i, "Food & drinks"], [/grab|gojek|kai|transjakarta|pertamina/i, "Transport"],
  [/pln|token|pdam|indihome|telkomsel/i, "Bills"], [/indomaret|alfamart|superindo|market/i, "Groceries"]]
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, mei: 5, jun: 6, jul: 7, aug: 8, agu: 8, sep: 9, oct: 10, okt: 10, nov: 11, dec: 12, des: 12 }

function amount(s) {
  const m = /(?:Rp\.?|IDR)\s*([0-9][0-9.,]*)/i.exec(s || "")
  if (!m) return null
  let n = m[1].replace(/[.,]$/, "")
  const dec = /[.,]\d{2}$/.test(n)
  if (dec) n = n.slice(0, -3)
  return parseInt(n.replace(/[.,]/g, ""), 10)
}
function kv(body) {
  const out = {}
  for (const line of body.split(/\r?\n/)) {
    const i = line.indexOf(":")
    if (i < 1) continue
    const k = line.slice(0, i).trim().toLowerCase(), v = line.slice(i + 1).trim()
    if (k.length <= 40 && !(k in out)) out[k] = v
  }
  return out
}
const pick = (o, ks) => { for (const k of ks) if (o[k]) return o[k]; return "" }
const norm = (s) => s.toLowerCase().replace(/[^a-z ]/g, "").replace(/\s+/g, " ").trim()

export function parse(text) {
  const o = kv(text)
  const f = Object.fromEntries(Object.entries(KEYS).map(([k, ks]) => [k, pick(o, ks)]))
  const total = amount(f.total) ?? amount(f.amount)
  const dm = /(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})\s*(\d{1,2}[:.]\d{2})?/.exec(f.date)
  if (total == null || !dm) return null
  const holder = (/^(?:Hello|Hi|Halo|Dear|Yth\.?)\s+([^,\n]+),/im.exec(text) || [])[1] || ""
  const subject = (/^Subject:\s*(.*)$/im.exec(text) || [])[1] || ""
  const failed = /tidak berhasil|unsuccessful|failed|gagal/i.test(`${f.status} ${subject}`)
  const wallet = WALLETS.find((w) => `${f.payee} ${f.type}`.toLowerCase().includes(w)) || ""
  let kind = "Expense"
  if (wallet && /top|virtual account/i.test(`${f.payee} ${f.type}`)) kind = "E-wallet top-up (moves money, not spending)"
  else if (/transfer/i.test(f.type) && holder && norm(f.payee) === norm(holder)) kind = "Transfer between own accounts"
  const cat = kind === "Expense" ? (CATS.find(([re]) => re.test(f.payee)) || [0, "Ask on confirm"])[1] : "—"
  const mon = MONTHS[dm[2].toLowerCase()]
  const when = new Date(+dm[3], mon - 1, +dm[1])
  const acct = (/(\d{2,4})\s*$/.exec(f.source) || [])[1]
  return {
    Status: failed ? "Failed: not counted" : "Successful", Kind: kind, Amount: rp(total) + (amount(f.fee) ? ` (incl. ${rp(amount(f.fee))} fee)` : ""),
    When: `${when.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}${dm[4] ? " · " + dm[4].replace(".", ":") : ""}`,
    "Paid to": f.payee || "—", Type: f.type || "—", Account: acct ? `…${acct}` : "—", "Whose account": holder ? holder.replace(/\w\S*/g, (w) => w[0] + w.slice(1).toLowerCase()) : "—",
    Category: cat,
  }
}

export function redact(text) {
  const holder = (/^(?:Hello|Hi|Halo|Dear|Yth\.?)\s+([^,\n]+),/im.exec(text) || [])[1] || ""
  const parts = []
  const re = /(?<![\d.,])(\d(?:[ -]?\d){9,})(?!\d)|[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g
  let last = 0, m
  while ((m = re.exec(text))) {
    parts.push(text.slice(last, m.index))
    if (m[1]) { const d = m[1].replace(/\D/g, ""); parts.push(h("mark", { class: "red", text: "*".repeat(d.length - 4) + d.slice(-4) })) } else if (/bank\.example$/i.test(m[0])) parts.push(m[0])
    else parts.push(h("mark", { class: "red", text: "[email]" }))
    last = re.lastIndex
  }
  parts.push(text.slice(last))
  if (holder.length >= 3) {
    return parts.flatMap((p) => typeof p !== "string" ? [p] : p.split(new RegExp(holder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")).flatMap((x, i) => i ? [h("mark", { class: "red", text: "[owner]" }), x] : [x]))
  }
  return parts
}

export function mount(node) {
  const ta = h("textarea", { class: "code", spellcheck: false, "aria-label": "Sample bank email" })
  const seg = h("div", { class: "seg", role: "tablist" })
  const out = h("dl", { class: "kv" })
  const red = h("pre", { class: "code redacted" })
  const go = () => {
    const r = parse(ta.value)
    out.replaceChildren(...(r ? Object.entries(r).flatMap(([k, v]) => [h("dt", { text: k }), h("dd", { text: v })]) : [h("dt", { text: "Result" }), h("dd", { text: "Not a transaction email: the real app would try the AI fallback, then ask you." })]))
    red.replaceChildren(...redact(ta.value))
  }
  for (const name of Object.keys(SAMPLES)) {
    const b = h("button", { type: "button", text: name })
    b.addEventListener("click", () => { ta.value = SAMPLES[name]; seg.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); go() })
    seg.append(b)
  }
  ta.addEventListener("input", go)
  node.append(
    h("div", { class: "row" }, seg),
    h("p", { class: "hint", text: "A made-up notification. Edit it and watch the result change." }),
    h("div", { class: "split" }, ta, h("div", { class: "panel" }, h("h4", { text: "What the parser pulls out" }), out)),
    h("div", { class: "panel redact-panel" }, h("h4", { text: "What an AI would see (only if the rules fail)" }),
      h("p", { class: "hint", text: "Long numbers keep their last 4 digits, the owner's name and personal emails are removed." }), red))
  seg.firstChild.click()
}
