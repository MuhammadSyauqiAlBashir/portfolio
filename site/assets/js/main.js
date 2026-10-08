// Theme toggle, header shadow, reveal-on-scroll, muted loops that play only while visible, and lazy demos.
const root = document.documentElement
const dark = () => root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches

document.querySelector(".theme")?.addEventListener("click", () => {
  const next = dark() ? "light" : "dark"
  root.dataset.theme = next
  try { localStorage.setItem("theme", next) } catch { /* private mode */ }
})

const top = document.querySelector(".top")
const onScroll = () => top?.classList.toggle("scrolled", scrollY > 8)
addEventListener("scroll", onScroll, { passive: true })
onScroll()

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches

if ("IntersectionObserver" in window) {
  const rv = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target) }
  }, { rootMargin: "0px 0px -8% 0px" })
  document.querySelectorAll(".reveal").forEach((n) => rv.observe(n))

  const vids = new IntersectionObserver((es) => {
    for (const e of es) {
      const v = e.target
      if (e.isIntersecting && !reduce) { if (v.preload === "none") v.preload = "auto"; v.play().catch(() => {}) } else v.pause()
    }
  }, { threshold: 0.25 })
  document.querySelectorAll("video[data-autoplay]").forEach((v) => {
    v.muted = true
    vids.observe(v)
    if (reduce) { v.controls = true; v.preload = "metadata" }
  })

  const demos = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { demos.unobserve(e.target); load(e.target) }
  }, { rootMargin: "300px 0px" })
  document.querySelectorAll("[data-demo]").forEach((n) => demos.observe(n))
} else {
  document.querySelectorAll(".reveal").forEach((n) => n.classList.add("in"))
  document.querySelectorAll("[data-demo]").forEach(load)
}

async function load(node) {
  const name = node.dataset.demo
  try {
    const mod = await import(new URL(`./demos/${name}.js${import.meta.url.includes("?") ? import.meta.url.slice(import.meta.url.indexOf("?")) : ""}`, import.meta.url))
    node.replaceChildren()
    mod.mount(node)
  } catch (err) {
    console.error(err)
    node.textContent = "This demo couldn't load. Try refreshing the page."
  }
}
