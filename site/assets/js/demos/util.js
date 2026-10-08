// Tiny DOM helpers shared by the demos (no inline styles in HTML: CSP allows style changes only via the CSSOM).
export function h(tag, props = {}, ...kids) {
  const n = document.createElement(tag)
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue
    if (k === "class") n.className = v
    else if (k === "text") n.textContent = v
    else if (k === "style") Object.assign(n.style, v)
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v)
    else if (k in n && typeof v !== "string") n[k] = v
    else n.setAttribute(k, v === true ? "" : v)
  }
  for (const c of kids.flat()) if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c)))
  return n
}
const NS = "http://www.w3.org/2000/svg"
export function s(tag, attrs = {}, ...kids) {
  const n = document.createElementNS(NS, tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue
    if (k === "text") n.textContent = v
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v)
    else n.setAttribute(k, v)
  }
  for (const c of kids.flat()) if (c) n.append(c)
  return n
}
export const rp = (n) => "Rp" + Math.round(n).toLocaleString("id-ID")
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x))
export const visible = (node, cb) => {
  const io = new IntersectionObserver((es) => cb(es[0].isIntersecting), { threshold: 0.1 })
  io.observe(node)
  return io
}
