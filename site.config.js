/** Edit this file to personalize your portfolio. */
const SITE = {
  name: "Ratul Ray",
  roleTitle: "MCA · AI & Deep Learning (IBM) · Full-stack & AIML",
  heroLine1: "Crafting",
  heroLine2: "immersive",
  heroLine3: "digital worlds.",
  tagline:
    "I design and ship AI-driven web products — from conversational assistants and real-time apps to geospatial disaster intelligence.",
  availability: "Open to internships · Full-time · Remote",
  now:
    "Pursuing MCA (AI & Deep Learning, IBM) at Assam Downtown University — building JENNIE, SURAKSHA AI, and full-stack projects.",
  focus: "AI/ML · Full-stack · Product engineering",
  location: "Guwahati, Assam · Remote-friendly",
  about:
    "Postgraduate student in MCA with specialization in Artificial Intelligence and Deep Learning (IBM collaboration). Strong foundation in programming, machine learning, networking, and system design — with hands-on experience from IBM and Kareng Technologies internships and research-led builds.",
  email: "ratulcr143@gmail.com",
  bookCallUrl: "",
  bookCallLabel: "Book a call",
  contactLead:
    "Hiring for a product team or need a build partner? Email me or book a short intro — I reply within 1–2 business days.",
  messageIntro:
    "Prefer a quick note? Send a message — include timeline, budget range, and what you're building.",
  projectsIntro:
    "Selected builds with measurable outcomes. Filter by stack or open a live demo.",
  seo: {
    /** Set to your live URL when deployed (no trailing slash). Used for OG URLs & sitemap. */
    siteUrl: "",
    description:
      "Ratul Ray — AI/ML & full-stack developer. Projects, experience, resume, and contact.",
    ogImage: "assets/og-cover.svg",
    twitterHandle: "",
  },
  /**
   * Optional: Formspree (or similar) endpoint for real submissions.
   * Example: "https://formspree.io/f/your-form-id"
   * Leave empty to open the visitor's email app with a pre-filled message.
   */
  messageFormAction: "",
  resume: {
    file: "assets/resume.pdf",
    downloadName: "Ratul-Ray-Resume.pdf",
    downloadLabel: "Download PDF",
    lastUpdated: "2026-03-01",
    intro: "View or download my resume (PDF) below.",
    phone: "9365409125",
    portfolioUrl: "https://ray-systems-portfolio.web.app",
    summary:
      "Postgraduate student pursuing a Master of Computer Applications (MCA) with specialization in Artificial Intelligence and Deep Learning (IBM Collaboration) at Assam Downtown University. Strong academic foundation in programming, machine learning, computer networking, and system logic. Demonstrated ability to design and implement AI-driven solutions through research projects and internships. Motivated to apply advanced AI and deep learning techniques to real-world problem statements.",
    achievements: [
      {
        title: "NASA Space Apps Challenge 2026",
        description:
          "Participated in “Be An Earth System Trend Detective!” — analyzed NASA Earth-system datasets for temporal and regional environmental trends, data-driven visualizations, and statistical significance of observed changes.",
      },
      {
        title: "Smart India Hackathon 2026",
        description:
          "Developed SURAKSHA AI for SIH26206 (Disaster Management) — real-time disaster risk intelligence for risk assessment, monitoring, geospatial visualization, and response planning.",
      },
    ],
    includeProjects: true,
  },
  educationIntro:
    "Degrees and programs I've completed—and what I'm pursuing now—aligned with my resume.",
  education: [
    {
      degree: "Master of Computer Applications (MCA)",
      school: "Assam Downtown University, Guwahati",
      period: "2025 — 2027",
      status: "pursuing",
      details:
        "Specialization: Artificial Intelligence and Deep Learning (in collaboration with IBM).",
    },
    {
      degree: "B.Sc. in Information Technology",
      school: "Assam Downtown University, Guwahati",
      period: "2021 — 2024",
      status: "completed",
      details: "Major: Mobile Applications and Information Security · 8.04 CGPA.",
    },
    {
      degree: "Higher Secondary (Science)",
      school: "Royal Public Senior Secondary School, Dhubri",
      period: "",
      status: "completed",
      details: "",
    },
    {
      degree: "HSLC",
      school: "Shankardev Shishu Niketan, Gauripur",
      period: "",
      status: "completed",
      details: "",
    },
  ],
  blogIntro:
    "Thoughts on engineering, design, and shipping real work.",
  githubHighlight: {
    title: "Portfolio V1",
    description: "This site — WebGL atmosphere, config-driven content, accessible motion.",
    url: "https://github.com",
    label: "View source",
  },
  services: [
    {
      title: "Web applications",
      description:
        "Dashboards, SaaS flows, and marketing sites with polished UX, auth, and production deploys.",
      tags: ["React", "TypeScript", "Node"],
    },
    {
      title: "APIs & integrations",
      description:
        "REST and event-driven backends, third-party integrations, and documentation your team can trust.",
      tags: ["Node", "PostgreSQL", "OpenAPI"],
    },
    {
      title: "MVPs & prototypes",
      description:
        "Scope to a shippable v1 in weeks — clear milestones, weekly demos, and handoff you can extend.",
      tags: ["Full-stack", "Rapid delivery"],
    },
    {
      title: "Performance & quality",
      description:
        "Audits for Core Web Vitals, bundle size, and reliability — with a prioritized fix list.",
      tags: ["Profiling", "A11y", "DX"],
    },
  ],
  testimonials: [
    {
      quote:
        "Rishav has this strange ability to look at a messy problem and see the architecture hiding underneath it. Give him a question, and sooner or later it comes back as a system you can actually use.",
      name: "Bhumika Deka",
      role: "Business Analyst",
      company: "Assam Downtown University",
    },
    {
      quote:
        "Ratul consistently turned ambiguous requirements into shippable features. Communication was clear and the UI quality stood out.",
      name: "Engineering lead",
      role: "Product team",
      company: "Previous collaboration",
    },
    {
      quote:
        "Delivered our MVP ahead of schedule with clean code and sensible defaults. Easy to hand off to the rest of the team.",
      name: "Founder",
      role: "Early-stage startup",
      company: "Client project",
    },
  ],
  posts: [
    {
      slug: "shipping-side-projects",
      title: "How I ship side projects without burning out",
      date: "2025-08-14",
      readTime: "6 min",
      tags: ["Productivity", "Career"],
      excerpt:
        "A lightweight process for turning ideas into deployed apps — scope, rhythm, and knowing when to stop polishing.",
      body: [
        "Side projects fail when they try to become startups on day one. I treat them as experiments with a clear question: what do I want to learn or prove?",
        "I cap the first version at two weekends. If it isn’t usable by then, I cut scope until it is. Deployment counts as success even when the feature list is tiny.",
        {
          type: "heading",
          text: "A rhythm that works",
        },
        "Monday–Friday stays for work and rest. I block one focused slot on Saturday for building and Sunday for review, docs, and a single polish pass.",
        "The goal isn’t constant momentum — it’s predictable progress you can sustain for months.",
      ],
    },
    {
      slug: "webgl-for-portfolios",
      title: "WebGL on a portfolio: when it helps, when it hurts",
      date: "2025-06-02",
      readTime: "4 min",
      tags: ["WebGL", "Three.js", "Design"],
      excerpt:
        "3D backgrounds can feel premium or distracting. Here’s how I balance performance, motion preferences, and first impressions.",
      body: [
        "A subtle scene behind your content signals craft — but only if it never fights readability. I keep contrast high, motion slow, and respect prefers-reduced-motion.",
        "Performance on mobile means fewer particles, lower device pixel ratio, and skipping heavy post-processing. Most visitors will never rotate the camera; parallax from the pointer is enough.",
        {
          type: "code",
          text: "// Always gate the canvas\nif (prefersReducedMotion) {\n  canvas.remove();\n}",
        },
        "Treat WebGL as atmosphere, not the main message. Your projects and writing should still shine with JavaScript disabled and the canvas removed.",
      ],
    },
    {
      slug: "api-design-notes",
      title: "Small API design choices that age well",
      date: "2025-03-21",
      readTime: "5 min",
      tags: ["Backend", "APIs"],
      excerpt:
        "Naming, errors, and pagination patterns that save you from breaking clients six months later.",
      body: [
        "Consistent nouns beat clever routes. `/users/{id}/orders` tells a story; `/getUserOrders` mixed with `/order-list` does not.",
        {
          type: "heading",
          text: "Errors people can act on",
        },
        "Return a stable machine-readable code, a human message, and optional field-level details. Clients should log the code; users should read the message.",
        "Pagination belongs in the contract early — cursor-based for live feeds, offset only when the dataset is small and stable.",
      ],
    },
  ],
  skills: [
    "Java",
    "Python",
    "C",
    "JavaScript",
    "TypeScript",
    "HTML5",
    "CSS3",
    "React",
    "Vite",
    "Node.js",
    "FastAPI",
    "Socket.io",
    "REST APIs",
    "MongoDB",
    "PostgreSQL",
    "Docker",
    "Linux",
    "Git",
    "GitHub",
    "Android Studio",
    "Machine Learning",
    "PyTorch",
    "IBM",
    "Figma",
    "Three.js",
    "Firebase",
    "Computer Networking",
  ],
  experience: [
    {
      role: "Summer Internship — Full-Stack Web Development",
      company: "International Business Machines Corporation (IBM)",
      period: "July 2026 — August 2026",
      description:
        "Hands-on full-stack web development across frontend and backend for responsive web applications.",
      highlights: [
        "Built responsive web applications across the stack.",
        "Database integration, API implementation, debugging, and testing.",
      ],
    },
    {
      role: "Summer Internship — AIML & Python",
      company: "Kareng Technologies",
      period: "July 2023",
      description:
        "Artificial Intelligence and Machine Learning with Python — data preprocessing through model evaluation.",
      highlights: [
        "Data preprocessing, model development, training, and evaluation.",
        "Applied ML techniques to practical problem statements.",
      ],
    },
  ],
  projects: [
    {
      title: "JENNIE — AI Virtual Assistant",
      description:
        "Conversational and voice-based assistant with a responsive UI, multi-layer intelligence core, and real-time state visualizations (listening, processing, thinking, speaking).",
      outcome: "React, TypeScript, Ollama & LLMs, Canvas API.",
      tags: ["React", "TypeScript", "LLMs"],
      image: "assets/project-jennie.jpg",
      featured: true,
      liveUrl: "https://example.com/jennie-demo",
      repoUrl: "",
      link: "https://example.com/jennie-demo",
      linkLabel: "Live demo",
    },
    {
      title: "SURAKSHA AI",
      description:
        "Real-time disaster risk intelligence — 18 live APIs, government warning ingestion, interactive risk maps, and safe-route recommendations.",
      outcome: "React, FastAPI, Leaflet, OSRM — SIH & NASA hackathon build.",
      tags: ["React", "FastAPI", "Maps"],
      image: "assets/project-suraksha.jpg",
      featured: true,
      liveUrl: "",
      repoUrl: "",
      link: "",
      linkLabel: "Case study",
    },
    {
      title: "Real-Time Chat Application",
      description:
        "Private and group messaging with a Node.js/Socket.io backend and MongoDB chat history.",
      outcome: "Low-latency real-time communication.",
      tags: ["Node.js", "Socket.io", "MongoDB"],
      image: "assets/project-chat.jpg",
      liveUrl: "",
      repoUrl: "",
      link: "",
      linkLabel: "View repo",
    },
    {
      title: "Crop Yield Forecasting with AI (Review)",
      description:
        "Review of methodologies and AI technologies for predicting crop yields; evaluation of ML models and data sources.",
      outcome: "DOI: 10.36948/ijfmr.2024.v06i03.21432",
      tags: ["Research", "ML", "Agriculture"],
      image: "assets/project-crop-yield.jpg",
      liveUrl: "https://doi.org/10.36948/ijfmr.2024.v06i03.21432",
      repoUrl: "",
      link: "https://doi.org/10.36948/ijfmr.2024.v06i03.21432",
      linkLabel: "Publication",
    },
  ],
  social: [
    {
      label: "LinkedIn",
      url: "https://linkedin.com/in/ratul-cr-2605b1227",
    },
    {
      label: "Portfolio",
      url: "https://ray-systems-portfolio.web.app",
    },
    { label: "Email", url: "mailto:ratulcr143@gmail.com" },
  ],
};
