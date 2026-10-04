(function () {
  const common = window.PortfolioCommon;
  const config = common ? common.getConfig() : typeof SITE !== "undefined" ? SITE : {};
  const escapeHtml = common ? common.escapeHtml : (s) => String(s);
  const escapeAttr = common ? common.escapeAttr : (s) => String(s);

  let activeProjectFilter = "all";

  function isExternal(url) {
    return /^https?:\/\//i.test(url);
  }

  function applyProfile() {
    document.querySelectorAll('[data-profile="name"]').forEach((el) => {
      if (config.name) el.textContent = config.name;
    });

    const fields = [
      "tagline",
      "focus",
      "location",
      "about",
      "availability",
      "heroLine1",
      "heroLine2",
      "heroLine3",
      "messageIntro",
      "roleTitle",
      "now",
    ];
    fields.forEach((key) => {
      document.querySelectorAll(`[data-profile="${key}"]`).forEach((el) => {
        if (config[key]) el.textContent = config[key];
      });
    });

    const nowBlock = document.getElementById("hero-now");
    if (nowBlock) {
      nowBlock.hidden = !config.now;
    }

    const projectsIntro = document.getElementById("projects-intro");
    if (projectsIntro && config.projectsIntro) {
      projectsIntro.textContent = config.projectsIntro;
    }

    const contactLead = document.getElementById("contact-lead");
    if (contactLead && config.contactLead) {
      contactLead.textContent = config.contactLead;
    }

    const bookUrl = config.bookCallUrl?.trim();
    const bookLabel = config.bookCallLabel || "Book a call";
    const heroBook = document.getElementById("hero-book-call");
    const contactBook = document.getElementById("contact-book-call");
    [heroBook, contactBook].forEach((el) => {
      if (!el) return;
      if (bookUrl) {
        el.hidden = false;
        el.href = bookUrl;
        el.querySelector("span").textContent = bookLabel;
        if (isExternal(bookUrl)) {
          el.target = "_blank";
          el.rel = "noopener noreferrer";
        }
      } else {
        el.hidden = true;
      }
    });

    const emailEl = document.getElementById("contact-email");
    if (emailEl && config.email) {
      emailEl.href = `mailto:${config.email}`;
      emailEl.textContent = config.email;
    }

    if (common) {
      common.applySeo({
        titleSuffix: "Portfolio",
        path: "index.html",
        description: config.seo?.description || config.tagline,
      });
    }
  }

  function renderGithubHighlight() {
    const wrap = document.getElementById("github-highlight");
    const gh = config.githubHighlight;
    if (!wrap || !gh?.title) return;
    wrap.hidden = false;
    wrap.innerHTML = `
      <span class="github-spotlight-label">Open source</span>
      <h3 class="github-spotlight-title">${escapeHtml(gh.title)}</h3>
      <p class="github-spotlight-desc">${escapeHtml(gh.description || "")}</p>
      <a class="project-cta" href="${escapeAttr(gh.url || "#")}"${
      isExternal(gh.url) ? ' target="_blank" rel="noopener noreferrer"' : ""
    }>
        <span>${escapeHtml(gh.label || "View on GitHub")}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>`;
  }

  const SKILL_ICON_CDN =
    "https://cdn.jsdelivr.net/npm/simple-icons@11.14.0/icons";

  const SKILL_META = {
    java: { slug: "openjdk", brand: "#ED8B00" },
    python: { slug: "python", brand: "#3776AB" },
    c: { slug: "c", brand: "#A8B9CC" },
    javascript: { slug: "javascript", brand: "#F7DF1E" },
    typescript: { slug: "typescript", brand: "#3178C6" },
    html5: { slug: "html5", brand: "#E34F26" },
    css3: { slug: "css3", brand: "#1572B6" },
    react: { slug: "react", brand: "#61DAFB" },
    vite: { slug: "vite", brand: "#646CFF" },
    nodejs: { slug: "nodedotjs", brand: "#339933" },
    fastapi: { slug: "fastapi", brand: "#009688" },
    socketio: { slug: "socketdotio", brand: "#010101" },
    mongodb: { slug: "mongodb", brand: "#47A248" },
    postgresql: { slug: "postgresql", brand: "#4169E1" },
    restapis: { slug: "openapi", brand: "#6BA539" },
    docker: { slug: "docker", brand: "#2496ED" },
    linux: { slug: "linux", brand: "#FCC624" },
    git: { slug: "git", brand: "#F05032" },
    github: { slug: "github", brand: "#f4f2ff" },
    androidstudio: { slug: "androidstudio", brand: "#3DDC84" },
    machinelearning: { slug: "tensorflow", brand: "#FF6F00" },
    pytorch: { slug: "pytorch", brand: "#EE4C2C" },
    ibm: { slug: "ibm", brand: "#052FAD" },
    figma: { slug: "figma", brand: "#F24E1E" },
    threejs: { slug: "threedotjs", brand: "#ffffff" },
    firebase: { slug: "firebase", brand: "#FFCA28" },
    computernetworking: { slug: "cisco", brand: "#1BA0D7" },
    webgl: { slug: "webgl", brand: "#990000" },
    ollama: { slug: "ollama", brand: "#ffffff" },
    leaflet: { slug: "openstreetmap", brand: "#7EBC6F" },
    huggingface: { slug: "huggingface", brand: "#FFD21E" },
  };

  function skillMetaKey(name) {
    return String(name).toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function resolveSkillMeta(name) {
    const key = skillMetaKey(name);
    const meta = SKILL_META[key];
    if (meta) {
      return {
        label: name,
        slug: meta.slug,
        brand: meta.brand,
        iconUrl: `${SKILL_ICON_CDN}/${meta.slug}.svg`,
      };
    }
    const initial = String(name).trim().charAt(0).toUpperCase() || "?";
    return { label: name, slug: null, brand: "#a78bfa", initial };
  }

  function renderSkills() {
    const list = document.getElementById("skills-list");
    if (!list || !config.skills) return;
    list.innerHTML = config.skills
      .map((skill, i) => {
        const meta = resolveSkillMeta(skill);
        const iconMarkup = meta.iconUrl
          ? `<img class="skill-tile__img" src="${escapeAttr(meta.iconUrl)}" alt="" width="32" height="32" loading="lazy" decoding="async" />`
          : `<span class="skill-tile__monogram" aria-hidden="true">${escapeHtml(meta.initial)}</span>`;
        return `
        <li class="skill-tile" style="--i:${i};--skill-brand:${escapeAttr(meta.brand)}">
          <span class="skill-tile__glow" aria-hidden="true"></span>
          <span class="skill-tile__icon">${iconMarkup}</span>
          <span class="skill-tile__name">${escapeHtml(meta.label)}</span>
        </li>`;
      })
      .join("");
  }

  function renderServices() {
    const grid = document.getElementById("services-grid");
    const services = config.services || [];
    if (!grid || !services.length) {
      const section = document.getElementById("services");
      if (section) section.hidden = true;
      return;
    }
    grid.innerHTML = services
      .map(
        (item, i) => `
        <article class="service-card glass tilt-card" style="--i:${i}" data-tilt>
          <div class="service-card-shine" aria-hidden="true"></div>
          <span class="service-index">0${i + 1}</span>
          <h3 class="service-title">${escapeHtml(item.title)}</h3>
          <p class="service-desc">${escapeHtml(item.description)}</p>
          ${
            item.tags?.length
              ? `<ul class="service-tags">${item.tags
                  .map((t) => `<li>${escapeHtml(t)}</li>`)
                  .join("")}</ul>`
              : ""
          }
        </article>`
      )
      .join("");
  }

  function renderEducation() {
    const intro = document.getElementById("education-intro");
    const list = document.getElementById("education-list");
    const items = config.education || [];

    if (intro && config.educationIntro) intro.textContent = config.educationIntro;
    if (!list || !items.length) return;

    list.innerHTML = items
      .map((item, i) => {
        const pursuing = item.status === "pursuing";
        const badgeLabel = pursuing ? "Pursuing" : "Completed";
        const badgeClass = pursuing ? "edu-badge--pursuing" : "edu-badge--completed";
        const period = item.period
          ? `<time class="edu-period" datetime="">${escapeHtml(item.period)}</time>`
          : "";
        const details = item.details
          ? `<p class="edu-details">${escapeHtml(item.details)}</p>`
          : "";
        return `
        <li class="edu-item" style="--i:${i}">
          <div class="edu-marker" aria-hidden="true"></div>
          <article class="edu-card glass">
            <div class="edu-top">
              <div class="edu-top-main">
                <span class="edu-badge ${badgeClass}">${escapeHtml(badgeLabel)}</span>
                <h3 class="edu-degree">${escapeHtml(item.degree)}</h3>
              </div>
              ${period}
            </div>
            <p class="edu-school">${escapeHtml(item.school)}</p>
            ${details}
          </article>
        </li>`;
      })
      .join("");
  }

  function renderExperience() {
    const list = document.getElementById("experience-list");
    if (!list || !config.experience) return;
    list.innerHTML = config.experience
      .map((item, i) => {
        const highlights = item.highlights || [];
        const highlightsHtml = highlights.length
          ? `<ul class="exp-highlights">${highlights
              .map((h) => `<li>${escapeHtml(h)}</li>`)
              .join("")}</ul>`
          : "";
        return `
        <li class="exp-item" style="--i:${i}">
          <div class="exp-marker" aria-hidden="true"></div>
          <div class="exp-card glass">
            <div class="exp-top">
              <h3 class="exp-role">${escapeHtml(item.role)}</h3>
              <time class="exp-period">${escapeHtml(item.period)}</time>
            </div>
            <p class="exp-company">${escapeHtml(item.company)}</p>
            <p class="exp-desc">${escapeHtml(item.description)}</p>
            ${highlightsHtml}
          </div>
        </li>`;
      })
      .join("");
  }

  function projectMedia(p, title) {
    if (p.image) {
      return `<div class="project-media">
        <img src="${escapeAttr(p.image)}" alt="${escapeAttr(title)}" loading="lazy" decoding="async" />
      </div>`;
    }
    const tag = p.tags?.[0] || "Build";
    return `<div class="project-media project-media--placeholder" aria-hidden="true">
      <span class="project-media-tag">${escapeHtml(tag)}</span>
    </div>`;
  }

  function projectLinks(p) {
    const links = [];
    if (p.liveUrl) {
      links.push(
        `<a class="project-cta" href="${escapeAttr(p.liveUrl)}" target="_blank" rel="noopener noreferrer"><span>Live</span>${arrowSvg()}</a>`
      );
    }
    if (p.repoUrl) {
      links.push(
        `<a class="project-cta" href="${escapeAttr(p.repoUrl)}" target="_blank" rel="noopener noreferrer"><span>Code</span>${arrowSvg()}</a>`
      );
    }
    if (p.link && !p.liveUrl && !p.repoUrl) {
      links.push(
        `<a class="project-cta" href="${escapeAttr(p.link)}"${
          isExternal(p.link) ? ' target="_blank" rel="noopener noreferrer"' : ""
        }><span>${escapeHtml(p.linkLabel || "View project")}</span>${arrowSvg()}</a>`
      );
    }
    return links.length
      ? `<div class="project-links">${links.join("")}</div>`
      : "";
  }

  function arrowSvg() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  function getProjectTags(projects) {
    const set = new Set();
    projects.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
    return [...set].sort((a, b) => a.localeCompare(b));
  }

  function renderProjectCard(p, i) {
    const filterTags = (p.tags || []).map((t) => t.toLowerCase()).join("|");
    const featured = p.featured ? " project-card--featured" : "";
    const outcome = p.outcome
      ? `<p class="project-outcome"><span class="project-outcome-label">Impact</span> ${escapeHtml(p.outcome)}</p>`
      : "";
    return `
      <article class="project-card glass tilt-card${featured}" style="--i:${i}" data-tilt data-filter-tags="${escapeAttr(filterTags)}">
        ${projectMedia(p, p.title)}
        <div class="project-card-body">
          <div class="project-card-shine" aria-hidden="true"></div>
          <span class="project-index">0${i + 1}</span>
          <h3 class="project-title">${escapeHtml(p.title)}</h3>
          <p class="project-desc">${escapeHtml(p.description)}</p>
          ${outcome}
          <ul class="project-tags">
            ${(p.tags || [])
              .map((t) => `<li>${escapeHtml(t)}</li>`)
              .join("")}
          </ul>
          ${projectLinks(p)}
        </div>
      </article>`;
  }

  function applyProjectFilter() {
    const cards = document.querySelectorAll("#project-grid .project-card");
    const empty = document.getElementById("project-empty");
    let visible = 0;
    cards.forEach((card) => {
      const tags = card.getAttribute("data-filter-tags") || "";
      const match =
        activeProjectFilter === "all" ||
        tags.split("|").includes(activeProjectFilter.toLowerCase());
      card.hidden = !match;
      card.classList.toggle("is-filtered-out", !match);
      if (match) visible += 1;
    });
    if (empty) empty.hidden = visible > 0;
  }

  function setupProjectFilters(projects) {
    const bar = document.getElementById("project-filters");
    if (!bar || !projects.length) return;
    const tags = getProjectTags(projects);
    if (tags.length < 2) return;
    bar.hidden = false;

    const chips = [
      { id: "all", label: "All" },
      ...tags.map((t) => ({ id: t.toLowerCase(), label: t })),
    ];

    bar.innerHTML = chips
      .map(
        (chip) =>
          `<button type="button" class="filter-chip${chip.id === "all" ? " is-active" : ""}" data-filter="${escapeAttr(chip.id)}" aria-pressed="${chip.id === "all"}">${escapeHtml(chip.label)}</button>`
      )
      .join("");

    bar.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      activeProjectFilter = btn.getAttribute("data-filter");
      bar.querySelectorAll(".filter-chip").forEach((el) => {
        const on = el.getAttribute("data-filter") === activeProjectFilter;
        el.classList.toggle("is-active", on);
        el.setAttribute("aria-pressed", String(on));
      });
      applyProjectFilter();
    });
  }

  function renderProjects() {
    const grid = document.getElementById("project-grid");
    const projects = config.projects || [];
    if (!grid || !projects.length) return;
    grid.innerHTML = projects
      .map((p, i) => renderProjectCard(p, i))
      .join("");
    setupProjectFilters(projects);
    applyProjectFilter();
  }

  function renderTestimonials() {
    const section = document.getElementById("testimonials");
    const grid = document.getElementById("testimonials-grid");
    const items = config.testimonials || [];
    if (!section || !grid || !items.length) return;
    section.hidden = false;
    grid.innerHTML = items
      .map(
        (t, i) => `
        <blockquote class="testimonial-card glass" style="--i:${i}">
          <p class="testimonial-quote">“${escapeHtml(t.quote)}”</p>
          <footer class="testimonial-footer">
            <cite class="testimonial-name">${escapeHtml(t.name)}</cite>
            <span class="testimonial-role">${escapeHtml([t.role, t.company].filter(Boolean).join(" · "))}</span>
          </footer>
        </blockquote>`
      )
      .join("");
  }

  function formatDate(iso) {
    if (!iso) return "";
    const date = new Date(iso + "T12:00:00");
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function renderWritingTeaser() {
    const section = document.getElementById("writing");
    const teaser = document.getElementById("writing-teaser");
    const posts = [...(config.posts || [])].sort((a, b) =>
      (b.date || "").localeCompare(a.date || "")
    );
    const post = posts[0];
    if (!section || !teaser || !post) return;
    section.hidden = false;
    teaser.innerHTML = `
      <div class="writing-teaser-meta">
        <time datetime="${escapeAttr(post.date)}">${escapeHtml(formatDate(post.date))}</time>
        ${post.readTime ? `<span>${escapeHtml(post.readTime)} read</span>` : ""}
      </div>
      <h3 class="writing-teaser-title">
        <a href="post.html?slug=${escapeAttr(post.slug)}">${escapeHtml(post.title)}</a>
      </h3>
      <p class="writing-teaser-excerpt">${escapeHtml(post.excerpt || "")}</p>
      <a class="project-cta" href="post.html?slug=${escapeAttr(post.slug)}">
        <span>Read article</span>
        ${arrowSvg()}
      </a>`;
  }

  function renderSocial() {
    const list = document.getElementById("social-links");
    if (!list || !config.social) return;
    list.innerHTML = config.social
      .map(
        (s) =>
          `<li><a class="social-pill magnetic" href="${escapeAttr(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.label)}</a></li>`
      )
      .join("");
  }

  function setupMessageForm() {
    const form = document.getElementById("message-form");
    const status = document.getElementById("message-status");
    const submitBtn = document.getElementById("message-submit");
    if (!form) return;

    const endpoint = config.messageFormAction?.trim();

    function showStatus(text, isError) {
      if (!status) return;
      status.textContent = text;
      status.hidden = false;
      status.classList.toggle("is-error", Boolean(isError));
      status.classList.toggle("is-success", !isError);
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const honeypot = form.querySelector('[name="_gotcha"]');
      if (honeypot?.value) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.querySelector("span").textContent = "Sending…";
      }

      if (endpoint) {
        try {
          const body = new FormData();
          body.append("name", name);
          body.append("email", email);
          body.append("message", message);
          body.append("_subject", `Portfolio message from ${name}`);

          const res = await fetch(endpoint, {
            method: "POST",
            headers: { Accept: "application/json" },
            body,
          });
          if (res.ok) {
            showStatus("Thanks — your message was sent.", false);
            form.reset();
          } else {
            showStatus("Something went wrong. Please try again or email me directly.", true);
          }
        } catch {
          showStatus("Could not send. Check your connection or use the email link above.", true);
        }
      } else if (config.email) {
        const subject = encodeURIComponent(`Portfolio message from ${name}`);
        const body = encodeURIComponent(
          `Name: ${name}\nEmail: ${email}\n\n${message}`
        );
        window.location.href = `mailto:${config.email}?subject=${subject}&body=${body}`;
        showStatus("Opening your email app to send the message.", false);
      } else {
        showStatus("Message form is not configured yet.", true);
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.querySelector("span").textContent = "Send message";
      }
    });
  }

  function setupMagnetic() {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        el.style.transform = `translate(${dx * 0.12}px, ${dy * 0.12}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });
  }

  function setupTilt() {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--rx", `${-py * 10}deg`);
        card.style.setProperty("--ry", `${px * 10}deg`);
        const mx = ((e.clientX - rect.left) / rect.width) * 100;
        const my = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mx", `${mx}%`);
        card.style.setProperty("--my", `${my}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  function setupMotion() {
    if (typeof gsap === "undefined") return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".hero-line", {
      y: 80,
      opacity: 0,
      rotateX: -40,
      stagger: 0.12,
      duration: 1.1,
      ease: "power3.out",
      delay: 0.35,
    });

    gsap.from(".hero-role, .hero-lead, .hero-actions, .hero-meta, .chip, .hero-now", {
      y: 30,
      opacity: 0,
      stagger: 0.08,
      duration: 0.9,
      ease: "power2.out",
      delay: 0.7,
    });

    gsap.utils
      .toArray(
        ".section-head, .section-lead, .about-grid > *, .github-spotlight, .services-grid, .section-link"
      )
      .forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          y: 50,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
        });
      });

    gsap.utils
      .toArray(
        ".exp-item, .edu-item, .project-card, .skill-tile, .service-card, .testimonial-card, .writing-teaser, .skills-showcase"
      )
      .forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
          y: 60,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
        });
      });

    gsap.utils.toArray(".contact-panel, .message-panel").forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
        },
        scale: 0.96,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
      });
    });
  }

  applyProfile();
  renderGithubHighlight();
  renderSkills();
  renderServices();
  renderExperience();
  renderEducation();
  renderProjects();
  renderTestimonials();
  renderWritingTeaser();
  renderSocial();

  if (common) {
    common.setupNav();
    common.setupScrollSpy();
    common.setupCursor();
    common.setupLoader();
    common.setupFooterYear();
    common.setupBackToTop();
  }

  setupMessageForm();

  requestAnimationFrame(() => {
    setupMagnetic();
    setupTilt();
    setupMotion();
  });
})();
