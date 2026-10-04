(function () {
  const {
    getConfig,
    escapeHtml,
    escapeAttr,
    applySiteName,
    applySeo,
    setupNav,
    setupCursor,
    setupLoader,
    setupFooterYear,
    setupBackToTop,
  } = window.PortfolioCommon;

  const config = getConfig();

  function formatDate(iso) {
    if (!iso) return "";
    const date = new Date(iso + "T12:00:00");
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function getPosts() {
    const posts = config.posts || [];
    return [...posts].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }

  function renderBlogIndex() {
    const list = document.getElementById("blog-list");
    const intro = document.getElementById("blog-intro");
    if (intro && config.blogIntro) intro.textContent = config.blogIntro;

    if (!list) return;

    const posts = getPosts();
    if (!posts.length) {
      list.innerHTML =
        '<p class="blog-empty">No posts yet. Add entries to <code>posts</code> in <code>site.config.js</code>.</p>';
      return;
    }

    list.innerHTML = posts
      .map(
        (post, i) => `
        <article class="blog-card glass" style="--i:${i}">
          <div class="blog-card-meta">
            <time datetime="${escapeAttr(post.date)}">${escapeHtml(formatDate(post.date))}</time>
            ${post.readTime ? `<span class="blog-read">${escapeHtml(post.readTime)} read</span>` : ""}
          </div>
          <h2 class="blog-card-title">
            <a href="post.html?slug=${escapeAttr(post.slug)}">${escapeHtml(post.title)}</a>
          </h2>
          <p class="blog-card-excerpt">${escapeHtml(post.excerpt)}</p>
          ${
            post.tags?.length
              ? `<ul class="blog-tags">${post.tags
                  .map((t) => `<li>${escapeHtml(t)}</li>`)
                  .join("")}</ul>`
              : ""
          }
          <a class="blog-card-link" href="post.html?slug=${escapeAttr(post.slug)}">
            Read article
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </article>`
      )
      .join("");

    window.PortfolioCommon?.refreshScrollCrestFade?.();
  }

  function getSlugFromQuery() {
    return new URLSearchParams(window.location.search).get("slug");
  }

  function renderPost() {
    const slug = getSlugFromQuery();
    const article = document.getElementById("post-article");
    const notFound = document.getElementById("post-not-found");
    if (!article) return;

    const post = (config.posts || []).find((p) => p.slug === slug);

    if (!post) {
      article.hidden = true;
      if (notFound) notFound.hidden = false;
      applySiteName("Post not found");
      applySeo({
        titleSuffix: "Post not found",
        description: config.blogIntro,
        path: "post.html",
      });
      return;
    }

    if (notFound) notFound.hidden = true;
    applySiteName(post.title);

    const meta = document.getElementById("post-meta");
    if (meta) {
      meta.innerHTML = `
        <time datetime="${escapeAttr(post.date)}">${escapeHtml(formatDate(post.date))}</time>
        ${post.readTime ? `<span>${escapeHtml(post.readTime)} read</span>` : ""}
      `;
    }

    const titleEl = document.getElementById("post-title");
    if (titleEl) titleEl.textContent = post.title;

    const tagsEl = document.getElementById("post-tags");
    if (tagsEl && post.tags?.length) {
      tagsEl.innerHTML = post.tags
        .map((t) => `<li>${escapeHtml(t)}</li>`)
        .join("");
      tagsEl.hidden = false;
    } else if (tagsEl) {
      tagsEl.hidden = true;
    }

    const bodyEl = document.getElementById("post-body");
    if (bodyEl) {
      const blocks = post.body || [];
      bodyEl.innerHTML = blocks
        .map((block) => {
          if (typeof block === "string") {
            return `<p>${escapeHtml(block)}</p>`;
          }
          if (block.type === "heading") {
            return `<h2>${escapeHtml(block.text)}</h2>`;
          }
          if (block.type === "code") {
            return `<pre><code>${escapeHtml(block.text)}</code></pre>`;
          }
          return `<p>${escapeHtml(block.text || "")}</p>`;
        })
        .join("");
    }

    applySeo({
      title: `${config.name} · ${post.title}`,
      titleSuffix: post.title,
      description: post.excerpt || config.blogIntro,
      path: `post.html?slug=${post.slug}`,
      type: "article",
    });
  }

  function setupBlogMotion() {
    if (typeof gsap === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".page-hero-inner > *", {
      y: 36,
      opacity: 0,
      stagger: 0.08,
      duration: 0.85,
      ease: "power3.out",
      delay: 0.2,
    });

    gsap.utils.toArray(".blog-card, .post-article").forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    });
  }

  const page = document.body.dataset.page;
  if (page === "blog") {
    applySiteName("Blog");
    applySeo({
      titleSuffix: "Blog",
      description: config.blogIntro,
      path: "blog.html",
    });
    renderBlogIndex();
  } else if (page === "post") {
    renderPost();
  }

  setupNav();
  setupCursor();
  setupLoader();
  setupFooterYear();
  setupBackToTop();

  requestAnimationFrame(setupBlogMotion);
})();
