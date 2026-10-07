(() => {
  if (document.body?.dataset.editorialBackground === "true") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.getElementById("neural-background");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const pointer = { x: 0, y: 0, active: false };
  const nodes = [];
  const stars = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let frameId = 0;
  let lastTime = performance.now();
  let mobile = false;
  let connectionDistance = 140;
  const pointerDistance = 260;
  const pointerNodeLimit = 5;

  const getNodeCount = () => (mobile ? 24 : 56);
  const getStarCount = () => (mobile ? 80 : 160);

  function createNode() {
    const speed = 0.3;
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 1.5 + Math.random() * 1.5,
    };
  }

  function createStar() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.3 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      speed: 0.7 + Math.random() * 1.1,
      depth: Math.random(),
    };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    mobile = width < 768;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    connectionDistance = Math.min(170, Math.max(130, width * 0.16));
    while (nodes.length < getNodeCount()) nodes.push(createNode());
    nodes.length = getNodeCount();
    while (stars.length < getStarCount()) stars.push(createStar());
    stars.length = getStarCount();
  }

  function onPointerMove(event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }

  function update(delta) {
    const scale = Math.min(delta * 60, 2);
    nodes.forEach((node) => {
      node.x += node.vx * scale;
      node.y += node.vy * scale;
      if (node.x <= 0 || node.x >= width) {
        node.x = Math.max(0, Math.min(width, node.x));
        node.vx *= -1;
      }
      if (node.y <= 0 || node.y >= height) {
        node.y = Math.max(0, Math.min(height, node.y));
        node.vy *= -1;
      }
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const now = performance.now();
    const starPaths = [new Path2D(), new Path2D(), new Path2D()];
    stars.forEach((star) => {
      const twinkle = 0.72 + Math.sin(now * 0.001 * star.speed + star.phase) * 0.22;
      const group = twinkle < 0.65 ? 0 : twinkle < 0.82 ? 1 : 2;
      starPaths[group].moveTo(star.x + star.radius, star.y);
      starPaths[group].arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    });
    ctx.fillStyle = "rgba(96, 165, 250, 0.25)";
    ctx.fill(starPaths[0]);
    ctx.fillStyle = "rgba(147, 197, 253, 0.42)";
    ctx.fill(starPaths[1]);
    ctx.fillStyle = "rgba(186, 230, 253, 0.64)";
    ctx.fill(starPaths[2]);

    const connectionDistanceSq = connectionDistance * connectionDistance;
    ctx.beginPath();
    ctx.lineWidth = 0.75;
    ctx.strokeStyle = "rgba(99, 102, 241, 0.18)";
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const from = nodes[i];
        const to = nodes[j];
        const dx = from.x - to.x;
        const dy = from.y - to.y;
        if (dx * dx + dy * dy < connectionDistanceSq) {
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
        }
      }
    }
    ctx.stroke();

    if (pointer.active) {
      const pointerDistanceSq = pointerDistance * pointerDistance;
      const nearbyNodes = nodes
        .map((node) => {
          const dx = node.x - pointer.x;
          const dy = node.y - pointer.y;
          return { node, distanceSq: dx * dx + dy * dy };
        })
        .filter((entry) => entry.distanceSq < pointerDistanceSq)
        .sort((first, second) => first.distanceSq - second.distanceSq)
        .slice(0, pointerNodeLimit);

      ctx.beginPath();
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.19)";
      nearbyNodes.forEach(({ node }) => {
        ctx.moveTo(pointer.x, pointer.y);
        ctx.lineTo(node.x, node.y);
      });
      ctx.stroke();
    }

    nodes.forEach((node) => {
      const glowRadius = node.radius * 4.5;
      const glow = ctx.createRadialGradient(
        node.x,
        node.y,
        0,
        node.x,
        node.y,
        glowRadius,
      );
      glow.addColorStop(0, "rgba(125, 211, 252, 0.95)");
      glow.addColorStop(0.28, "rgba(56, 189, 248, 0.48)");
      glow.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(186, 230, 253, 0.95)";
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function animate(now) {
    frameId = requestAnimationFrame(animate);
    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    update(delta);
    draw();
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", () => { pointer.active = false; }, { passive: true });
  frameId = requestAnimationFrame(animate);

  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
    nodes.length = 0;
    ctx.clearRect(0, 0, width, height);
  }, { once: true });
})();
