(function () {
  const {
    getConfig,
    escapeHtml,
    escapeAttr,
    applySiteName,
    applySeo,
    setupNav,
    setupLoader,
    setupFooterYear,
    setupBackToTop,
  } = window.PortfolioCommon;

  const config = getConfig();
  const resume = config.resume || {};

  function formatDate(iso) {
    if (!iso) return "";
    const date = new Date(iso + "T12:00:00");
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function contactLine() {
    const parts = [];
    if (resume.phone) {
      const tel = String(resume.phone).replace(/[^\d+]/g, "");
      parts.push(
        `<a href="tel:${escapeAttr(tel)}">${escapeHtml(resume.phone)}</a>`
      );
    }
    if (config.email) {
      parts.push(
        `<a href="mailto:${escapeAttr(config.email)}">${escapeHtml(config.email)}</a>`
      );
    }
    if (resume.portfolioUrl) {
      parts.push(
        `<a href="${escapeAttr(resume.portfolioUrl)}" target="_blank" rel="noopener noreferrer">Portfolio</a>`
      );
    }
    if (config.location) parts.push(escapeHtml(config.location));
    return parts.join('<span class="resume-doc-sep" aria-hidden="true">·</span>');
  }

  function renderResumeDocument() {
    const el = document.getElementById("resume-document");
    if (!el) return false;

    const summary =
      resume.summary || config.about || config.tagline || "";
    const skills = config.skills || [];
    const experience = config.experience || [];
    const education = config.education || resume.education || [];
    const projects =
      resume.includeProjects && config.projects
        ? config.projects.slice(0, 4)
        : [];

    const skillsHtml = skills.length
      ? `<ul class="resume-doc-skills">${skills
          .map((s) => `<li>${escapeHtml(s)}</li>`)
          .join("")}</ul>`
      : "";

    const experienceHtml = experience.length
      ? experience
          .map((item) => {
            const highlights = item.highlights || [];
            const highlightsHtml = highlights.length
              ? `<ul class="resume-doc-list">${highlights
                  .map((h) => `<li>${escapeHtml(h)}</li>`)
                  .join("")}</ul>`
              : "";
            return `
              <article class="resume-doc-entry">
                <div class="resume-doc-entry-head">
                  <h3 class="resume-doc-entry-title">${escapeHtml(item.role)}</h3>
                  <time class="resume-doc-entry-period">${escapeHtml(item.period || "")}</time>
                </div>
                <p class="resume-doc-entry-sub">${escapeHtml(item.company || "")}</p>
                ${
                  item.description
                    ? `<p class="resume-doc-entry-desc">${escapeHtml(item.description)}</p>`
                    : ""
                }
                ${highlightsHtml}
              </article>`;
          })
          .join("")
      : "";

    const educationHtml = education.length
      ? education
          .map((item) => {
            return `
              <article class="resume-doc-entry">
                <div class="resume-doc-entry-head">
                  <h3 class="resume-doc-entry-title">${escapeHtml(item.degree || "")}</h3>
                  <time class="resume-doc-entry-period">${escapeHtml(item.period || "")}</time>
                </div>
                <p class="resume-doc-entry-sub">${escapeHtml(item.school || "")}</p>
                ${
                  item.details
                    ? `<p class="resume-doc-entry-desc">${escapeHtml(item.details)}</p>`
                    : ""
                }
              </article>`;
          })
          .join("")
      : "";

    const projectsHtml = projects.length
      ? projects
          .map((p) => {
            const tags = p.tags?.length
              ? `<p class="resume-doc-tags">${p.tags
                  .map((t) => `<span>${escapeHtml(t)}</span>`)
                  .join("")}</p>`
              : "";
            const outcome = p.outcome
              ? `<p class="resume-doc-entry-desc">${escapeHtml(p.outcome)}</p>`
              : "";
            return `
              <article class="resume-doc-entry">
                <h3 class="resume-doc-entry-title">${escapeHtml(p.title)}</h3>
                <p class="resume-doc-entry-desc">${escapeHtml(p.description || "")}</p>
                ${outcome}
                ${tags}
              </article>`;
          })
          .join("")
      : "";

    const social = config.social || [];
    const socialHtml = social.length
      ? `<ul class="resume-doc-social">${social
          .map(
            (s) =>
              `<li><a href="${escapeAttr(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.label)}</a></li>`
          )
          .join("")}</ul>`
      : "";

    const achievements = resume.achievements || [];
    const achievementsHtml = achievements.length
      ? `<ul class="resume-doc-list">${achievements
          .map(
            (a) =>
              `<li><strong>${escapeHtml(a.title)}</strong>${a.description ? ` — ${escapeHtml(a.description)}` : ""}</li>`
          )
          .join("")}</ul>`
      : "";

    el.innerHTML = `
      <header class="resume-doc-header">
        <h2 class="resume-doc-name">${escapeHtml(config.name || "Resume")}</h2>
        ${
          config.roleTitle
            ? `<p class="resume-doc-role">${escapeHtml(config.roleTitle)}</p>`
            : ""
        }
        ${contactLine() ? `<p class="resume-doc-contact">${contactLine()}</p>` : ""}
      </header>
      ${
        summary
          ? `<section class="resume-doc-section" aria-labelledby="resume-summary-heading">
        <h3 id="resume-summary-heading" class="resume-doc-section-title">Summary</h3>
        <p class="resume-doc-summary">${escapeHtml(summary)}</p>
      </section>`
          : ""
      }
      ${
        skillsHtml
          ? `<section class="resume-doc-section" aria-labelledby="resume-skills-heading">
        <h3 id="resume-skills-heading" class="resume-doc-section-title">Skills</h3>
        ${skillsHtml}
      </section>`
          : ""
      }
      ${
        experienceHtml
          ? `<section class="resume-doc-section" aria-labelledby="resume-exp-heading">
        <h3 id="resume-exp-heading" class="resume-doc-section-title">Experience</h3>
        ${experienceHtml}
      </section>`
          : ""
      }
      ${
        educationHtml
          ? `<section class="resume-doc-section" aria-labelledby="resume-edu-heading">
        <h3 id="resume-edu-heading" class="resume-doc-section-title">Education</h3>
        ${educationHtml}
      </section>`
          : ""
      }
      ${
        projectsHtml
          ? `<section class="resume-doc-section" aria-labelledby="resume-proj-heading">
        <h3 id="resume-proj-heading" class="resume-doc-section-title">Projects</h3>
        ${projectsHtml}
      </section>`
          : ""
      }
      ${
        achievementsHtml
          ? `<section class="resume-doc-section" aria-labelledby="resume-achievements-heading">
        <h3 id="resume-achievements-heading" class="resume-doc-section-title">Achievements</h3>
        ${achievementsHtml}
      </section>`
          : ""
      }
      ${
        socialHtml
          ? `<section class="resume-doc-section resume-doc-section--links" aria-labelledby="resume-links-heading">
        <h3 id="resume-links-heading" class="resume-doc-section-title">Links</h3>
        ${socialHtml}
      </section>`
          : ""
      }
    `;

    return el.innerHTML.trim().length > 0;
  }

  function initResume() {
    applySiteName("Resume");
    applySeo({
      titleSuffix: "Resume",
      description: resume.intro || "Resume — experience, skills, and download.",
      path: "resume.html",
    });

    const file = resume.file || "assets/resume.pdf";
    const intro = document.getElementById("resume-intro");
    const download = document.getElementById("resume-download");
    const openTab = document.getElementById("resume-open");
    const frame = document.getElementById("resume-frame");
    const objectEl = document.getElementById("resume-object");
    const objectLink = document.getElementById("resume-object-link");
    const documentEl = document.getElementById("resume-document");
    const updated = document.getElementById("resume-updated");
    const actions = document.getElementById("resume-actions");
    const viewer = document.getElementById("resume-viewer");

    renderResumeDocument();

    if (intro && resume.intro) intro.textContent = resume.intro;

    if (updated && resume.lastUpdated) {
      updated.textContent = `Last updated ${formatDate(resume.lastUpdated)}`;
      updated.hidden = false;
    }

    if (download) {
      download.href = file;
      download.setAttribute("download", resume.downloadName || "resume.pdf");
      if (resume.downloadLabel) {
        const label = download.querySelector("span");
        if (label) label.textContent = resume.downloadLabel;
      }
    }
    if (openTab) {
      openTab.href = file;
      openTab.target = "_blank";
      openTab.rel = "noopener noreferrer";
    }
    if (objectLink) objectLink.href = file;

    const pdfPages = document.getElementById("resume-pdf-pages");
    let pdfRenderToken = 0;

    async function renderPdfPages(url) {
      const container = pdfPages;
      if (!container || typeof pdfjsLib === "undefined") return false;

      const token = ++pdfRenderToken;
      const pdfjs = window.pdfjsLib;
      pdfjs.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

      try {
        const pdf = await pdfjs.getDocument(url).promise;
        if (token !== pdfRenderToken) return true;

        container.innerHTML = "";
        const width =
          container.clientWidth ||
          container.parentElement?.clientWidth ||
          Math.min(900, window.innerWidth - 48);
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
          const page = await pdf.getPage(pageNum);
          if (token !== pdfRenderToken) return true;

          const base = page.getViewport({ scale: 1 });
          const scale = (width / base.width) * pixelRatio;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.className = "resume-pdf-page";
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${viewport.width / pixelRatio}px`;
          canvas.style.height = `${viewport.height / pixelRatio}px`;

          await page.render({
            canvasContext: canvas.getContext("2d"),
            viewport,
          }).promise;

          const wrap = document.createElement("div");
          wrap.className = "resume-pdf-page-wrap";
          wrap.appendChild(canvas);
          container.appendChild(wrap);
        }

        container.hidden = false;
        if (frame) {
          frame.hidden = true;
          frame.removeAttribute("src");
        }
        if (objectEl) {
          objectEl.hidden = true;
          objectEl.removeAttribute("data");
        }
        return true;
      } catch {
        container.hidden = true;
        container.innerHTML = "";
        return false;
      }
    }

    function showEmbedFallback(url) {
      const useObject = window.location.protocol === "file:";

      if (pdfPages) {
        pdfPages.hidden = true;
        pdfPages.innerHTML = "";
      }
      if (viewer) {
        viewer.classList.add("resume-viewer--pdf");
        viewer.classList.add("resume-viewer--embed");
      }

      if (useObject && objectEl) {
        objectEl.data = url;
        objectEl.hidden = false;
        if (frame) {
          frame.hidden = true;
          frame.removeAttribute("src");
        }
        return;
      }

      if (objectEl) {
        objectEl.hidden = true;
        objectEl.removeAttribute("data");
      }
      if (frame) {
        frame.src = url;
        frame.hidden = false;
      }
    }

    async function showPdfPreview() {
      const url = file;

      if (documentEl) documentEl.hidden = true;
      if (viewer) {
        viewer.classList.add("resume-viewer--pdf");
        viewer.classList.remove("resume-viewer--embed");
      }

      if (window.location.protocol !== "file:") {
        const rendered = await renderPdfPages(url);
        if (rendered) return;
      }

      showEmbedFallback(url);
    }

    function showInlineFallback() {
      pdfRenderToken += 1;
      if (pdfPages) {
        pdfPages.hidden = true;
        pdfPages.innerHTML = "";
      }
      if (frame) {
        frame.hidden = true;
        frame.removeAttribute("src");
      }
      if (objectEl) {
        objectEl.hidden = true;
        objectEl.removeAttribute("data");
      }
      if (documentEl) documentEl.hidden = false;
      if (viewer) {
        viewer.classList.remove("resume-viewer--pdf");
        viewer.classList.remove("resume-viewer--embed");
      }
    }

    if (!file) {
      if (actions) actions.hidden = true;
      showInlineFallback();
      return;
    }

    showPdfPreview();

    if (frame) {
      frame.addEventListener("error", showInlineFallback);
    }

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      if (!viewer?.classList.contains("resume-viewer--pdf")) return;
      if (pdfPages?.hidden) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        showPdfPreview();
      }, 200);
    });
  }

  function setupMotion() {
    if (typeof gsap === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const pageHeroItems = document.querySelectorAll(".page-hero-inner > *");
    if (pageHeroItems.length) {
      gsap.from(pageHeroItems, {
        y: 36,
        opacity: 0,
        stagger: 0.08,
        duration: 0.85,
        ease: "power3.out",
        delay: 0.2,
      });
    }

    const resumeViewer = document.querySelector(".resume-viewer");
    if (resumeViewer) {
      gsap.from(resumeViewer, {
        scrollTrigger: { trigger: resumeViewer, start: "top 88%" },
        y: 28,
        duration: 0.85,
        ease: "power3.out",
      });
    }
  }

  initResume();
  setupNav();
  setupLoader();
  setupFooterYear();
  setupBackToTop();
  requestAnimationFrame(setupMotion);
})();
