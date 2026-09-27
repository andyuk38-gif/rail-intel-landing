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
    const countries = [...new Set(lang.places.map((p) => p.country).filter(Boolean))];
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
      (countries.length
        ? '<p class="lang-globe__status-countries"><span>Countries</span> ' +
          escapeHtml(countries.join(" · ")) +
          "</p>"
        : "") +
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
          '" aria-label="' +
          escapeHtml(place.name + (place.country ? ", " + place.country : "")) +
          '">' +
          '<span class="lang-globe__place-city">' +
          escapeHtml(place.name) +
          "</span>" +
          (place.country
            ? '<span class="lang-globe__place-country">' + escapeHtml(place.country) + "</span>"
            : "") +
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
        const onLang = el.getAttribute("data-lang") === code;
        const onPlace = el.getAttribute("data-place-id") === placeId;
        el.classList.toggle("is-visible", onLang);
        el.classList.toggle("is-active", onPlace);
        el.classList.toggle("lang-globe__label--pin", onLang && !onPlace);
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
          '<strong>' +
          escapeHtml(place.name) +
          "</strong>" +
          (place.country ? "<em>" + escapeHtml(place.country) + "</em>" : "") +
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
        const onLang = parent && parent.getAttribute("data-flat-marker") === code;
        const onPlace = parent && parent.getAttribute("data-place-id") === placeId;
        tag.hidden = !onLang;
        tag.classList.toggle("is-active", Boolean(onPlace));
      });
    };

    const hint = root.querySelector(".lang-globe__hint");
    if (hint) hint.textContent = "Choose a language, then a city";

    // Flat zoom: scale the disc within the square frame
    const zoomRoot = stage.querySelector("[data-lang-globe-zoom]");
    let flatScale = 1;
    const FLAT_MIN = 0.85;
    const FLAT_MAX = 1.55;
    function applyFlatZoom() {
      disc.style.transform = "scale(" + flatScale + ")";
      const zoomInBtn = stage.querySelector("[data-lang-globe-zoom-in]");
      const zoomOutBtn = stage.querySelector("[data-lang-globe-zoom-out]");
      if (zoomInBtn) zoomInBtn.disabled = flatScale >= FLAT_MAX - 0.01;
      if (zoomOutBtn) zoomOutBtn.disabled = flatScale <= FLAT_MIN + 0.01;
    }
    if (zoomRoot) {
      disc.style.transformOrigin = "center center";
      disc.style.transition = reducedMotion ? "none" : "transform 0.28s ease";
      zoomRoot.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-lang-globe-zoom-in], [data-lang-globe-zoom-out]");
        if (!btn) return;
        event.preventDefault();
        if (btn.hasAttribute("data-lang-globe-zoom-in")) {
          flatScale = Math.min(FLAT_MAX, flatScale * 1.18);
        } else {
          flatScale = Math.max(FLAT_MIN, flatScale / 1.18);
        }
        applyFlatZoom();
      });
      applyFlatZoom();
    }

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

    const GLOBE_RADIUS = 1.8;
    const MARKER_R = 0.032;
    const FOV = 36;
    // Slight padding between globe edge and square frame
    const FILL = 0.88;
    const NIGHT_TEX =
      "https://cdn.jsdelivr.net/npm/three-globe@2.44.0/example/img/earth-night.jpg";
    const BUMP_TEX =
      "https://cdn.jsdelivr.net/npm/three-globe@2.44.0/example/img/earth-topology.png";

    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (width < 2 || height < 2) throw new Error("stage-size");

    function cameraDistance() {
      const halfFov = (FOV * Math.PI) / 360;
      // Include atmosphere shell so nothing is cropped at default zoom
      return (GLOBE_RADIUS * 1.06) / (Math.tan(halfFov) * FILL);
    }

    const CAM_DIST = cameraDistance();
    const ZOOM_MIN = CAM_DIST * 0.55;
    const ZOOM_MAX = CAM_DIST * 1.55;
    const ZOOM_STEP = 0.82;

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
    renderer.toneMappingExposure = 1.55;
    canvasWrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, width / height, 0.1, 100);
    camera.position.set(0.12, 0.2, CAM_DIST);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = ZOOM_MIN;
    controls.maxDistance = ZOOM_MAX;
    controls.enableZoom = true;
    controls.zoomSpeed = mobileLike ? 0.7 : 0.9;
    controls.rotateSpeed = mobileLike ? 0.55 : 0.7;
    controls.autoRotate = false;
    controls.target.set(0, 0, 0);
    if (THREE.TOUCH) {
      controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
    }

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Night sky — denser, quieter stars
    {
      const count = 1400;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i += 1) {
        const r = 16 + Math.random() * 36;
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
            color: 0xc9d6ea,
            size: 0.02,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
            sizeAttenuation: true,
          })
        )
      );
    }

    // Low key night lighting — city lights come from the texture itself
    scene.add(new THREE.AmbientLight(0x6a7a9a, 0.35));
    const key = new THREE.DirectionalLight(0xa8b8d8, 0.55);
    key.position.set(3.5, 1.8, 2.8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x4a6aaa, 0.4);
    rim.position.set(-3, -1, -2.5);
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

    // Night earth with city lights (emissive map = the glow)
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1.45,
      roughness: 1,
      metalness: 0,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS, 128, 128), earthMat);
    globeGroup.add(earth);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      NIGHT_TEX,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(12, renderer.capabilities.getMaxAnisotropy());
        earthMat.map = tex;
        earthMat.emissiveMap = tex;
        earthMat.needsUpdate = true;
      },
      undefined,
      () => {
        earthMat.color = new THREE.Color(0x0a1528);
        earthMat.emissive = new THREE.Color(0x1a2a44);
      }
    );
    loader.load(
      BUMP_TEX,
      (tex) => {
        earthMat.bumpMap = tex;
        earthMat.bumpScale = 0.028;
        earthMat.needsUpdate = true;
      },
      undefined,
      () => {}
    );

    // Soft night atmosphere
    globeGroup.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(GLOBE_RADIUS * 1.06, 64, 64),
        new THREE.ShaderMaterial({
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
          uniforms: {
            glowColor: { value: new THREE.Color(0x4a7fd4) },
            coefficient: { value: 0.3 },
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
              gl_FragColor = vec4(glowColor, 1.0) * intensity * 0.9;
            }
          `,
        })
      )
    );

    const markers = [];
    const labelEls = [];
    const hitScale = mobileLike ? 5.5 : 4.2;
    const arcsGroup = new THREE.Group();
    globeGroup.add(arcsGroup);
    const activeArcs = [];

    function clearArcs() {
      while (arcsGroup.children.length) {
        const child = arcsGroup.children[0];
        arcsGroup.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
          else child.material.dispose();
        }
      }
      activeArcs.length = 0;
    }

    function makeArcCurve(fromPlace, toPlace) {
      const startDir = latLngToVector3(fromPlace.lat, fromPlace.lng, 1).normalize();
      const endDir = latLngToVector3(toPlace.lat, toPlace.lng, 1).normalize();
      const angle = Math.acos(Math.min(1, Math.max(-1, startDir.dot(endDir))));
      // Higher arcs for longer hauls so they clear the globe and stay readable
      const peakAlt = 0.08 + Math.min(0.55, angle * 0.35);

      function pointAt(t) {
        let dir;
        if (angle < 1e-4) {
          dir = startDir.clone().lerp(endDir, t).normalize();
        } else {
          const sinA = Math.sin(angle);
          const a = Math.sin((1 - t) * angle) / sinA;
          const b = Math.sin(t * angle) / sinA;
          dir = startDir.clone().multiplyScalar(a).add(endDir.clone().multiplyScalar(b)).normalize();
        }
        const alt = GLOBE_RADIUS + 0.02 + Math.sin(Math.PI * t) * peakAlt;
        return dir.multiplyScalar(alt);
      }

      return {
        getPoints(divisions) {
          const pts = [];
          for (let i = 0; i <= divisions; i += 1) pts.push(pointAt(i / divisions));
          return pts;
        },
        getPoint(t) {
          return pointAt(Math.min(1, Math.max(0, t)));
        },
      };
    }

    function buildLanguageArcs(lang, animateArcs) {
      clearArcs();
      if (!lang || lang.places.length < 2) return;

      const origin = lang.places.find((p) => p.primary) || lang.places[0];
      const seen = new Set([origin.country || origin.name]);
      const destinations = [];
      lang.places.forEach((place) => {
        if (place.id === origin.id) return;
        const key = place.country || place.name;
        if (seen.has(key)) return;
        seen.add(key);
        destinations.push(place);
      });

      destinations.forEach((dest, index) => {
        const curve = makeArcCurve(origin, dest);
        const pointCount = 96;
        const points = curve.getPoints(pointCount);
        const positions = new Float32Array(points.length * 3);
        points.forEach((p, i) => {
          positions[i * 3] = p.x;
          positions[i * 3 + 1] = p.y;
          positions[i * 3 + 2] = p.z;
        });

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.setDrawRange(0, animateArcs && !reducedMotion ? 2 : points.length);

        const mat = new THREE.LineBasicMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: 0.0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const line = new THREE.Line(geo, mat);
        line.renderOrder = 2;
        arcsGroup.add(line);

        // Soft outer glow twin
        const glowMat = new THREE.LineBasicMaterial({
          color: 0xffc857,
          transparent: true,
          opacity: 0.0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const glow = new THREE.Line(geo.clone(), glowMat);
        glow.renderOrder = 1;
        arcsGroup.add(glow);

        // Traveling pulse bead
        const bead = new THREE.Mesh(
          new THREE.SphereGeometry(MARKER_R * 0.55, 10, 10),
          new THREE.MeshBasicMaterial({
            color: 0xffe08a,
            transparent: true,
            opacity: 0,
            depthWrite: false,
          })
        );
        bead.visible = false;
        arcsGroup.add(bead);

        activeArcs.push({
          line,
          glow,
          bead,
          curve,
          pointCount: points.length,
          startTime: performance.now() + index * 90,
          duration: 900,
          progress: animateArcs && !reducedMotion ? 0 : 1,
          phase: index * 0.37,
        });
      });
    }

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
            escapeHtml(place.country || lang.name) +
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
    let activeLangCode = "";
    const clock = new THREE.Clock();

    function syncMarkers(code, placeId) {
      markers.forEach((marker) => {
        const onLang = marker.userData.code === code;
        const onPlace = marker.userData.placeId === placeId;
        const isOrigin = onLang && marker.userData.primary;
        marker.visible = onLang;
        marker.scale.setScalar(onPlace || isOrigin ? 1.45 : 1);
        if (marker.userData.head) {
          marker.userData.head.material.emissiveIntensity =
            onPlace || isOrigin ? 1.7 : 0.7;
          marker.userData.head.material.color.set(
            onPlace || isOrigin ? 0xffe8a8 : 0xffc857
          );
        }
        if (marker.userData.halo) {
          marker.userData.halo.material.opacity = onPlace || isOrigin ? 0.6 : 0.28;
        }
        if (marker.userData.ring) marker.userData.ring.visible = onPlace || isOrigin;
      });
      labelEls.forEach(({ el }) => {
        const onLang = el.getAttribute("data-lang") === code;
        const onPlace = el.getAttribute("data-place-id") === placeId;
        el.classList.toggle("is-visible", onLang);
        el.classList.toggle("is-active", onPlace);
        el.classList.toggle("lang-globe__label--pin", onLang && !onPlace);
      });
    }

    function focusPlace(code, placeId, animate) {
      const lang = getLang(code);
      if (!lang) return;
      const place = getPlace(lang, placeId);
      syncMarkers(code, place.id);

      const langChanged = code !== activeLangCode;
      activeLangCode = code;
      if (langChanged || !activeArcs.length) {
        buildLanguageArcs(lang, animate !== false);
      }

      const target = latLngToVector3(place.lat, place.lng, GLOBE_RADIUS);
      const dist = Math.min(
        Math.max(camera.position.length() || CAM_DIST, ZOOM_MIN),
        ZOOM_MAX
      );
      const desired = target.clone().normalize().multiplyScalar(dist);
      desired.y += 0.06;
      desired.setLength(dist);

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

    function updateArcs(now, elapsed) {
      activeArcs.forEach((arc) => {
        if (arc.progress < 1) {
          const t = Math.min(1, Math.max(0, (now - arc.startTime) / arc.duration));
          const eased = 1 - Math.pow(1 - t, 3);
          arc.progress = eased;
          const count = Math.max(2, Math.floor(arc.pointCount * eased));
          arc.line.geometry.setDrawRange(0, count);
          arc.glow.geometry.setDrawRange(0, count);
          arc.line.material.opacity = 0.2 + eased * 0.65;
          arc.glow.material.opacity = 0.05 + eased * 0.22;
          if (eased >= 1) {
            arc.bead.visible = true;
            arc.bead.material.opacity = 0.95;
          }
        } else {
          arc.line.material.opacity = 0.55 + Math.sin(elapsed * 2 + arc.phase) * 0.12;
          arc.glow.material.opacity = 0.16 + Math.sin(elapsed * 2 + arc.phase) * 0.05;
          const beadT = (elapsed * 0.22 + arc.phase) % 1;
          const pos = arc.curve.getPoint(beadT);
          arc.bead.position.copy(pos);
          arc.bead.visible = true;
          arc.bead.material.opacity = 0.55 + Math.sin(beadT * Math.PI) * 0.4;
        }
      });
    }

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
        if (t >= 1) {
          focusTween = null;
          syncZoomButtons();
        }
      }

      markers.forEach((marker) => {
        if (!marker.userData.ring || !marker.userData.ring.visible) return;
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 2.4);
        const s = 1 + pulse * 0.35;
        marker.userData.ring.scale.set(s, s, 1);
        marker.userData.ring.material.opacity = 0.85 - pulse * 0.35;
      });

      updateArcs(now, elapsed);

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
      clearArcs();
      renderer.dispose();
    });

    function currentZoomDistance() {
      return camera.position.distanceTo(controls.target);
    }

    function setZoomDistance(nextDist, animateZoom) {
      const dist = Math.min(Math.max(nextDist, ZOOM_MIN), ZOOM_MAX);
      const offset = camera.position.clone().sub(controls.target).normalize().multiplyScalar(dist);
      const end = controls.target.clone().add(offset);
      if (!animateZoom || reducedMotion) {
        camera.position.copy(end);
        controls.update();
        syncZoomButtons();
        return;
      }
      focusTween = {
        start: camera.position.clone(),
        end,
        startTime: performance.now(),
        duration: 280,
      };
      syncZoomButtons();
    }

    function zoomBy(factor) {
      setZoomDistance(currentZoomDistance() * factor, true);
    }

    function syncZoomButtons() {
      const dist = currentZoomDistance();
      const zoomInBtn = stage.querySelector("[data-lang-globe-zoom-in]");
      const zoomOutBtn = stage.querySelector("[data-lang-globe-zoom-out]");
      if (zoomInBtn) zoomInBtn.disabled = dist <= ZOOM_MIN + 0.02;
      if (zoomOutBtn) zoomOutBtn.disabled = dist >= ZOOM_MAX - 0.02;
    }

    const zoomRoot = stage.querySelector("[data-lang-globe-zoom]");
    if (zoomRoot) {
      zoomRoot.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-lang-globe-zoom-in], [data-lang-globe-zoom-out]");
        if (!btn) return;
        event.preventDefault();
        if (btn.hasAttribute("data-lang-globe-zoom-in")) zoomBy(ZOOM_STEP);
        else zoomBy(1 / ZOOM_STEP);
      });
    }

    controls.addEventListener("change", syncZoomButtons);
    syncZoomButtons();

    const hint = root.querySelector(".lang-globe__hint");
    if (hint) hint.textContent = "Click a city · Drag to explore · Use +/− to zoom";

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
