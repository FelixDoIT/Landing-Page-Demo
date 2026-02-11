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

// ===== Mobile menu =====
(() => {
  const menuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });

  // Close mobile menu when clicking a link
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
    });
  });
})();

// ===== Smooth scroll + Active nav + Scroll reveal + Navbar shrink =====
document.addEventListener("DOMContentLoaded", () => {
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
    const top = el.getBoundingClientRect().top + window.scrollY - getNavOffset();
    window.scrollTo({ top, behavior: "smooth" });
  }

  // 1) Navbar shrink on scroll
  if (navbar) {
    let lastScrollY = 0;
    let ticking = false;

    const onScroll = () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(() => {
          if (lastScrollY > 60) {
            navbar.classList.add("navbar-scrolled");
          } else {
            navbar.classList.remove("navbar-scrolled");
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once on load
  }

  // 2) Scroll reveal with IntersectionObserver
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
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // 3) Click nav with offset
  navLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      const id = href.replace("#", "");
      if (!id) return;
      e.preventDefault();
      scrollToId(id);
      history.pushState(null, "", `#${id}`);

      // Close mobile menu if open
      const mobileMenu = document.getElementById("mobileMenu");
      if (mobileMenu) mobileMenu.classList.remove("open");
    });
  });

  // 4) Active link highlight (scroll spy) — throttled via IntersectionObserver
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
        threshold: [0.2, 0.4, 0.6],
        rootMargin: `-${getNavOffset()}px 0px -50% 0px`,
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
