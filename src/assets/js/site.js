// "Save as PDF" on the CV page. Everything else on the site works without JavaScript.
for (const button of document.querySelectorAll("[data-print]")) {
  button.addEventListener("click", () => window.print());
}
