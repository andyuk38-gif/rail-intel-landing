/**
 * Languages coverage globe — interactive Three.js earth with language markers.
 * Falls back to a styled 2D globe when WebGL or Three.js is unavailable.
 */

const root = document.querySelector("[data-lang-globe]");
if (root) boot(root);

function boot(root) {
  const stage = root.querySelector("[data-lang-globe-stage]");
  const canvasWrap = root.querySelector("[data-lang-globe-canvas]");
  const fallback = root.querySelector("[data-lang-globe-fallback]");
  const statusEl = root.querySelector("[data-lang-globe-status]");
  const listButtons = Array.from(root.querySelectorAll("[data-lang-globe-select]"));
  const cards = Array.from(document.querySelectorAll(".card--language[data-lang]"));
  const labelsLayer = root.querySelector("[data-lang-globe-labels]");

  const languages = listButtons
    .map((btn) => ({
      code: btn.getAttribute("data-lang-globe-select"),
      name: btn.getAttribute("data-lang-name") || "",
      nativeName: btn.getAttribute("data-lang-native") || "",
      region: btn.getAttribute("data-lang-region") || "",
      lat: parseFloat(btn.getAttribute("data-lang-lat")),
      lng: parseFloat(btn.getAttribute("data-lang-lng")),
      button: btn,
    }))
    .filter((lang) => lang.code && Number.isFinite(lang.lat) && Number.isFinite(lang.lng));

  if (!stage || !canvasWrap || !languages.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeCode = languages[0].code;
  let autoIndex = 0;
  let autoTimer = 0;
  let focusHandler = null;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setStatus(lang) {
    if (!statusEl) return;
    statusEl.innerHTML =
      "<strong>" +
      escapeHtml(lang.name) +
      "</strong> · " +
      escapeHtml(lang.nativeName) +
      " · " +
      escapeHtml(lang.region);
  }

  function syncUi(code) {
    activeCode = code;
    listButtons.forEach((btn) => {
      const on = btn.getAttribute("data-lang-globe-select") === code;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    cards.forEach((card) => {
      card.classList.toggle("is-globe-active", card.getAttribute("data-lang") === code);
    });
    stage.querySelectorAll("[data-flat-marker]").forEach((el) => {
      el.classList.toggle("is-active", el.getAttribute("data-flat-marker") === code);
    });
    if (labelsLayer) {
      labelsLayer.querySelectorAll(".lang-globe__label").forEach((el) => {
        el.classList.toggle("is-visible", el.getAttribute("data-lang") === code);
      });
    }
    const lang = languages.find((item) => item.code === code);
    if (lang) setStatus(lang);
  }

  function selectLanguage(code, animate) {
    syncUi(code);
    if (typeof focusHandler === "function") focusHandler(code, animate !== false);
  }

  function scheduleAutoCycle() {
    window.clearTimeout(autoTimer);
    if (reducedMotion) return;
    autoTimer = window.setTimeout(() => {
      if (document.hidden) {
        scheduleAutoCycle();
        return;
      }
      autoIndex = (autoIndex + 1) % languages.length;
      selectLanguage(languages[autoIndex].code, true);
      scheduleAutoCycle();
    }, 5200);
  }

  function bindChrome() {
    listButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.getAttribute("data-lang-globe-select");
        autoIndex = languages.findIndex((l) => l.code === code);
        selectLanguage(code, true);
        scheduleAutoCycle();
      });
    });

    cards.forEach((card) => {
      card.style.cursor = "pointer";
      card.setAttribute("tabindex", "0");
      card.addEventListener("click", () => {
        const code = card.getAttribute("data-lang");
        if (!code) return;
        autoIndex = languages.findIndex((l) => l.code === code);
        selectLanguage(code, true);
        scheduleAutoCycle();
        root.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
      });
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        card.click();
      });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) window.clearTimeout(autoTimer);
      else scheduleAutoCycle();
    });
  }

  function projectFlat(lat, lng) {
    // Orthographic-ish projection centred on Europe / MENA (coverage cluster)
    const x = 0.5 + (lng + 5) / 110;
    const y = 0.48 - (lat - 42) / 95;
    return {
      x: Math.min(0.92, Math.max(0.08, x)),
      y: Math.min(0.9, Math.max(0.12, y)),
    };
  }

  function mountFlatGlobe() {
    if (fallback) fallback.hidden = true;
    canvasWrap.innerHTML = "";
    canvasWrap.classList.add("lang-globe__canvas-wrap--flat");

    const disc = document.createElement("div");
    disc.className = "lang-globe__flat";
    disc.setAttribute("aria-hidden", "true");
    disc.innerHTML = `
      <div class="lang-globe__flat-glow"></div>
      <div class="lang-globe__flat-sphere">
        <div class="lang-globe__flat-grid"></div>
        <div class="lang-globe__flat-land"></div>
        <div class="lang-globe__flat-shine"></div>
      </div>
      <div class="lang-globe__flat-ring"></div>
      <div class="lang-globe__flat-markers"></div>
    `;
    canvasWrap.appendChild(disc);

    const markersHost = disc.querySelector(".lang-globe__flat-markers");
    languages.forEach((lang) => {
      const pos = projectFlat(lang.lat, lang.lng);
      const marker = document.createElement("button");
      marker.type = "button";
      marker.className = "lang-globe__flat-marker";
      marker.setAttribute("data-flat-marker", lang.code);
      marker.setAttribute("aria-label", lang.name);
      marker.style.left = pos.x * 100 + "%";
      marker.style.top = pos.y * 100 + "%";
      marker.innerHTML = `<span class="lang-globe__flat-pulse"></span><span class="lang-globe__flat-core"></span>`;
      marker.addEventListener("click", () => {
        autoIndex = languages.findIndex((l) => l.code === lang.code);
        selectLanguage(lang.code, true);
        scheduleAutoCycle();
      });
      markersHost.appendChild(marker);
    });

    focusHandler = (code) => {
      // Flat mode: markers highlight via syncUi; optional gentle pan of sphere
      const sphere = disc.querySelector(".lang-globe__flat-sphere");
      const lang = languages.find((l) => l.code === code);
      if (!sphere || !lang) return;
      const offsetX = (lang.lng + 5) * -0.35;
      const offsetY = (lang.lat - 45) * 0.25;
      sphere.style.transform =
        "rotateX(" +
        (8 + offsetY * 0.15) +
        "deg) rotateY(" +
        offsetX +
        "deg)";
    };

    const hint = root.querySelector(".lang-globe__hint");
    if (hint) {
      const touchHint = window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(max-width: 960px)").matches;
      hint.textContent = touchHint
        ? "Tap a language · Or a marker"
        : "Select a language · Markers show coverage";
    }

    selectLanguage(activeCode, false);
    scheduleAutoCycle();
  }

  function hasWebGL() {
    try {
      const canvas = document.createElement("canvas");
      return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      return false;
    }
  }

  async function mountThreeGlobe() {
    const THREE = await import("https://esm.sh/three@0.170.0");
    const { OrbitControls } = await import(
      "https://esm.sh/three@0.170.0/examples/jsm/controls/OrbitControls.js"
    );

    const GLOBE_RADIUS = 1.6;
    const MARKER_RADIUS = 0.028;
    const EARTH_TEX =
      "https://cdn.jsdelivr.net/npm/three-globe@2.44.0/example/img/earth-night.jpg";
    const BUMP_TEX =
      "https://cdn.jsdelivr.net/npm/three-globe@2.44.0/example/img/earth-topology.png";

    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (width < 2 || height < 2) throw new Error("stage-size");

    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const isNarrow = window.matchMedia("(max-width: 960px)").matches;
    const mobileLike = isCoarse || isNarrow;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    if (!renderer.getContext()) {
      renderer.dispose();
      throw new Error("no-context");
    }

    if (fallback) fallback.hidden = true;
    canvasWrap.innerHTML = "";

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobileLike ? 1.75 : 2));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    canvasWrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(mobileLike ? 46 : 42, width / height, 0.1, 100);
    camera.position.set(mobileLike ? 0.55 : 0.85, mobileLike ? 0.95 : 1.15, mobileLike ? 3.85 : 3.65);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = mobileLike ? 3.05 : 2.75;
    controls.maxDistance = mobileLike ? 5.2 : 5.5;
    controls.enableZoom = !mobileLike;
    controls.rotateSpeed = mobileLike ? 0.72 : 1;
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = mobileLike ? 0.28 : 0.35;
    controls.target.set(0, 0, 0);
    // One finger rotates; leave two-finger free so the page can still scroll/zoom outside
    if (THREE.TOUCH) {
      controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };
    }

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Stars
    {
      const count = 1400;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i += 1) {
        const r = 18 + Math.random() * 28;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      scene.add(
        new THREE.Points(
          geometry,
          new THREE.PointsMaterial({
            color: 0xb8c4d8,
            size: 0.035,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.7,
            depthWrite: false,
          })
        )
      );
    }

    scene.add(new THREE.AmbientLight(0x6b7a94, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(4, 2.5, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x4d7cff, 0.55);
    rim.position.set(-3, -1, -2);
    scene.add(rim);
    const accent = new THREE.PointLight(0xf59e0b, 0.55, 12);
    accent.position.set(2.2, 1.4, 2.8);
    scene.add(accent);

    function latLngToVector3(lat, lng, radius) {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lng + 180) * Math.PI) / 180;
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    const earthMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.92,
      metalness: 0.08,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS, 96, 96), earthMat);
    globeGroup.add(earth);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      EARTH_TEX,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        earthMat.map = tex;
        earthMat.needsUpdate = true;
      },
      undefined,
      () => {
        earthMat.color = new THREE.Color(0x1a2740);
      }
    );
    loader.load(
      BUMP_TEX,
      (tex) => {
        earthMat.bumpMap = tex;
        earthMat.bumpScale = 0.035;
        earthMat.needsUpdate = true;
      },
      undefined,
      () => {}
    );

    globeGroup.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(GLOBE_RADIUS * 1.12, 64, 64),
        new THREE.ShaderMaterial({
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
          uniforms: {
            glowColor: { value: new THREE.Color(0x4d7cff) },
            coefficient: { value: 0.22 },
            power: { value: 3.8 },
          },
          vertexShader: `
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 glowColor;
            uniform float coefficient;
            uniform float power;
            varying vec3 vNormal;
            void main() {
              float intensity = pow(coefficient - dot(vNormal, vec3(0.0, 0.0, 1.0)), power);
              gl_FragColor = vec4(glowColor, 1.0) * intensity;
            }
          `,
        })
      )
    );

    globeGroup.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(GLOBE_RADIUS * 1.015, 64, 64),
        new THREE.MeshBasicMaterial({
          color: 0x1e3a6e,
          transparent: true,
          opacity: 0.12,
          depthWrite: false,
        })
      )
    );

    const equator = new THREE.Mesh(
      new THREE.TorusGeometry(GLOBE_RADIUS + 0.004, 0.0022, 8, 128),
      new THREE.MeshBasicMaterial({ color: 0x8aa0c0, transparent: true, opacity: 0.18 })
    );
    equator.rotation.x = Math.PI / 2;
    globeGroup.add(equator);

    const markers = [];
    const labelEls = [];
    const arcs = [];

    // Larger invisible hit spheres on touch devices
    const hitScale = mobileLike ? 6.5 : 4.5;

    languages.forEach((lang) => {
      const group = new THREE.Group();
      const pos = latLngToVector3(lang.lat, lang.lng, GLOBE_RADIUS + 0.012);
      group.position.copy(pos);
      group.lookAt(pos.clone().multiplyScalar(2));
      group.userData = { code: lang.code, active: false };

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(MARKER_RADIUS, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xf59e0b,
          emissiveIntensity: 0.7,
          metalness: 0.35,
          roughness: 0.35,
        })
      );
      group.add(core);
      group.userData.core = core;

      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(MARKER_RADIUS * 2.1, 16, 16),
        new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: 0.22,
          depthWrite: false,
        })
      );
      group.add(halo);
      group.userData.halo = halo;

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(MARKER_RADIUS * 1.8, MARKER_RADIUS * 2.6, 48),
        new THREE.MeshBasicMaterial({
          color: 0xfbbf24,
          transparent: true,
          opacity: 0.55,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      ring.visible = false;
      group.add(ring);
      group.userData.ring = ring;

      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(MARKER_RADIUS * hitScale, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hit.userData.code = lang.code;
      group.add(hit);
      group.userData.hit = hit;

      globeGroup.add(group);
      markers.push(group);

      if (labelsLayer) {
        const el = document.createElement("div");
        el.className = "lang-globe__label";
        el.setAttribute("data-lang", lang.code);
        el.innerHTML =
          escapeHtml(lang.name) + "<span>" + escapeHtml(lang.nativeName) + "</span>";
        labelsLayer.appendChild(el);
        labelEls.push(el);
      } else {
        labelEls.push(null);
      }
    });

    const hub = languages.find((l) => l.code === "en");
    if (hub) {
      languages.forEach((lang) => {
        if (lang.code === "en" || lang.code === "cy") return;
        const start = latLngToVector3(hub.lat, hub.lng, GLOBE_RADIUS + 0.02);
        const end = latLngToVector3(lang.lat, lang.lng, GLOBE_RADIUS + 0.02);
        const mid = start.clone().add(end).multiplyScalar(0.5);
        mid.normalize().multiplyScalar(GLOBE_RADIUS * (1.18 + start.distanceTo(end) * 0.08));
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)),
          new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.22 })
        );
        line.userData = { from: hub.code, to: lang.code };
        globeGroup.add(line);
        arcs.push(line);
      });
    }

    let focusTween = null;
    let pointerDown = false;
    let disposed = false;
    let animFrame = 0;
    const clock = new THREE.Clock();

    function syncMarkers(code) {
      markers.forEach((marker) => {
        const on = marker.userData.code === code;
        marker.userData.active = on;
        marker.scale.setScalar(on ? 1.35 : 1);
        if (marker.userData.core) {
          marker.userData.core.material.emissiveIntensity = on ? 1.35 : 0.7;
        }
        if (marker.userData.ring) marker.userData.ring.visible = on;
      });
      labelEls.forEach((el) => {
        if (!el) return;
        el.classList.toggle("is-visible", el.getAttribute("data-lang") === code);
      });
    }

    function focusLanguage(code, animate) {
      const lang = languages.find((item) => item.code === code);
      if (!lang) return;
      syncMarkers(code);

      const target = latLngToVector3(lang.lat, lang.lng, GLOBE_RADIUS);
      const camDist = camera.position.length();
      const desired = target.clone().normalize().multiplyScalar(Math.max(camDist, 3.55));
      desired.y += 0.35;
      desired.setLength(Math.max(desired.length(), 3.55));

      if (!animate || reducedMotion) {
        camera.position.copy(desired);
        controls.target.set(0, 0, 0);
        controls.update();
        focusTween = null;
        return;
      }

      focusTween = {
        start: camera.position.clone(),
        end: desired,
        startTime: performance.now(),
        duration: 1100,
      };
    }

    focusHandler = (code, animate) => {
      focusLanguage(code, animate);
    };

    function projectLabels() {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const camDir = camera.position.clone().normalize();
      markers.forEach((marker, index) => {
        const el = labelEls[index];
        if (!el) return;
        const world = new THREE.Vector3();
        marker.getWorldPosition(world);
        const facing = world.clone().normalize().dot(camDir) > 0.08;
        const ndc = world.clone().project(camera);
        const onScreen =
          facing && ndc.z < 1 && Math.abs(ndc.x) <= 1.2 && Math.abs(ndc.y) <= 1.2;
        if (!onScreen || !el.classList.contains("is-visible")) {
          el.style.visibility = "hidden";
          return;
        }
        el.style.visibility = "visible";
        el.style.left = (ndc.x * 0.5 + 0.5) * w + "px";
        el.style.top = (-ndc.y * 0.5 + 0.5) * h + "px";
      });
    }

    function resize() {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (w < 2 || h < 2) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobileLike ? 1.75 : 2));
      renderer.setSize(w, h, false);
    }

    let resizeTimer = 0;
    function scheduleResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 120);
    }

    function animate() {
      if (disposed) return;
      animFrame = window.requestAnimationFrame(animate);
      const now = performance.now();
      const elapsed = clock.getElapsedTime();

      if (focusTween) {
        const t = Math.min(1, (now - focusTween.startTime) / focusTween.duration);
        const eased = 1 - Math.pow(1 - t, 3);
        camera.position.lerpVectors(focusTween.start, focusTween.end, eased);
        controls.target.set(0, 0, 0);
        controls.update();
        if (t >= 1) focusTween = null;
      }

      controls.autoRotate = !pointerDown && !focusTween && !reducedMotion;
      controls.autoRotateSpeed = 0.35;

      markers.forEach((marker) => {
        const pulse = 1 + Math.sin(elapsed * 2.4 + marker.userData.code.charCodeAt(0)) * 0.08;
        if (marker.userData.halo) {
          marker.userData.halo.scale.setScalar(pulse * (marker.userData.active ? 1.25 : 1));
          marker.userData.halo.material.opacity = marker.userData.active ? 0.32 : 0.16;
        }
        if (marker.userData.ring && marker.userData.ring.visible) {
          const ringScale = 1 + (Math.sin(elapsed * 3) * 0.5 + 0.5) * 0.55;
          marker.userData.ring.scale.set(ringScale, ringScale, 1);
          marker.userData.ring.material.opacity = 0.55 - ringScale * 0.18;
        }
      });

      arcs.forEach((arc) => {
        const hot = arc.userData.to === activeCode || arc.userData.from === activeCode;
        arc.material.opacity = hot ? 0.45 : 0.14;
      });

      controls.update();
      renderer.render(scene, camera);
      projectLabels();
    }

    renderer.domElement.addEventListener("pointerdown", () => {
      pointerDown = true;
      canvasWrap.classList.add("is-dragging");
      window.clearTimeout(autoTimer);
    });
    window.addEventListener("pointerup", () => {
      if (!pointerDown) return;
      pointerDown = false;
      canvasWrap.classList.remove("is-dragging");
      scheduleAutoCycle();
    });
    window.addEventListener("pointercancel", () => {
      if (!pointerDown) return;
      pointerDown = false;
      canvasWrap.classList.remove("is-dragging");
      scheduleAutoCycle();
    });

    // Prefer pointerup taps over click (more reliable on iOS after drag)
    let pointerStart = null;
    renderer.domElement.addEventListener("pointerdown", (event) => {
      pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
    });
    renderer.domElement.addEventListener("pointerup", (event) => {
      if (!pointerStart || pointerStart.id !== event.pointerId) return;
      const dx = event.clientX - pointerStart.x;
      const dy = event.clientY - pointerStart.y;
      pointerStart = null;
      if (Math.hypot(dx, dy) > 10) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(
        markers.map((m) => m.userData.hit),
        false
      );
      if (!intersects.length) return;
      const code = intersects[0].object.userData.code;
      autoIndex = languages.findIndex((l) => l.code === code);
      selectLanguage(code, true);
      scheduleAutoCycle();
    });

    window.addEventListener("resize", scheduleResize);
    window.addEventListener("orientationchange", scheduleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", scheduleResize);
    }
    window.addEventListener("pagehide", () => {
      disposed = true;
      window.cancelAnimationFrame(animFrame);
      window.clearTimeout(autoTimer);
      window.clearTimeout(resizeTimer);
      renderer.dispose();
    });

    const hint = root.querySelector(".lang-globe__hint");
    if (hint && mobileLike) {
      hint.textContent = "Swipe to orbit · Tap a marker";
    }

    selectLanguage(activeCode, false);
    scheduleAutoCycle();
    animate();
  }

  bindChrome();
  syncUi(activeCode);

  if (!hasWebGL()) {
    mountFlatGlobe();
    return;
  }

  mountThreeGlobe().catch(() => {
    mountFlatGlobe();
  });
}
