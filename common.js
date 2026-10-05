/** Shared UI helpers for all portfolio pages. */
(function () {
  function getConfig() {
    return typeof SITE !== "undefined" ? SITE : {};
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  function applySiteName(titleSuffix) {
    const config = getConfig();
    document.querySelectorAll('[data-profile="name"]').forEach((el) => {
      if (config.name) el.textContent = config.name;
    });
    if (config.name && titleSuffix) {
      document.title = `${config.name} · ${titleSuffix}`;
    }
  }

  function setupNav() {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.getElementById("nav-menu");
    const header = document.querySelector(".site-header");
    if (!toggle || !menu) return;

    const mobileMq = window.matchMedia("(max-width: 820px)");
    let scrim = document.querySelector(".nav-scrim");
    if (!scrim) {
      scrim = document.createElement("button");
      scrim.type = "button";
      scrim.className = "nav-scrim";
      scrim.hidden = true;
      scrim.setAttribute("aria-label", "Close menu");
      document.body.appendChild(scrim);
    }

    const closeNav = (opts = {}) => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      menu.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      scrim.hidden = true;
      if (opts.focusToggle) {
        toggle.focus({ preventScroll: true });
      }
    };

    const openNav = () => {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      menu.classList.add("is-open");
      document.body.classList.add("nav-open");
      if (mobileMq.matches) scrim.hidden = false;
    };

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      if (open) closeNav({ focusToggle: true });
      else openNav();
    });

    scrim.addEventListener("click", () => closeNav({ focusToggle: true }));

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeNav());
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        e.preventDefault();
        closeNav({ focusToggle: true });
      }
    });

    const onViewportChange = () => {
      if (!mobileMq.matches && document.body.classList.contains("nav-open")) {
        closeNav();
      }
    };
    if (typeof mobileMq.addEventListener === "function") {
      mobileMq.addEventListener("change", onViewportChange);
    } else if (typeof mobileMq.addListener === "function") {
      mobileMq.addListener(onViewportChange);
    }
    window.addEventListener("resize", onViewportChange, { passive: true });

    window.addEventListener(
      "scroll",
      () => {
        if (!header) return;
        header.classList.toggle("is-scrolled", window.scrollY > 40);
      },
      { passive: true }
    );

    const page = document.body.dataset.page;
    const navPage = page === "post" ? "blog" : page;
    if (navPage) {
      const active = menu.querySelector(`[data-nav-page="${navPage}"]`);
      if (active) {
        active.classList.add("is-active");
        active.setAttribute("aria-current", "page");
      }
    }
  }

  function absoluteUrl(path, siteUrl) {
    const base = (siteUrl || "").replace(/\/$/, "");
    if (!path) return base || "";
    if (/^https?:\/\//i.test(path)) return path;
    if (base) return `${base}/${path.replace(/^\//, "")}`;
    try {
      return new URL(path, window.location.href).href;
    } catch {
      return path;
    }
  }

  function setMeta(attr, content, kind) {
    if (!content) return;
    const isProperty = kind === "property";
    const selector = isProperty
      ? `meta[property="${attr}"]`
      : `meta[name="${attr}"]`;
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      if (isProperty) el.setAttribute("property", attr);
      else el.setAttribute("name", attr);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  function applySeo(pageMeta) {
    const config = getConfig();
    const seo = config.seo || {};
    const meta = pageMeta || {};
    const name = config.name || "Portfolio";
    const title =
      meta.title ||
      (meta.titleSuffix ? `${name} · ${meta.titleSuffix}` : `${name} · Portfolio`);
    const description =
      meta.description || seo.description || config.tagline || "";
    const siteUrl = seo.siteUrl || "";
    const imagePath = meta.image || seo.ogImage || "assets/og-cover.svg";
    const image = absoluteUrl(imagePath, siteUrl);
    const pagePath = meta.path || window.location.pathname.split("/").pop() || "index.html";
    const url = meta.url || absoluteUrl(pagePath, siteUrl) || window.location.href;

    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", meta.type || "website", "property");
    setMeta("og:url", url, "property");
    setMeta("og:image", image, "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
    if (seo.twitterHandle) {
      const handle = seo.twitterHandle.replace(/^@/, "");
      setMeta("twitter:site", `@${handle}`);
    }

    const existing = document.getElementById("portfolio-jsonld");
    if (existing) existing.remove();

    const sameAs = (config.social || [])
      .map((s) => s.url)
      .filter((u) => /^https?:\/\//i.test(u));
    const schema = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: config.name,
      jobTitle: config.roleTitle || config.focus,
      description,
      email: config.email ? `mailto:${config.email}` : undefined,
      url: siteUrl || url,
      image,
      sameAs: sameAs.length ? sameAs : undefined,
    };
    Object.keys(schema).forEach((key) => {
      if (schema[key] === undefined) delete schema[key];
    });
    const script = document.createElement("script");
    script.id = "portfolio-jsonld";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }

  function setupScrollSpy() {
    if (document.body.dataset.page !== "home") return;
    const menu = document.getElementById("nav-menu");
    if (!menu) return;

    const links = [...menu.querySelectorAll('a[href^="#"]')].filter((a) => {
      const id = a.getAttribute("href").slice(1);
      return id && document.getElementById(id);
    });
    if (!links.length) return;

    const sectionById = new Map();
    links.forEach((link) => {
      const id = link.getAttribute("href").slice(1);
      const section = document.getElementById(id);
      if (section) sectionById.set(id, { link, section });
    });

    const clearActive = () => {
      links.forEach((link) => {
        link.classList.remove("is-active");
        link.removeAttribute("aria-current");
      });
    };

    const setActive = (id) => {
      clearActive();
      const entry = sectionById.get(id);
      if (!entry) return;
      entry.link.classList.add("is-active");
      entry.link.setAttribute("aria-current", "true");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-42% 0px -48% 0px", threshold: [0, 0.15, 0.35, 0.55] }
    );

    sectionById.forEach(({ section }) => observer.observe(section));

    if (location.hash) {
      const id = location.hash.slice(1);
      if (sectionById.has(id)) setActive(id);
    }
  }

  function setupLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;

    const seen = sessionStorage.getItem("portfolio:seen") === "1";
    if (seen) loader.classList.add("is-fast");

    const hide = () => {
      loader.classList.add("is-done");
      document.body.classList.add("is-loaded");
      sessionStorage.setItem("portfolio:seen", "1");
      setTimeout(() => loader.remove(), seen ? 400 : 800);
    };

    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const skipWebgl = document.body.dataset.skipWebgl === "true";
    const webglReady = new Promise((resolve) => {
      if (
        skipWebgl ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        typeof THREE === "undefined" ||
        !document.getElementById("webgl")
      ) {
        resolve();
        return;
      }
      window.addEventListener("webgl-ready", resolve, { once: true });
      setTimeout(resolve, 2500);
    });

    Promise.all([fontsReady, webglReady]).then(() => {
      setTimeout(hide, seen ? 80 : 300);
    });
  }

  function setupFooterYear() {
    const el = document.getElementById("footer-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function setupScrollProgress() {
    if (document.getElementById("scroll-lume")) return;

    const bar = document.createElement("div");
    bar.id = "scroll-lume";
    bar.className = "scroll-lume";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-valuenow", "0");
    bar.setAttribute("aria-label", "Page scroll progress");
    bar.innerHTML =
      '<div class="scroll-lume__shell">' +
      '<div class="scroll-lume__ticks" aria-hidden="true"></div>' +
      '<div class="scroll-lume__channel">' +
      '<div class="scroll-lume__beam scroll-lume__beam--echo"></div>' +
      '<div class="scroll-lume__beam"></div>' +
      "</div>" +
      '<div class="scroll-lume__cap" aria-hidden="true">' +
      '<span class="scroll-lume__cap-ring"></span>' +
      '<span class="scroll-lume__cap-core"></span>' +
      "</div>" +
      "</div>";
    document.body.prepend(bar);

    const shell = bar.querySelector(".scroll-lume__shell");
    const channel = bar.querySelector(".scroll-lume__channel");
    const beams = bar.querySelectorAll(".scroll-lume__beam");
    const cap = bar.querySelector(".scroll-lume__cap");
    let ticking = false;
    let scrollIdleTimer = 0;

    function measure() {
      const root = document.documentElement;
      const scrollTop = root.scrollTop || document.body.scrollTop;
      const max = Math.max(0, root.scrollHeight - root.clientHeight);
      const ratio = max > 0 ? scrollTop / max : 0;
      const pct = Math.min(100, Math.max(0, ratio * 100));
      const shellRect = shell.getBoundingClientRect();
      const channelRect = channel.getBoundingClientRect();
      const channelOffset = channelRect.left - shellRect.left;
      const x = channelOffset + ratio * channelRect.width;

      beams.forEach((beam) => {
        beam.style.transform = `scale3d(${ratio}, 1, 1)`;
      });
      if (cap) {
        cap.style.transform = `translate3d(${x}px, -50%, 0) translateX(-50%)`;
      }

      bar.setAttribute("aria-valuenow", String(Math.round(pct)));
      bar.classList.toggle("is-complete", pct >= 99.5);
      if (scrollTop > 4) bar.classList.add("is-active");
      bar.classList.add("is-scrolling");
      window.clearTimeout(scrollIdleTimer);
      scrollIdleTimer = window.setTimeout(() => {
        bar.classList.remove("is-scrolling");
      }, 180);

      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    if (shell) {
      new ResizeObserver(onScroll).observe(shell);
    }
    measure();
  }

  const SCROLL_CREST_SELECTOR =
    "#main > *, .site-footer, #main .blog-card, #main .tilt-card";

  function collectScrollCrestTargets() {
    return Array.from(document.querySelectorAll(SCROLL_CREST_SELECTOR)).filter(
      (el) => !el.closest(".site-header, .scroll-lume, .loader")
    );
  }

  function setupScrollCrestFade() {
    if (document.body.dataset.scrollCrest === "off") return;

    let veil = document.getElementById("scroll-crest-fade");
    if (!veil) {
      veil = document.createElement("div");
      veil.id = "scroll-crest-fade";
      veil.className = "scroll-crest-fade";
      veil.setAttribute("aria-hidden", "true");
      document.body.appendChild(veil);
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let targets = collectScrollCrestTargets();
    targets.forEach((el) => el.classList.add("scroll-crest-target"));

    let raf = 0;

    function fadeBounds() {
      const header = document.querySelector(".site-header");
      const headerBottom = header
        ? header.getBoundingClientRect().bottom
        : parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue("--header-h")
          ) || 96;
      const extra = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--scroll-fade-extra")
      ) || 52;
      const fadeStart = headerBottom;
      const fadeEnd = headerBottom + extra;
      return { fadeStart, fadeEnd };
    }

    function applyOpacity(el, fadeStart, fadeEnd) {
      const r = el.getBoundingClientRect();
      if (r.top >= fadeEnd) {
        el.style.removeProperty("opacity");
        return;
      }
      if (r.bottom <= fadeStart) {
        el.style.opacity = "0";
        return;
      }
      if (r.top >= fadeStart) {
        const t = (r.top - fadeStart) / Math.max(1, fadeEnd - fadeStart);
        el.style.opacity = String(Math.max(0, Math.min(1, t)));
        return;
      }
      el.style.removeProperty("opacity");
    }

    function measure() {
      raf = 0;
      if (reduced) return;
      const { fadeStart, fadeEnd } = fadeBounds();
      targets.forEach((el) => applyOpacity(el, fadeStart, fadeEnd));
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(measure);
    }

    function refreshTargets() {
      targets = collectScrollCrestTargets();
      targets.forEach((el) => el.classList.add("scroll-crest-target"));
      measure();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("load", refreshTargets, { once: true });

    const header = document.querySelector(".site-header");
    if (header && typeof ResizeObserver !== "undefined") {
      new ResizeObserver(onScroll).observe(header);
    }

    measure();

    window.PortfolioCommon.refreshScrollCrestFade = refreshTargets;
  }

  function setupBackToTop() {
    document.querySelectorAll('a[href="#top"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const anchor = document.getElementById("top");
        if (anchor) {
          anchor.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: reduced ? "auto" : "smooth" });
        }
        if (document.body.classList.contains("nav-open")) {
          const toggle = document.querySelector(".nav-toggle");
          const menu = document.getElementById("nav-menu");
          const scrim = document.querySelector(".nav-scrim");
          if (toggle) {
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Open menu");
          }
          if (menu) menu.classList.remove("is-open");
          if (scrim) scrim.hidden = true;
          document.body.classList.remove("nav-open");
        }
      });
    });
  }

  window.PortfolioCommon = {
    getConfig,
    escapeHtml,
    escapeAttr,
    applySiteName,
    applySeo,
    absoluteUrl,
    setupNav,
    setupScrollSpy,
    setupLoader,
    setupFooterYear,
    setupBackToTop,
    setupScrollProgress,
    setupScrollCrestFade,
    refreshScrollCrestFade: () => {},
  };

  function bootSharedUi() {
    setupScrollProgress();
    setupScrollCrestFade();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootSharedUi);
  } else {
    bootSharedUi();
  }
})();
