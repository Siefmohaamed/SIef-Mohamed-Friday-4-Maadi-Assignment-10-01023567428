// DOM interactions for the portfolio page.
document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const body = document.body;
  const storedTheme = localStorage.getItem("portfolio-theme");
  const themeButton = document.querySelector("#theme-toggle-button");

  const setTheme = (dark) => {
    root.classList.toggle("dark", dark);
    if (themeButton) themeButton.setAttribute("aria-pressed", String(dark));
    localStorage.setItem("portfolio-theme", dark ? "dark" : "light");
  };
  setTheme(storedTheme ? storedTheme === "dark" : root.classList.contains("dark"));
  themeButton?.addEventListener("click", () => setTheme(!root.classList.contains("dark")));

  // Keep the navigation state in sync with the section nearest the top of the viewport.
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const updateActiveLink = () => {
    const marker = window.scrollY + 125;
    let active = sections[0];
    sections.forEach((section) => {
      if (section.offsetTop <= marker) active = section;
    });
    navLinks.forEach((link) => {
      const selected = link.getAttribute("href") === `#${active?.id}`;
      link.classList.toggle("active", selected);
      if (selected) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };
  window.addEventListener("scroll", updateActiveLink, { passive: true });
  window.addEventListener("resize", updateActiveLink);
  updateActiveLink();

  // Portfolio category tabs.
  const filters = [...document.querySelectorAll(".portfolio-filter")];
  const projects = [...document.querySelectorAll(".portfolio-item")];
  filters.forEach((filter) => filter.addEventListener("click", () => {
    const category = filter.dataset.filter;
    filters.forEach((button) => {
      const selected = button === filter;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
      button.classList.toggle("bg-linear-to-r", selected);
      button.classList.toggle("from-primary", selected);
      button.classList.toggle("to-secondary", selected);
      button.classList.toggle("text-white", selected);
      if (!selected) button.classList.add("bg-white", "dark:bg-slate-800", "text-slate-600", "dark:text-slate-300");
      else button.classList.remove("bg-white", "dark:bg-slate-800", "text-slate-600", "dark:text-slate-300");
    });
    projects.forEach((project) => {
      project.hidden = category !== "all" && project.dataset.category !== category;
    });
  }));

  // Testimonial carousel. Move one card at a time and keep the provided indicators usable.
  const track = document.querySelector("#testimonials-carousel");
  const cards = [...(track?.querySelectorAll(".testimonial-card") || [])];
  const indicators = [...document.querySelectorAll(".carousel-indicator")];
  const next = document.querySelector("#next-testimonial");
  const previous = document.querySelector("#prev-testimonial");
  let currentSlide = 0;
  const visibleCards = () => window.matchMedia("(min-width: 1024px)").matches ? 3 : window.matchMedia("(min-width: 640px)").matches ? 2 : 1;
  const maxSlide = () => Math.max(0, cards.length - visibleCards());
  const paintCarousel = () => {
    if (!track || !cards.length) return;
    currentSlide = Math.min(currentSlide, maxSlide());
    track.style.transform = `translateX(${document.documentElement.dir === "rtl" ? "" : "-"}${currentSlide * cards[0].getBoundingClientRect().width}px)`;
    indicators.forEach((indicator, index) => {
      const slide = indicators.length < 2 ? 0 : Math.round((index / (indicators.length - 1)) * maxSlide());
      const selected = currentSlide === slide;
      indicator.classList.toggle("bg-accent", selected);
      indicator.classList.toggle("dark:bg-slate-600", !selected);
      indicator.setAttribute("aria-selected", String(selected));
      indicator.tabIndex = selected ? 0 : -1;
    });
  };
  next?.addEventListener("click", () => { currentSlide = currentSlide >= maxSlide() ? 0 : currentSlide + 1; paintCarousel(); });
  previous?.addEventListener("click", () => { currentSlide = currentSlide <= 0 ? maxSlide() : currentSlide - 1; paintCarousel(); });
  indicators.forEach((indicator) => indicator.addEventListener("click", () => {
    const index = Number(indicator.dataset.index) || 0;
    currentSlide = indicators.length < 2 ? 0 : Math.round((index / (indicators.length - 1)) * maxSlide());
    paintCarousel();
  }));
  window.addEventListener("resize", paintCarousel);
  paintCarousel();

  // Scroll-to-top button.
  const topButton = document.querySelector("#scroll-to-top");
  const paintTopButton = () => {
    const visible = window.scrollY > 400;
    topButton?.classList.toggle("opacity-0", !visible);
    topButton?.classList.toggle("invisible", !visible);
    topButton?.classList.toggle("opacity-100", visible);
    topButton?.classList.toggle("visible", visible);
  };
  window.addEventListener("scroll", paintTopButton, { passive: true });
  paintTopButton();
  topButton?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Appearance settings sidebar, theme colors, and font choices.
  const sidebar = document.querySelector("#settings-sidebar");
  const settingsButton = document.querySelector("#settings-toggle");
  const setSidebarOpen = (open) => {
    sidebar?.classList.toggle("translate-x-0", open);
    sidebar?.classList.toggle("translate-x-full", !open);
    sidebar?.setAttribute("aria-hidden", String(!open));
    settingsButton?.setAttribute("aria-expanded", String(open));
  };
  settingsButton?.addEventListener("click", () => setSidebarOpen(sidebar?.getAttribute("aria-hidden") === "true"));
  document.querySelector("#close-settings")?.addEventListener("click", () => setSidebarOpen(false));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") setSidebarOpen(false); });

  const colors = [
    { name: "Indigo", primary: "#6366f1", secondary: "#8b5cf6", accent: "#ec4899" },
    { name: "Blue", primary: "#3b82f6", secondary: "#06b6d4", accent: "#14b8a6" },
    { name: "Emerald", primary: "#10b981", secondary: "#14b8a6", accent: "#84cc16" },
    { name: "Rose", primary: "#f43f5e", secondary: "#ec4899", accent: "#f97316" },
    { name: "Violet", primary: "#8b5cf6", secondary: "#a855f7", accent: "#d946ef" },
    { name: "Orange", primary: "#f97316", secondary: "#f59e0b", accent: "#ef4444" },
    { name: "Teal", primary: "#14b8a6", secondary: "#06b6d4", accent: "#3b82f6" },
    { name: "Slate", primary: "#64748b", secondary: "#475569", accent: "#0ea5e9" },
  ];
  const applyColor = (color) => {
    root.style.setProperty("--color-primary", color.primary);
    root.style.setProperty("--color-secondary", color.secondary);
    root.style.setProperty("--color-accent", color.accent);
    localStorage.setItem("portfolio-colors", JSON.stringify(color));
  };
  const colorGrid = document.querySelector("#theme-colors-grid");
  colors.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "h-10 rounded-xl border-2 border-white shadow-md transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary";
    button.style.background = `linear-gradient(135deg, ${color.primary}, ${color.secondary}, ${color.accent})`;
    button.setAttribute("aria-label", `${color.name} theme`);
    button.title = color.name;
    button.addEventListener("click", () => applyColor(color));
    colorGrid?.append(button);
  });
  try {
    const savedColor = JSON.parse(localStorage.getItem("portfolio-colors"));
    if (savedColor?.primary) applyColor(savedColor);
  } catch { /* Ignore malformed saved preferences. */ }

  const fontNames = { alexandria: "Alexandria", tajawal: "Tajawal", cairo: "Cairo" };
  const applyFont = (font) => {
    Object.keys(fontNames).forEach((name) => body.classList.toggle(`font-${name}`, name === font));
    document.querySelectorAll(".font-option").forEach((option) => {
      const selected = option.dataset.font === font;
      option.classList.toggle("active", selected);
      option.setAttribute("aria-checked", String(selected));
    });
    localStorage.setItem("portfolio-font", font);
  };
  document.querySelectorAll(".font-option").forEach((option) => option.addEventListener("click", () => applyFont(option.dataset.font)));
  applyFont(localStorage.getItem("portfolio-font") || "tajawal");

  document.querySelector("#reset-settings")?.addEventListener("click", () => {
    localStorage.removeItem("portfolio-colors");
    localStorage.removeItem("portfolio-font");
    root.style.removeProperty("--color-primary");
    root.style.removeProperty("--color-secondary");
    root.style.removeProperty("--color-accent");
    applyFont("tajawal");
    applyColor(colors[0]);
  });
});
