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

  const getViewportSize = () => ({
    width: Math.max(1, Math.round(window.visualViewport?.width || innerWidth)),
    height: Math.max(1, Math.round(window.visualViewport?.height || innerHeight)),
  });

  const viewport = getViewportSize();
  const setRendererSize = () => {
    const nextViewport = getViewportSize();
    mobile = window.matchMedia("(max-width: 768px)").matches;
    camera.aspect = nextViewport.width / nextViewport.height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.75));
    renderer.setSize(nextViewport.width, nextViewport.height);
  };

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.75));
  renderer.setSize(viewport.width, viewport.height);
  renderer.setClearColor(0x000000, 0);
  if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } else if ("outputEncoding" in renderer && THREE.sRGBEncoding) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }
  if ("toneMapping" in renderer) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.82;
  }

  const atmosphere = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 90),
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        void main() {
          vec2 centered = vUv - vec2(0.5);
          float central = exp(-dot(centered * vec2(0.8, 1.15), centered * vec2(0.8, 1.15)) * 5.0);
          float upper = exp(-dot((centered - vec2(0.18, 0.26)) * vec2(1.2, 0.8), (centered - vec2(0.18, 0.26)) * vec2(1.2, 0.8)) * 8.0);
          float lower = exp(-dot((centered + vec2(0.28, 0.34)) * vec2(1.1, 0.7), (centered + vec2(0.28, 0.34)) * vec2(1.1, 0.7)) * 9.0);
          float breathing = 0.96 + sin(uTime * 0.035) * 0.04;
          vec3 color = vec3(0.008, 0.014, 0.03);
          color += vec3(0.018, 0.035, 0.065) * central;
          color += vec3(0.015, 0.026, 0.05) * upper;
          color += vec3(0.012, 0.02, 0.038) * lower;
          gl_FragColor = vec4(color * breathing, 0.78);
        }
      `,
      transparent: true,
      depthWrite: false,
    })
  );
  atmosphere.position.z = -42;
  atmosphere.renderOrder = -10;
  scene.add(atmosphere);

  const particleVertexShader = `
    attribute float aSize;
    attribute float aPhase;
    attribute float aSpeed;
    attribute vec3 aColor;
    uniform float uTime;
    uniform float uMotion;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      vec3 positionOffset = vec3(
        sin(uTime * aSpeed + aPhase) * 0.035,
        cos(uTime * aSpeed * 0.72 + aPhase) * 0.025,
        sin(uTime * aSpeed * 0.38 + aPhase) * 0.06
      ) * uMotion;
      vec4 viewPosition = modelViewMatrix * vec4(position + positionOffset, 1.0);
      float depthScale = 28.0 / max(1.0, -viewPosition.z);
      gl_PointSize = clamp(aSize * depthScale, 0.7, 4.2);
      gl_Position = projectionMatrix * viewPosition;
      vColor = aColor;
      vAlpha = 0.72 + 0.28 * sin(uTime * aSpeed * 0.8 + aPhase);
    }
  `;
  const particleFragmentShader = `
    varying vec3 vColor;
    varying float vAlpha;
    uniform float uOpacity;
    void main() {
      vec2 point = gl_PointCoord - vec2(0.5);
      float radius = length(point);
      float edge = 1.0 - smoothstep(0.16, 0.5, radius);
      float core = 1.0 - smoothstep(0.0, 0.2, radius);
      gl_FragColor = vec4(vColor, (edge * 0.48 + core * 0.52) * vAlpha * uOpacity);
    }
  `;

  const particleLayers = [];
  const particlePalette = [0.62, 0.72, 0.84, 0.92];
  function createParticleLayer(count, zNear, zFar, sizeMin, sizeMax, opacity, parallax) {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const distance = Math.abs(zFar);
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * distance;
    const halfWidth = halfHeight * camera.aspect;

    for (let i = 0; i < count; i++) {
      const z = zNear - Math.random() * (zNear - zFar);
      positions[i * 3] = (Math.random() * 2 - 1) * halfWidth * 1.18;
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * halfHeight * 1.18;
      positions[i * 3 + 2] = z;
      sizes[i] = sizeMin + Math.random() * (sizeMax - sizeMin);
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.025 + Math.random() * 0.055;
      const value = particlePalette[Math.floor(Math.random() * particlePalette.length)];
      colors[i * 3] = value * 0.75;
      colors[i * 3 + 1] = value * 0.86;
      colors[i * 3 + 2] = Math.min(1, value + 0.08);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMotion: { value: reducedMotion ? 0 : 1 },
        uOpacity: { value: opacity },
      },
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geometry, material);
    points.userData.parallax = parallax;
    scene.add(points);
    particleLayers.push({ points, material, parallax });
  }

  createParticleLayer(mobile ? 90 : 260, -38, -76, 0.7, 1.55, 0.32, 0.08);
  createParticleLayer(mobile ? 42 : 125, -13, -36, 0.85, 1.9, 0.44, 0.18);
  createParticleLayer(mobile ? 14 : 42, -3, -13, 1.1, 2.5, 0.3, 0.32);

  const structure = new THREE.Group();
  structure.position.set(0.8, -0.35, -9);
  structure.rotation.set(0.42, -0.22, -0.12);
  structure.renderOrder = 0;
  scene.add(structure);

  const structureMaterial = new THREE.LineBasicMaterial({
    color: 0x71839c,
    transparent: true,
    opacity: mobile ? 0.075 : 0.11,
    depthWrite: false,
  });
  const orbitGeometry = new THREE.EllipseCurve(0, 0, 5.6, 1.65, 0, Math.PI * 2, false, 0)
    .getPoints(96);
  const orbit = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(orbitGeometry.map((point) => new THREE.Vector3(point.x, point.y, 0))),
    structureMaterial
  );
  structure.add(orbit);

  const innerOrbitGeometry = new THREE.EllipseCurve(0, 0, 3.7, 1.05, 0, Math.PI * 2, false, 0)
    .getPoints(72);
  const innerOrbit = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(innerOrbitGeometry.map((point) => new THREE.Vector3(point.x, point.y, 0.04))),
    structureMaterial.clone()
  );
  innerOrbit.material.opacity = mobile ? 0.045 : 0.065;
  structure.add(innerOrbit);

  const axisGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-5.6, 0, 0.02),
    new THREE.Vector3(5.6, 0, 0.02),
  ]);
  const axis = new THREE.Line(axisGeometry, structureMaterial.clone());
  axis.material.opacity = mobile ? 0.035 : 0.05;
  structure.add(axis);

  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 8, 6),
    new THREE.MeshBasicMaterial({
      color: 0xa5b4c8,
      transparent: true,
      opacity: mobile ? 0.26 : 0.34,
      depthWrite: false,
    })
  );
  marker.position.set(3.85, 0.16, 0.08);
  structure.add(marker);

  const technologyNodes = [];
  const technologyBadges = [
    ["PY", "#6f8eaa"],
    ["JS", "#a99b63"],
    ["ML", "#78869c"],
  ];

  function makeTechnologyTexture(label, color) {
    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = 128;
    textureCanvas.height = 128;
    const context = textureCanvas.getContext("2d");
    if (!context) return null;
    context.strokeStyle = `${color}88`;
    context.lineWidth = 2;
    context.strokeRect(22, 22, 84, 84);
    context.fillStyle = "#b5c0cf";
    context.font = '600 22px "DM Sans", Arial, sans-serif';
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label, 64, 64);
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  }

  function createTechnologyNodes() {
    const count = mobile ? 1 : 3;
    technologyBadges.slice(0, count).forEach(([label, color], index) => {
      const texture = makeTechnologyTexture(label, color);
      if (!texture) return;
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        opacity: mobile ? 0.14 : 0.18,
      });
      const sprite = new THREE.Sprite(material);
      sprite.position.set(
        (index - 1) * 4.5 + (Math.random() - 0.5) * 1.3,
        1.8 + (Math.random() - 0.5) * 2.4,
        -18 - index * 9
      );
      sprite.scale.setScalar(mobile ? 0.45 : 0.58);
      sprite.renderOrder = 1;
      scene.add(sprite);
      technologyNodes.push({
        sprite,
        texture,
        baseY: sprite.position.y,
        phase: index * 2.2,
      });
    });
  }

  createTechnologyNodes();

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

  function renderFrame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;
    const ease = 1 - Math.exp(-2.4 * dt);
    pointer.x += (pointer.targetX - pointer.x) * ease;
    pointer.y += (pointer.targetY - pointer.y) * ease;
    scrollProgress += (scrollTarget - scrollProgress) * ease;

    camera.position.x += (pointer.x * 0.12 + Math.sin(scrollProgress * Math.PI) * 0.08 - camera.position.x) * ease;
    camera.position.y += (-pointer.y * 0.08 + Math.cos(scrollProgress * Math.PI) * 0.04 - camera.position.y) * ease;
    camera.lookAt(0, 0, -8);

    atmosphere.material.uniforms.uTime.value = elapsed;
    particleLayers.forEach(({ points, material, parallax }) => {
      material.uniforms.uTime.value = elapsed;
      points.position.x += (pointer.x * parallax - points.position.x) * ease;
      points.position.y += (-pointer.y * parallax * 0.6 - points.position.y) * ease;
    });

    if (!reducedMotion) {
      structure.rotation.z = -0.12 + Math.sin(elapsed * 0.035) * 0.018;
      structure.rotation.y = -0.22 + Math.sin(elapsed * 0.025) * 0.025;
      technologyNodes.forEach(({ sprite, baseY, phase }) => {
        sprite.position.y = baseY + Math.sin(elapsed * 0.08 + phase) * 0.025;
      });
    }

    renderer.render(scene, camera);
  }

  function animate() {
    frameId = requestAnimationFrame(animate);
    renderFrame();
  }

  function onResize() {
    setRendererSize();
    renderFrame();
  }

  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });
  window.visualViewport?.addEventListener("resize", onResize, { passive: true });

  if (reducedMotion) {
    renderFrame();
  } else {
    animate();
  }

  window.__portfolioWebglReady = true;
  window.dispatchEvent(new Event("webgl-ready"));

  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
    window.visualViewport?.removeEventListener("resize", onResize);
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
    });
    technologyNodes.forEach(({ texture }) => texture.dispose());
    renderer.dispose();
  }, { once: true });
})();
