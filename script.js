// ===== Theme toggle (Dark / Light) =====
(() => {
  const root = document.documentElement;
  const toggleBtn = document.getElementById("themeToggle");
  const storageKey = "webcraft-theme";

  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const isDark = root.classList.toggle("dark");
    localStorage.setItem(storageKey, isDark ? "dark" : "light");
  });
})();

// ===== Smooth scroll + Active nav + Scroll reveal =====
document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.style.scrollBehavior = "smooth";

  const navbar = document.getElementById("navbar");
  const navLinks = Array.from(document.querySelectorAll('a[href^="#"]')).filter(
    (a) => a.getAttribute("href").length > 1,
  );

  const sections = Array.from(document.querySelectorAll("section[id]"));

  function getNavOffset() {
    return navbar ? navbar.getBoundingClientRect().height + 12 : 80;
  }

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const top =
      el.getBoundingClientRect().top + window.scrollY - getNavOffset();
    window.scrollTo({ top, behavior: "smooth" });
  }

  // 1) Scroll reveal
  const revealEls = document.querySelectorAll(".reveal");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (!prefersReducedMotion && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // 2) Click nav with offset
  navLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      const id = href.replace("#", "");
      if (!id) return;
      e.preventDefault();
      scrollToId(id);
      history.pushState(null, "", `#${id}`);
    });
  });

  // 3) Active link highlight (scroll spy)
  const linkById = new Map();
  navLinks.forEach((a) => linkById.set(a.getAttribute("href").slice(1), a));

  function setActive(id) {
    navLinks.forEach((a) => a.classList.remove("active"));
    const a = linkById.get(id);
    if (a) a.classList.add("active");
  }

  if (sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) setActive(visible.target.id);
      },
      {
        threshold: [0.25, 0.35, 0.45, 0.55],
        rootMargin: `-${getNavOffset()}px 0px -55% 0px`,
      },
    );

    sections.forEach((sec) => sectionObserver.observe(sec));
  }

  // If page loads with hash
  if (location.hash && location.hash.length > 1) {
    const id = location.hash.slice(1);
    setTimeout(() => scrollToId(id), 50);
  }
});
