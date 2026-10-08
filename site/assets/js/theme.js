// Runs before first paint: applies the visitor's saved light/dark choice (if any) so the page never flashes.
(function () {
  try {
    var t = localStorage.getItem("theme")
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t)
  } catch (e) { /* storage blocked: follow the system setting */ }
})()
