/**
 * Languages coverage globe — premium interactive Three.js earth.
 * Manual orbit only. One language at a time. City pins with labels on select.
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
  const dataNode = root.querySelector("[data-lang-globe-data]");

  let placeCatalog = [];
  try {
    placeCatalog = dataNode ? JSON.parse(dataNode.textContent || "[]") : [];
  } catch {
    placeCatalog = [];
  }

  const languages = listButtons
    .map((btn) => {
      const code = btn.getAttribute("data-lang-globe-select");
      const fromCatalog = placeCatalog.find((item) => item.code === code);
      const lat = parseFloat(btn.getAttribute("data-lang-lat"));
      const lng = parseFloat(btn.getAttribute("data-lang-lng"));
      const rawPlaces =
        fromCatalog?.places?.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)) ||
        (Number.isFinite(lat) && Number.isFinite(lng)
          ? [{ name: btn.getAttribute("data-lang-region") || code, country: "", lat, lng, primary: true }]
          : []);

      return {
        code,
        name: btn.getAttribute("data-lang-name") || fromCatalog?.name || "",
        nativeName: btn.getAttribute("data-lang-native") || fromCatalog?.nativeName || "",
        region: btn.getAttribute("data-lang-region") || fromCatalog?.region || "",
        places: rawPlaces.map((place, index) => ({
          name: place.name,
          country: place.country || "",
          lat: place.lat,
          lng: place.lng,
          primary: Boolean(place.primary) || index === 0,
          id: code + ":" + index,
        })),
        button: btn,
      };
    })
    .filter((lang) => lang.code && lang.places.length);

  if (!stage || !canvasWrap || !languages.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeCode = languages[0].code;
  let activePlaceId = languages[0].places.find((p) => p.primary)?.id || languages[0].places[0].id;
  let focusHandler = null;

  let placesEl = root.querySelector("[data-lang-globe-places]");
  if (!placesEl && statusEl) {
    placesEl = document.createElement("div");
    placesEl.className = "lang-globe__places";
    placesEl.setAttribute("data-lang-globe-places", "");
    statusEl.insertAdjacentElement("afterend", placesEl);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getLang(code) {
    return languages.find((item) => item.code === code);
  }

  function getPlace(lang, placeId) {
    return (
      lang.places.find((p) => p.id === placeId) ||
      lang.places.find((p) => p.primary) ||
      lang.places[0]
    );
  }

  function setStatus(lang, place) {
    if (!statusEl) return;
    statusEl.innerHTML =
      '<p class="lang-globe__status-line"><strong>' +
      escapeHtml(lang.name) +
      "</strong> · " +
      escapeHtml(lang.nativeName) +
      "</p>" +
      '<p class="lang-globe__status-city">' +
      escapeHtml(place.name) +
      (place.country ? ", " + escapeHtml(place.country) : "") +
      "</p>" +
      '<p class="lang-globe__status-region">' +
      escapeHtml(lang.region) +
      "</p>";
  }

  function renderPlaceChips(lang, placeId) {
    if (!placesEl) return;
    placesEl.innerHTML = lang.places
      .map(
        (place) =>
          '<button type="button" class="lang-globe__place-chip' +
          (place.id === placeId ? " is-active" : "") +
          '" data-place-id="' +
          escapeHtml(place.id) +
          '" data-lang-code="' +
          escapeHtml(lang.code) +
          '">' +
          escapeHtml(place.name) +
          "</button>"
      )
      .join("");

    placesEl.querySelectorAll("[data-place-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectPlace(btn.getAttribute("data-lang-code"), btn.getAttribute("data-place-id"), true);
      });
    });
  }

  function syncUi(code, placeId) {
    activeCode = code;
    activePlaceId = placeId;
    const lang = getLang(code);
    const place = getPlace(lang, placeId);

    listButtons.forEach((btn) => {
      const on = btn.getAttribute("data-lang-globe-select") === code;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    cards.forEach((card) => {
      card.classList.toggle("is-globe-active", card.getAttribute("data-lang") === code);
    });
    stage.querySelectorAll("[data-flat-marker]").forEach((el) => {
      const onLang = el.getAttribute("data-flat-marker") === code;
      const onPlace = el.getAttribute("data-place-id") === placeId;
      el.hidden = !onLang;
      el.classList.toggle("is-selected", onPlace);
    });
    if (labelsLayer) {
      labelsLayer.querySelectorAll(".lang-globe__label").forEach((el) => {
        el.classList.toggle("is-visible", el.getAttribute("data-place-id") === placeId);
      });
    }

    setStatus(lang, place);
    renderPlaceChips(lang, placeId);
  }

  function selectPlace(code, placeId, animate) {
    const lang = getLang(code);
    if (!lang) return;
    const place = getPlace(lang, placeId);
    syncUi(code, place.id);
    if (typeof focusHandler === "function") focusHandler(code, place.id, animate !== false);
  }

  function selectLanguage(code, animate) {
    const lang = getLang(code);
    if (!lang) return;
    const place = lang.places.find((p) => p.primary) || lang.places[0];
    selectPlace(code, place.id, animate);
  }

  function bindChrome() {
    listButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        selectLanguage(btn.getAttribute("data-lang-globe-select"), true);
      });
    });

    cards.forEach((card) => {
      card.style.cursor = "pointer";
      card.setAttribute("tabindex", "0");
      card.addEventListener("click", () => {
        const code = card.getAttribute("data-lang");
        if (!code) return;
        selectLanguage(code, true);
        root.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
      });
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        card.click();
      });
    });
  }

  function projectFlat(lat, lng) {
    return {
      x: Math.min(0.92, Math.max(0.08, 0.5 + lng / 360)),
      y: Math.min(0.92, Math.max(0.08, 0.5 - lat / 180)),
    };
  }

  function mountFlatGlobe() {
    if (fallback) fallback.hidden = true;
    canvasWrap.innerHTML = "";
    canvasWrap.classList.add("lang-globe__canvas-wrap--flat");

    const disc = document.createElement("div");
    disc.className = "lang-globe__flat";
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
      lang.places.forEach((place) => {
        const pos = projectFlat(place.lat, place.lng);
        const marker = document.createElement("button");
        marker.type = "button";
        marker.className = "lang-globe__flat-marker";
        marker.setAttribute("data-flat-marker", lang.code);
        marker.setAttribute("data-place-id", place.id);
        marker.setAttribute(
          "aria-label",
          place.name + (place.country ? ", " + place.country : "")
        );
        marker.style.left = pos.x * 100 + "%";
        marker.style.top = pos.y * 100 + "%";
        marker.innerHTML =
          '<span class="lang-globe__flat-core"></span><span class="lang-globe__flat-tag">' +
          escapeHtml(place.name) +
          "</span>";
        marker.addEventListener("click", () => selectPlace(lang.code, place.id, true));
        markersHost.appendChild(marker);
      });
    });

    focusHandler = (code, placeId) => {
      const sphere = disc.querySelector(".lang-globe__flat-sphere");
      const lang = getLang(code);
      const place = getPlace(lang, placeId);
      if (!sphere || !place) return;
      const x = 50 - place.lng * 0.28;
      const y = 50 - place.lat * 0.22;
      sphere.style.backgroundPosition = "center, " + x + "% " + y + "%";
      sphere.style.transform =
        "rotateX(" + (6 + place.lat * 0.05) + "deg) rotateY(" + place.lng * -0.06 + "deg)";
      markersHost.querySelectorAll(".lang-globe__flat-tag").forEach((tag) => {
        const parent = tag.closest("[data-place-id]");
        tag.hidden = !(parent && parent.getAttribute("data-place-id") === placeId);
      });
    };

    const hint = root.querySelector(".lang-globe__hint");
    if (hint) hint.textContent = "Choose a language, then a city";
    selectPlace(activeCode, activePlaceId, false);
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

    const GLOBE_RADIUS = 1.72;
    const MARKER_R = 0.028;
    const CAM_DIST = 3.55;
    const EARTH_TEX =
      "https://cdn.jsdelivr.net/npm/three-globe@2.44.0/example/img/earth-blue-marble.jpg";
    const BUMP_TEX =
      "https://cdn.jsdelivr.net/npm/three-globe@2.44.0/example/img/earth-topology.png";
    const WATER_TEX =
      "https://cdn.jsdelivr.net/npm/three-globe@2.44.0/example/img/earth-water.png";

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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    canvasWrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(0.35, 0.55, CAM_DIST);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.85;
    controls.maxDistance = 4.8;
    controls.enableZoom = !mobileLike;
    controls.rotateSpeed = mobileLike ? 0.55 : 0.72;
    controls.autoRotate = false;
    controls.target.set(0, 0, 0);
    if (THREE.TOUCH) {
      controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
    }

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Sparse starfield — keep quiet so earth stays the hero
    {
      const count = 480;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i += 1) {
        const r = 18 + Math.random() * 28;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      scene.add(
        new THREE.Points(
          geo,
          new THREE.PointsMaterial({
            color: 0xb8c6d9,
            size: 0.022,
            transparent: true,
            opacity: 0.4,
            depthWrite: false,
            sizeAttenuation: true,
          })
        )
      );
    }

    // Even, exhibition lighting so continents stay readable
    scene.add(new THREE.AmbientLight(0xd8e4f5, 0.95));
    const key = new THREE.DirectionalLight(0xffffff, 1.85);
    key.position.set(4.5, 2.8, 3.2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xa8c4ff, 0.65);
    fill.position.set(-3.5, 1.2, -2.5);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.45);
    rim.position.set(-1, -2.5, -3.5);
    scene.add(rim);

    function latLngToVector3(lat, lng, radius) {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lng + 180) * Math.PI) / 180;
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    // Day marble — full brightness, no muddy tint
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.82,
      metalness: 0.04,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS, 128, 128), earthMat);
    globeGroup.add(earth);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      EARTH_TEX,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(12, renderer.capabilities.getMaxAnisotropy());
        earthMat.map = tex;
        earthMat.needsUpdate = true;
      },
      undefined,
      () => {
        earthMat.color = new THREE.Color(0x2a4a6e);
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
    loader.load(
      WATER_TEX,
      (tex) => {
        earthMat.metalnessMap = tex;
        earthMat.metalness = 0.42;
        earthMat.roughness = 0.72;
        earthMat.needsUpdate = true;
      },
      undefined,
      () => {}
    );

    // Soft atmospheric halo
    globeGroup.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(GLOBE_RADIUS * 1.07, 64, 64),
        new THREE.ShaderMaterial({
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
          uniforms: {
            glowColor: { value: new THREE.Color(0x7eb0ff) },
            coefficient: { value: 0.32 },
            power: { value: 3.6 },
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
              gl_FragColor = vec4(glowColor, 1.0) * intensity * 0.85;
            }
          `,
        })
      )
    );

    // Subtle under-glow disc for depth
    const floorGlow = new THREE.Mesh(
      new THREE.CircleGeometry(GLOBE_RADIUS * 1.05, 64),
      new THREE.MeshBasicMaterial({
        color: 0x3a5f9a,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      })
    );
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.y = -GLOBE_RADIUS * 0.98;
    globeGroup.add(floorGlow);

    const markers = [];
    const labelEls = [];
    const hitScale = mobileLike ? 5.5 : 4.2;

    languages.forEach((lang) => {
      lang.places.forEach((place) => {
        const group = new THREE.Group();
        const pos = latLngToVector3(place.lat, place.lng, GLOBE_RADIUS + 0.012);
        group.position.copy(pos);
        group.lookAt(0, 0, 0);
        group.userData = {
          code: lang.code,
          placeId: place.id,
          placeName: place.name,
          country: place.country || "",
          primary: place.primary,
        };

        // +Z is outward after lookAt points -Z at centre
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(MARKER_R * 0.16, MARKER_R * 0.22, MARKER_R * 2.4, 10),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b })
        );
        stem.rotation.x = Math.PI / 2;
        stem.position.z = MARKER_R * 1.2;
        group.add(stem);
        group.userData.stem = stem;

        const head = new THREE.Mesh(
          new THREE.SphereGeometry(MARKER_R, 20, 20),
          new THREE.MeshStandardMaterial({
            color: 0xffc857,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.85,
            metalness: 0.2,
            roughness: 0.3,
          })
        );
        head.position.z = MARKER_R * 2.35;
        group.add(head);
        group.userData.head = head;

        const halo = new THREE.Mesh(
          new THREE.CircleGeometry(MARKER_R * 1.7, 32),
          new THREE.MeshBasicMaterial({
            color: 0xfbbf24,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide,
            depthWrite: false,
          })
        );
        halo.position.z = MARKER_R * 2.34;
        group.add(halo);
        group.userData.halo = halo;

        const ring = new THREE.Mesh(
          new THREE.RingGeometry(MARKER_R * 2.0, MARKER_R * 2.55, 48),
          new THREE.MeshBasicMaterial({
            color: 0xffe08a,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            depthWrite: false,
          })
        );
        ring.position.z = MARKER_R * 2.35;
        ring.visible = false;
        group.add(ring);
        group.userData.ring = ring;

        const hit = new THREE.Mesh(
          new THREE.SphereGeometry(MARKER_R * hitScale, 8, 8),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        hit.position.z = MARKER_R * 2.35;
        hit.userData.code = lang.code;
        hit.userData.placeId = place.id;
        group.add(hit);
        group.userData.hit = hit;

        group.visible = false;
        globeGroup.add(group);
        markers.push(group);

        if (labelsLayer) {
          const el = document.createElement("div");
          el.className = "lang-globe__label";
          el.setAttribute("data-lang", lang.code);
          el.setAttribute("data-place-id", place.id);
          el.innerHTML =
            "<strong>" +
            escapeHtml(place.name) +
            "</strong><span>" +
            escapeHtml(lang.name) +
            (place.country ? " · " + escapeHtml(place.country) : "") +
            "</span>";
          labelsLayer.appendChild(el);
          labelEls.push({ el, marker: group });
        }
      });
    });

    let focusTween = null;
    let pointerDown = false;
    let disposed = false;
    let animFrame = 0;
    const clock = new THREE.Clock();

    function syncMarkers(code, placeId) {
      markers.forEach((marker) => {
        const onLang = marker.userData.code === code;
        const onPlace = marker.userData.placeId === placeId;
        marker.visible = onLang;
        marker.scale.setScalar(onPlace ? 1.4 : 0.92);
        if (marker.userData.head) {
          marker.userData.head.material.emissiveIntensity = onPlace ? 1.55 : 0.55;
          marker.userData.head.material.color.set(onPlace ? 0xffe8a8 : 0xffc857);
        }
        if (marker.userData.halo) {
          marker.userData.halo.material.opacity = onPlace ? 0.55 : 0.22;
        }
        if (marker.userData.ring) marker.userData.ring.visible = onPlace;
      });
      labelEls.forEach(({ el }) => {
        el.classList.toggle("is-visible", el.getAttribute("data-place-id") === placeId);
      });
    }

    function focusPlace(code, placeId, animate) {
      const lang = getLang(code);
      if (!lang) return;
      const place = getPlace(lang, placeId);
      syncMarkers(code, place.id);

      const target = latLngToVector3(place.lat, place.lng, GLOBE_RADIUS);
      const desired = target.clone().normalize().multiplyScalar(CAM_DIST);
      desired.y += 0.12;
      desired.setLength(CAM_DIST);

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
        duration: 780,
      };
    }

    focusHandler = (code, placeId, animate) => focusPlace(code, placeId, animate);

    function projectLabels() {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const camDir = camera.position.clone().normalize();
      labelEls.forEach(({ el, marker }) => {
        if (!el.classList.contains("is-visible") || !marker.visible) {
          el.style.visibility = "hidden";
          return;
        }
        const world = new THREE.Vector3();
        marker.getWorldPosition(world);
        world.addScaledVector(world.clone().normalize(), 0.12);
        const facing = world.clone().normalize().dot(camDir) > 0.08;
        const ndc = world.clone().project(camera);
        if (!facing || ndc.z >= 1 || Math.abs(ndc.x) > 1.05 || Math.abs(ndc.y) > 1.05) {
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

      markers.forEach((marker) => {
        if (!marker.userData.ring || !marker.userData.ring.visible) return;
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 2.4);
        const s = 1 + pulse * 0.35;
        marker.userData.ring.scale.set(s, s, 1);
        marker.userData.ring.material.opacity = 0.85 - pulse * 0.35;
      });

      controls.update();
      renderer.render(scene, camera);
      projectLabels();
    }

    renderer.domElement.addEventListener("pointerdown", () => {
      pointerDown = true;
      canvasWrap.classList.add("is-dragging");
    });
    window.addEventListener("pointerup", () => {
      if (!pointerDown) return;
      pointerDown = false;
      canvasWrap.classList.remove("is-dragging");
    });
    window.addEventListener("pointercancel", () => {
      if (!pointerDown) return;
      pointerDown = false;
      canvasWrap.classList.remove("is-dragging");
    });

    let pointerStart = null;
    renderer.domElement.addEventListener("pointerdown", (event) => {
      pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
    });
    renderer.domElement.addEventListener("pointerup", (event) => {
      if (!pointerStart || pointerStart.id !== event.pointerId) return;
      const dx = event.clientX - pointerStart.x;
      const dy = event.clientY - pointerStart.y;
      pointerStart = null;
      if (Math.hypot(dx, dy) > 8) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.params.Mesh = raycaster.params.Mesh || {};
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(
        markers.filter((m) => m.visible).map((m) => m.userData.hit),
        false
      );
      if (!hits.length) return;
      selectPlace(hits[0].object.userData.code, hits[0].object.userData.placeId, true);
    });

    window.addEventListener("resize", scheduleResize);
    window.addEventListener("orientationchange", scheduleResize);
    if (window.visualViewport) window.visualViewport.addEventListener("resize", scheduleResize);
    window.addEventListener("pagehide", () => {
      disposed = true;
      window.cancelAnimationFrame(animFrame);
      window.clearTimeout(resizeTimer);
      renderer.dispose();
    });

    const hint = root.querySelector(".lang-globe__hint");
    if (hint) hint.textContent = "Click a city · Drag to explore";

    selectPlace(activeCode, activePlaceId, false);
    animate();
  }

  bindChrome();
  syncUi(activeCode, activePlaceId);

  if (!hasWebGL()) {
    mountFlatGlobe();
    return;
  }

  mountThreeGlobe().catch(() => mountFlatGlobe());
}
