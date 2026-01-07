(() => {
  const body = document.body;
  const close = () => body.classList.remove("nav-open");

  document.addEventListener("click", (e) => {
    const t = e.target;

    // close when clicking overlay or explicit close triggers
    if (t.matches("[data-nav-close]") || t.closest("[data-nav-close]")) return close();

    // close when clicking any link inside the drawer
    if (t.closest(".nav-drawer") && t.closest("a")) return close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();
