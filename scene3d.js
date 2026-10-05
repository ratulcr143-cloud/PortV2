(() => {
  const canvas = document.getElementById("webgl");
  if (!canvas || typeof THREE === "undefined") {
    window.__portfolioWebglReady = true;
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let mobile = window.matchMedia("(max-width: 768px)").matches;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 180);
  const initialAspect = camera.aspect;
  camera.position.set(0, 0, 18);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !mobile,
      powerPreference: "high-performance",
    });
  } catch (error) {
    console.warn("WebGL is unavailable; loading the portfolio without the 3D background.", error);
    canvas.style.display = "none";
    window.__portfolioWebglReady = true;
    window.dispatchEvent(new Event("webgl-ready"));
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x000000, 0);
  if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } else if ("outputEncoding" in renderer && THREE.sRGBEncoding) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }
  if ("toneMapping" in renderer) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
  }

  // Three depth layers create parallax while keeping the scene star-only.
  const starVertexShader = `
    attribute float aSize;
    attribute float aPhase;
    attribute vec3 aColor;
    uniform float uTime;
    varying vec3 vColor;
    varying float vTwinkle;
    varying float vGlow;
    uniform float uOpacity;
    void main() {
      vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
      float pulse = 0.86 + 0.14 * sin(uTime * 1.15 + aPhase);
      vTwinkle = pulse;
      vGlow = step(0.86, fract(aPhase * 2.73));
      vColor = aColor;
      gl_PointSize = clamp(aSize * (1.0 + vGlow * 0.35) * pulse * (88.0 / max(1.0, -viewPosition.z)), 0.85, 6.0);
      gl_Position = projectionMatrix * viewPosition;
    }
  `;
  const starFragmentShader = `
    varying vec3 vColor;
    varying float vTwinkle;
    varying float vGlow;
    uniform float uOpacity;
    void main() {
      vec2 point = gl_PointCoord - vec2(0.5);
      float radius = length(point);
      float core = 1.0 - smoothstep(0.02, 0.28, radius);
      float halo = 1.0 - smoothstep(0.12, 0.5, radius);
      float alpha = (core * 0.98 + halo * (0.34 + vGlow * 0.16)) * vTwinkle * uOpacity;
      gl_FragColor = vec4(vColor, alpha);
    }
  `;

  const starLayers = [];
  const starPalette = [0xffffff, 0xc9dcff, 0x9feaff, 0xffdfc1, 0xb8a8ff];
  function createStarLayer(count, zNear, zFar, sizeMin, sizeMax, opacity, parallax) {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const colorsThree = starPalette.map((hex) => new THREE.Color(hex));

    for (let i = 0; i < count; i++) {
      const z = zNear - Math.random() * (zFar - zNear);
      const distance = camera.position.z - z;
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * distance;
      const halfWidth = halfHeight * camera.aspect;
      positions[i * 3] = (Math.random() * 2 - 1) * halfWidth * 1.35;
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * halfHeight * 1.35;
      positions[i * 3 + 2] = z;
      sizes[i] = sizeMin + Math.random() * (sizeMax - sizeMin);
      phases[i] = Math.random() * Math.PI * 2;
      const color = colorsThree[Math.floor(Math.random() * colorsThree.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpacity: { value: opacity } },
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
    starLayers.push({ points, material, parallax });
  }

  createStarLayer(mobile ? 680 : 1500, -42, -82, 0.95, 2.25, 0.88, 0.12);
  createStarLayer(mobile ? 270 : 650, -14, -42, 1.25, 3.05, 0.98, 0.3);
  createStarLayer(mobile ? 70 : 180, -3, -15, 1.95, 4.45, 0.72, 0.58);


  // Layered, curved meteor trails with a soft edge and bright ionized core.
  const cometVertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const cometFragmentShader = `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec2 vUv;
    void main() {
      float taper = mix(1.0, 0.015, vUv.x);
      float across = abs(vUv.y - 0.5) * 2.0;
      float normalizedAcross = across / max(taper, 0.001);
      float softGlow = exp(-normalizedAcross * normalizedAcross * 3.1);
      float hotCore = exp(-normalizedAcross * normalizedAcross * 25.0);
      float lengthFade = pow(1.0 - vUv.x, 1.45);
      float alpha = (softGlow * 0.3 + hotCore * 0.85) * lengthFade * uOpacity;
      vec3 color = mix(uColor, vec3(1.0), hotCore * 0.82);
      gl_FragColor = vec4(color, alpha);
    }
  `;
  const cometColors = [0x9bdcff, 0xaebaff, 0xffd9b5, 0xb5fff4];

  function makeTrailGeometry() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(12), 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]), 2));
    geometry.setIndex([0, 2, 1, 2, 3, 1]);
    return geometry;
  }

  function makeTrailMaterial(color, opacity) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
      },
      vertexShader: cometVertexShader,
      fragmentShader: cometFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
  }

  function makeComet() {
    const glowTrail = new THREE.Mesh(makeTrailGeometry(), makeTrailMaterial(0x9bdcff, 0));
    glowTrail.renderOrder = 2;
    glowTrail.visible = false;
    scene.add(glowTrail);

    const coreTrail = new THREE.Mesh(makeTrailGeometry(), makeTrailMaterial(0xeaf7ff, 0));
    coreTrail.renderOrder = 3;
    coreTrail.visible = false;
    scene.add(coreTrail);

    const head = new THREE.Group();
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.052, 12, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0x9bdcff, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.27, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0x6caaff, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    head.add(halo, glow, nucleus);
    head.renderOrder = 4;
    head.visible = false;
    scene.add(head);

    return {
      glowTrail,
      coreTrail,
      head,
      age: 0,
      life: 0,
      speed: 0,
      direction: new THREE.Vector2(1, -0.5),
      startX: 0,
      startY: 0,
      startZ: -12,
      tailLength: 1.8,
      width: 0.065,
      curve: 0.4,
      travelLength: 0,
    };
  }

  const comets = Array.from({ length: mobile ? 2 : 4 }, makeComet);
  let nextCometIn = 0.55;

  function spawnComet(comet) {
    const depth = 7 + Math.random() * 20;
    const z = -depth;
    const distance = camera.position.z - z;
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * distance;
    const halfWidth = halfHeight * camera.aspect;
    const roll = Math.random();
    let x;
    let y;
    let dx;
    let dy;

    if (roll < 0.68) {
      x = (Math.random() * 1.8 - 0.9) * halfWidth;
      y = halfHeight * 1.12;
      dx = 0.42 + Math.random() * 0.52;
      dy = -(0.72 + Math.random() * 0.4);
    } else if (roll < 0.84) {
      x = halfWidth * 1.12;
      y = (Math.random() * 1.6 - 0.8) * halfHeight;
      dx = -(0.78 + Math.random() * 0.34);
      dy = 0.12 - Math.random() * 0.55;
    } else {
      x = -halfWidth * 1.12;
      y = (Math.random() * 1.6 - 0.8) * halfHeight;
      dx = 0.78 + Math.random() * 0.34;
      dy = -(Math.random() * 0.55 + 0.05);
    }

    comet.direction.set(dx, dy).normalize();
    comet.speed = 9 + Math.random() * 7;
    comet.life = (halfWidth * 2.15 + halfHeight * 0.8) / comet.speed;
    comet.travelLength = comet.speed * comet.life;
    comet.age = 0;
    comet.startX = x;
    comet.startY = y;
    comet.startZ = z;
    comet.tailLength = 1.4 + Math.random() * 1.8;
    comet.width = 0.075 + Math.random() * 0.045;
    comet.curve = (Math.random() - 0.5) * 0.7;

    const color = cometColors[Math.floor(Math.random() * cometColors.length)];
    comet.glowTrail.material.uniforms.uColor.value.setHex(color);
    comet.coreTrail.material.uniforms.uColor.value.setHex(0xeaf7ff);
    comet.head.children[0].material.color.setHex(color);
    comet.head.children[1].material.color.setHex(color);
    comet.glowTrail.visible = true;
    comet.coreTrail.visible = true;
    comet.head.visible = true;
  }

  function cometPointAt(comet, age) {
    const progress = THREE.MathUtils.clamp(age / comet.life, 0, 1);
    const distance = comet.travelLength * progress;
    const bend = Math.sin(progress * Math.PI) * comet.curve;
    const normalX = -comet.direction.y;
    const normalY = comet.direction.x;
    return new THREE.Vector3(
      comet.startX + comet.direction.x * distance + normalX * bend,
      comet.startY + comet.direction.y * distance + normalY * bend,
      comet.startZ
    );
  }

  function writeTrail(mesh, comet, headPoint, tailPoint, width) {
    const normalX = -comet.direction.y * width;
    const normalY = comet.direction.x * width;
    const positions = mesh.geometry.attributes.position.array;
    positions.set([
      headPoint.x + normalX, headPoint.y + normalY, headPoint.z,
      headPoint.x - normalX, headPoint.y - normalY, headPoint.z,
      tailPoint.x + normalX * 0.025, tailPoint.y + normalY * 0.025, tailPoint.z,
      tailPoint.x - normalX * 0.025, tailPoint.y - normalY * 0.025, tailPoint.z,
    ]);
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.computeBoundingSphere();
  }

  function smooth01(value) {
    const t = THREE.MathUtils.clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function updateComets(dt) {
    if (reducedMotion) return;
    nextCometIn -= dt;
    if (nextCometIn <= 0) {
      const idle = comets.find((comet) => !comet.head.visible);
      if (idle) spawnComet(idle);
      nextCometIn = 0.9 + Math.random() * 1.6;
    }

    comets.forEach((comet) => {
      if (!comet.head.visible) return;
      comet.age += dt;
      if (comet.age >= comet.life) {
        comet.head.visible = false;
        comet.glowTrail.visible = false;
        comet.coreTrail.visible = false;
        return;
      }

      const headPoint = cometPointAt(comet, comet.age);
      const tailPoint = cometPointAt(comet, Math.max(0, comet.age - comet.tailLength / comet.speed));
      writeTrail(comet.glowTrail, comet, headPoint, tailPoint, comet.width);
      writeTrail(comet.coreTrail, comet, headPoint, tailPoint, comet.width * 0.28);
      comet.head.position.copy(headPoint);

      const fadeIn = smooth01(comet.age / 0.22);
      const fadeOut = smooth01((comet.life - comet.age) / 0.42);
      const envelope = Math.min(fadeIn, fadeOut);
      comet.glowTrail.material.uniforms.uOpacity.value = envelope * 0.58;
      comet.coreTrail.material.uniforms.uOpacity.value = envelope * 0.92;
      comet.head.children[0].material.opacity = 0.12 * envelope;
      comet.head.children[1].material.opacity = 0.38 * envelope;
    });
  }
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let scrollTarget = 0;
  let scrollProgress = 0;
  function onPointerMove(event) {
    pointer.targetX = (event.clientX / innerWidth - 0.5) * 2;
    pointer.targetY = (event.clientY / innerHeight - 0.5) * 2;
  }
  function onScroll() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    scrollTarget = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
  }
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const clock = new THREE.Clock();
  let elapsed = 0;
  let frameId = 0;
  function animate() {
    frameId = requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const ease = 1 - Math.exp(-3.8 * dt);
    elapsed += dt;
    pointer.x += (pointer.targetX - pointer.x) * (1 - Math.exp(-5 * dt));
    pointer.y += (pointer.targetY - pointer.y) * (1 - Math.exp(-5 * dt));
    scrollProgress += (scrollTarget - scrollProgress) * ease;

    camera.position.x += (pointer.x * 0.28 + Math.sin(scrollProgress * Math.PI * 2) * 0.14 - camera.position.x) * ease;
    camera.position.y += (-pointer.y * 0.2 + Math.cos(scrollProgress * Math.PI * 2) * 0.1 - camera.position.y) * ease;
    camera.lookAt(0, 0, 0);

    starLayers.forEach(({ points, material, parallax }, index) => {
      material.uniforms.uTime.value = elapsed;
      points.position.z += dt * (0.45 + index * 0.2);
      if (points.position.z > 12) points.position.z = -12;
      points.position.x = pointer.x * parallax * -0.5;
      points.position.y = pointer.y * parallax * 0.35;
      points.rotation.z = Math.sin(elapsed * 0.025 + index) * 0.002 + scrollProgress * 0.006 * (index + 1);
    });

    if (!reducedMotion) updateComets(dt);
    renderer.render(scene, camera);
  }

  function onResize() {
    mobile = window.matchMedia("(max-width: 768px)").matches;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
    renderer.setSize(innerWidth, innerHeight);
    starLayers.forEach(({ points }) => {
      points.scale.x = camera.aspect / initialAspect;
    });
  }
  window.addEventListener("resize", onResize, { passive: true });


  animate();

  window.__portfolioWebglReady = true;
  window.dispatchEvent(new Event("webgl-ready"));

  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
    });
    renderer.dispose();
  }, { once: true });
})();



