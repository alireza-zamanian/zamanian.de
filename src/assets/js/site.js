// "Save as PDF" on the CV page.
for (const button of document.querySelectorAll("[data-print]")) {
  button.addEventListener("click", () => window.print());
}

// Light/dark toggle. Default follows the system; a manual choice is stored on this device only
// (localStorage, no cookie). The early script in <head> applies it before first paint.
const toggle = document.querySelector("[data-theme-toggle]");
if (toggle) {
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const current = () => root.dataset.theme || (systemDark.matches ? "dark" : "light");
  const sync = () => {
    toggle.setAttribute("aria-pressed", String(current() === "dark"));
    const paper = getComputedStyle(root).getPropertyValue("--paper").trim();
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) meta.content = paper;
  };
  toggle.hidden = false;
  toggle.addEventListener("click", () => {
    const next = current() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    sync();
  });
  systemDark.addEventListener("change", sync);
  sync();
}
