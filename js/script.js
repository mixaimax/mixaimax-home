/* =========================================================
   AI TOOLKIT HUB — shared script
   ========================================================= */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initHeaderScroll();
  initActiveNavA11y();
  initTerminal();
  initToolFilter();
  initContactForm();
  initFooterYear();
  initScrollReveal();
  initBackToTop();
});

/* ---------- Mark the current page for assistive tech ---------- */
function initActiveNavA11y() {
  document.querySelectorAll(".nav-links a.active").forEach((a) => {
    a.setAttribute("aria-current", "page");
  });
}

/* ---------- Mobile nav ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  const header = document.querySelector(".site-header");
  if (!toggle || !links || !header) return;

  const backdrop = document.createElement("div");
  backdrop.className = "nav-backdrop";
  document.body.appendChild(backdrop);

  function closeMenu() {
    links.classList.remove("open");
    backdrop.classList.remove("show");
    toggle.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    links.classList.add("open");
    backdrop.classList.add("show");
    toggle.setAttribute("aria-expanded", "true");
  }

  toggle.addEventListener("click", () => {
    links.classList.contains("open") ? closeMenu() : openMenu();
  });

  backdrop.addEventListener("click", closeMenu);
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

/* ---------- Sticky header shadow on scroll ---------- */
function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const setState = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  setState();
  window.addEventListener("scroll", setState, { passive: true });
}

/* ---------- Hero terminal typing effect ---------- */
function initTerminal() {
  const cmdEl = document.querySelector("[data-terminal-cmd]");
  const resultsEl = document.querySelector("[data-terminal-results]");
  if (!cmdEl || !resultsEl) return;

  const command = 'toolkit search --role=sysadmin --min-rating=4.5';
  const results = [
    { name: "PatchPilot", tag: "Security", rating: "4.8" },
    { name: "LogSense AI", tag: "Monitoring", rating: "4.7" },
    { name: "InfraCopilot", tag: "DevOps", rating: "4.6" },
  ];

  let i = 0;
  cmdEl.textContent = "";
  const cursor = document.createElement("span");
  cursor.className = "terminal-cursor";
  cmdEl.after(cursor);

  if (prefersReducedMotion) {
    cmdEl.textContent = command;
    showResults();
    return;
  }

  function typeChar() {
    if (i < command.length) {
      cmdEl.textContent += command.charAt(i);
      i++;
      setTimeout(typeChar, 28);
    } else {
      setTimeout(showResults, 350);
    }
  }

  function showResults() {
    results.forEach((r, idx) => {
      const row = document.createElement("div");
      row.className = "terminal-result";
      row.style.animationDelay = `${idx * 0.12}s`;
      row.innerHTML =
        `<span>${r.name} <span class="r-tag">#${r.tag.toLowerCase()}</span></span>` +
        `<span class="r-tag">★ ${r.rating}</span>`;
      resultsEl.appendChild(row);
    });
  }

  // start when hero scrolls into view (or immediately if already visible)
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          typeChar();
          io.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );
  io.observe(cmdEl);
}

/* ---------- AI Tools page: category filter ---------- */
function initToolFilter() {
  const chips = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll("[data-category]");
  const note = document.querySelector("[data-results-note]");
  const empty = document.querySelector("[data-empty-state]");
  if (!chips.length || !cards.length) return;

  chips.forEach((chip) => {
    chip.setAttribute("aria-pressed", chip.classList.contains("is-active") ? "true" : "false");

    chip.addEventListener("click", () => {
      chips.forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      const filter = chip.getAttribute("data-filter");
      let visibleCount = 0;

      cards.forEach((card) => {
        const cats = card.getAttribute("data-category").split(" ");
        const match = filter === "all" || cats.includes(filter);
        card.style.display = match ? "" : "none";
        if (match) visibleCount++;
      });

      if (note) {
        note.textContent = `Showing ${visibleCount} tool${visibleCount === 1 ? "" : "s"}`;
      }
      if (empty) {
        empty.classList.toggle("show", visibleCount === 0);
      }
    });
  });
}

/* ---------- Contact form validation ---------- */
function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const status = form.querySelector(".form-status");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    const fields = form.querySelectorAll("[data-field]");
    fields.forEach((field) => {
      const input = field.querySelector("input, textarea, select");
      const rule = field.getAttribute("data-rule");
      const value = input.value.trim();
      let fieldValid = true;

      if (rule === "required" && value === "") fieldValid = false;
      if (rule === "email") {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) fieldValid = false;
      }
      if (rule === "minlength10" && value.length < 10) fieldValid = false;

      field.classList.toggle("has-error", !fieldValid);
      if (!fieldValid) valid = false;
    });

    if (valid) {
      status.textContent = "Thanks — your message has been queued. We reply within one business day.";
      status.classList.add("show");
      form.reset();
    } else {
      status.classList.remove("show");
    }
  });

  form.querySelectorAll("input, textarea").forEach((input) => {
    input.addEventListener("input", () => {
      const field = input.closest("[data-field]");
      if (field) field.classList.remove("has-error");
    });
  });
}

/* ---------- Footer year ---------- */
function initFooterYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

/* ---------- Scroll-reveal on entry ---------- */
function initScrollReveal() {
  const targets = document.querySelectorAll("[data-reveal], [data-reveal-group]");
  if (!targets.length) return;

  if (prefersReducedMotion) {
    targets.forEach((t) => t.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  targets.forEach((t) => io.observe(t));
}

/* ---------- Back to top ---------- */
function initBackToTop() {
  const btn = document.createElement("button");
  btn.className = "back-to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = "&uarr;";
  document.body.appendChild(btn);

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  const setState = () => btn.classList.toggle("show", window.scrollY > 500);
  setState();
  window.addEventListener("scroll", setState, { passive: true });
}
