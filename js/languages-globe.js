/**
 * Languages coverage globe — interactive Three.js earth with language markers.
 * Click a language or city pin to focus coverage. Manual orbit only (no auto motion).
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
      const places =
        fromCatalog?.places?.filter(
          (place) => Number.isFinite(place.lat) && Number.isFinite(place.lng)
        ) ||
        (Number.isFinite(lat) && Number.isFinite(lng)
          ? [
              {
                name: btn.getAttribute("data-lang-region") || code,
                country: "",
                lat,
                lng,
                primary: true,
              },
            ]
          : []);

      return {
        code,
        name: btn.getAttribute("data-lang-name") || fromCatalog?.name || "",
        nativeName: btn.getAttribute("data-lang-native") || fromCatalog?.nativeName || "",
        region: btn.getAttribute("data-lang-region") || fromCatalog?.region || "",
        places: places.map((place, index) => ({
          ...place,
          id: code + ":" + index + ":" + place.name,
          primary: Boolean(place.primary) || index === 0,
        })),
        button: btn,
      };
    })
    .filter((lang) => lang.code && lang.places.length);

  if (!stage || !canvasWrap || !languages.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeCode = languages[0].code;
  let activePlaceId =
    languages[0].places.find((p) => p.primary)?.id || languages[0].places[0].id;
  let focusHandler = null;

  // City chip strip under status
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
    return lang.places.find((p) => p.id === placeId) || lang.places.find((p) => p.primary) || lang.places[0];
  }

  function setStatus(lang, place) {
    if (!statusEl) return;
    statusEl.innerHTML =
      "<strong>" +
      escapeHtml(lang.name) +
      "</strong> · " +
      escapeHtml(lang.nativeName) +
      "<br /><span class=\"lang-globe__status-places\">" +
      escapeHtml(place.name) +
      (place.country ? ", " + escapeHtml(place.country) : "") +
      " · " +
      escapeHtml(lang.region) +
      "</span>";
  }

  function renderPlaceChips(lang, placeId) {
    if (!placesEl) return;
    placesEl.innerHTML = lang.places
      .map(
        (place) =>
          `<button type="button" class="lang-globe__place-chip${
            place.id === placeId ? " is-active" : ""
          }" data-place-id="${escapeHtml(place.id)}" data-lang-code="${escapeHtml(lang.code)}">
            <span class="lang-globe__place-dot" aria-hidden="true"></span>
            ${escapeHtml(place.name)}
          </button>`
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
      el.classList.toggle("is-active", onLang);
      el.classList.toggle("is-selected", onPlace);
      el.classList.toggle("is-dim", !onLang);
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
    if (typeof focusHandler === "function") {
      focusHandler(code, place.id, animate !== false);
    }
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
      x: Math.min(0.94, Math.max(0.06, 0.5 + lng / 360)),
      y: Math.min(0.94, Math.max(0.06, 0.5 - lat / 180)),
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
      lang.places.forEach((place) => {
        const pos = projectFlat(place.lat, place.lng);
        const marker = document.createElement("button");
        marker.type = "button";
        marker.className = "lang-globe__flat-marker" + (place.primary ? " is-primary" : "");
        marker.setAttribute("data-flat-marker", lang.code);
        marker.setAttribute("data-place-id", place.id);
        marker.setAttribute(
          "aria-label",
          lang.name + " — " + place.name + (place.country ? ", " + place.country : "")
        );
        marker.style.left = pos.x * 100 + "%";
        marker.style.top = pos.y * 100 + "%";
        marker.innerHTML = `
          <span class="lang-globe__flat-pulse"></span>
          <span class="lang-globe__flat-core"></span>
          <span class="lang-globe__flat-tag">${escapeHtml(place.name)}</span>
        `;
        marker.addEventListener("click", () => {
          selectPlace(lang.code, place.id, true);
        });
        markersHost.appendChild(marker);
      });
    });

    focusHandler = (code, placeId) => {
      const sphere = disc.querySelector(".lang-globe__flat-sphere");
      const lang = getLang(code);
      const place = getPlace(lang, placeId);
      if (!sphere || !place) return;
      sphere.style.transform =
        "rotateX(" +
        (6 + place.lat * 0.01) +
        "deg) rotateY(" +
        place.lng * -0.12 +
        "deg)";

      markersHost.querySelectorAll(".lang-globe__flat-tag").forEach((tag) => {
        const parent = tag.closest("[data-place-id]");
        tag.hidden = !(parent && parent.getAttribute("data-place-id") === placeId);
      });
    };

    const hint = root.querySelector(".lang-globe__hint");
    if (hint) hint.textContent = "Click a city pin · Or choose a language";

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

    const GLOBE_RADIUS = 1.6;
    const MARKER_RADIUS = 0.026;
    const EARTH_TEX =
      "https://cdn.jsdelivr.net/npm/three-globe@2.44.0/example/img/earth-dark.jpg";
    const LIGHTS_TEX =
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
    controls.autoRotate = false;
    controls.target.set(0, 0, 0);
    if (THREE.TOUCH) {
      controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };
    }

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    {
      const count = 1200;
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
            size: 0.03,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.65,
            depthWrite: false,
          })
        )
      );
    }

    scene.add(new THREE.AmbientLight(0xb4c4dc, 0.95));
    const key = new THREE.DirectionalLight(0xffffff, 1.45);
    key.position.set(4, 2.5, 3);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x9eb6ff, 0.75);
    fill.position.set(-3.5, 1.2, -2.5);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x6ea0ff, 0.7);
    rim.position.set(-3, -1, -2);
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

    /** Great-circle arc that stays above the surface (no stub clipping). */
    function buildArcPoints(fromLat, fromLng, toLat, toLng) {
      const start = latLngToVector3(fromLat, fromLng, 1).normalize();
      const end = latLngToVector3(toLat, toLng, 1).normalize();
      let angle = start.angleTo(end);
      if (angle < 0.02) return null;
      if (angle > Math.PI - 0.02) angle = Math.PI - 0.02;

      const points = [];
      const steps = Math.max(48, Math.floor(angle * 48));
      const sinAngle = Math.sin(angle);
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const p = new THREE.Vector3()
          .copy(start)
          .multiplyScalar(Math.sin((1 - t) * angle) / sinAngle)
          .add(end.clone().multiplyScalar(Math.sin(t * angle) / sinAngle));
        // Peak altitude mid-route so the line clears the globe
        const altitude = GLOBE_RADIUS * (1.035 + 0.22 * Math.sin(Math.PI * t) * (0.55 + angle / Math.PI));
        points.push(p.normalize().multiplyScalar(altitude));
      }
      return points;
    }

    const earthMat = new THREE.MeshStandardMaterial({
      color: 0xd7e4f5,
      roughness: 0.82,
      metalness: 0.04,
      emissive: 0x1a2a44,
      emissiveIntensity: 0.35,
    });
    globeGroup.add(new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS, 96, 96), earthMat));

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
        earthMat.color = new THREE.Color(0x2a4060);
      }
    );
    loader.load(
      LIGHTS_TEX,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        earthMat.emissiveMap = tex;
        earthMat.emissive = new THREE.Color(0xffffff);
        earthMat.emissiveIntensity = 0.5;
        earthMat.needsUpdate = true;
      },
      undefined,
      () => {}
    );
    loader.load(
      BUMP_TEX,
      (tex) => {
        earthMat.bumpMap = tex;
        earthMat.bumpScale = 0.045;
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

    const equator = new THREE.Mesh(
      new THREE.TorusGeometry(GLOBE_RADIUS + 0.004, 0.002, 8, 128),
      new THREE.MeshBasicMaterial({ color: 0x8aa0c0, transparent: true, opacity: 0.14 })
    );
    equator.rotation.x = Math.PI / 2;
    globeGroup.add(equator);

    const markers = [];
    const labelEls = [];
    const arcs = [];
    const hitScale = mobileLike ? 5.5 : 4.2;

    languages.forEach((lang) => {
      const primary = lang.places.find((p) => p.primary) || lang.places[0];

      lang.places.forEach((place) => {
        const group = new THREE.Group();
        const pos = latLngToVector3(place.lat, place.lng, GLOBE_RADIUS + 0.014);
        group.position.copy(pos);
        group.lookAt(pos.clone().multiplyScalar(2));
        group.userData = {
          code: lang.code,
          placeId: place.id,
          placeName: place.name,
          country: place.country || "",
          primary: Boolean(place.primary),
          active: false,
          selected: false,
        };

        const size = place.primary ? MARKER_RADIUS * 1.2 : MARKER_RADIUS;
        const core = new THREE.Mesh(
          new THREE.SphereGeometry(size, 16, 16),
          new THREE.MeshStandardMaterial({
            color: 0xffc14a,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.95,
            metalness: 0.2,
            roughness: 0.3,
          })
        );
        group.add(core);
        group.userData.core = core;

        const shell = new THREE.Mesh(
          new THREE.SphereGeometry(size * 1.45, 14, 14),
          new THREE.MeshBasicMaterial({
            color: 0xffe08a,
            transparent: true,
            opacity: 0.35,
            depthWrite: false,
          })
        );
        group.add(shell);
        group.userData.shell = shell;

        const ring = new THREE.Mesh(
          new THREE.RingGeometry(size * 1.7, size * 2.4, 48),
          new THREE.MeshBasicMaterial({
            color: 0xfbbf24,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide,
            depthWrite: false,
          })
        );
        ring.visible = false;
        group.add(ring);
        group.userData.ring = ring;

        const hit = new THREE.Mesh(
          new THREE.SphereGeometry(size * hitScale, 8, 8),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        hit.userData.code = lang.code;
        hit.userData.placeId = place.id;
        group.add(hit);
        group.userData.hit = hit;

        globeGroup.add(group);
        markers.push(group);

        if (labelsLayer) {
          const el = document.createElement("div");
          el.className = "lang-globe__label";
          el.setAttribute("data-lang", lang.code);
          el.setAttribute("data-place-id", place.id);
          el.innerHTML =
            escapeHtml(place.name) +
            "<span>" +
            escapeHtml(lang.name) +
            (place.country ? " · " + escapeHtml(place.country) : "") +
            "</span>";
          labelsLayer.appendChild(el);
          labelEls.push({ el: el, marker: group });
        }
      });

      // Full arcs from hub to every other city (proper spherical paths)
      lang.places.forEach((place) => {
        if (place.id === primary.id) return;
        const pts = buildArcPoints(primary.lat, primary.lng, place.lat, place.lng);
        if (!pts) return;
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({
            color: 0xfbbf24,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
          })
        );
        line.visible = false;
        line.userData = { code: lang.code, toPlaceId: place.id };
        globeGroup.add(line);
        arcs.push(line);
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
        marker.userData.active = onLang;
        marker.userData.selected = onPlace;
        marker.scale.setScalar(onPlace ? 1.55 : onLang ? 1.12 : 0.62);
        if (marker.userData.core) {
          marker.userData.core.material.emissiveIntensity = onPlace ? 1.7 : onLang ? 1.1 : 0.35;
          marker.userData.core.material.color.set(onPlace ? 0xffe08a : onLang ? 0xffc14a : 0xb8893a);
          marker.userData.core.material.transparent = !onLang;
          marker.userData.core.material.opacity = onLang ? 1 : 0.55;
        }
        if (marker.userData.shell) {
          marker.userData.shell.material.opacity = onPlace ? 0.6 : onLang ? 0.28 : 0.08;
        }
        if (marker.userData.ring) {
          marker.userData.ring.visible = onPlace;
        }
      });
      labelEls.forEach(({ el }) => {
        el.classList.toggle("is-visible", el.getAttribute("data-place-id") === placeId);
      });
      arcs.forEach((arc) => {
        const show = arc.userData.code === code;
        arc.visible = show;
        arc.material.opacity = show ? 0.5 : 0;
      });
    }

    function focusPlace(code, placeId, animate) {
      const lang = getLang(code);
      if (!lang) return;
      const place = getPlace(lang, placeId);
      syncMarkers(code, place.id);

      const target = latLngToVector3(place.lat, place.lng, GLOBE_RADIUS);
      const camDist = Math.max(camera.position.length(), mobileLike ? 3.7 : 3.55);
      const desired = target.clone().normalize().multiplyScalar(camDist);
      desired.y += 0.25;
      desired.setLength(Math.max(desired.length(), camDist));

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
        duration: 1000,
      };
    }

    focusHandler = (code, placeId, animate) => {
      focusPlace(code, placeId, animate);
    };

    function projectLabels() {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const camDir = camera.position.clone().normalize();
      labelEls.forEach(({ el, marker }) => {
        if (!el.classList.contains("is-visible")) {
          el.style.visibility = "hidden";
          return;
        }
        const world = new THREE.Vector3();
        marker.getWorldPosition(world);
        const facing = world.clone().normalize().dot(camDir) > 0.05;
        const ndc = world.clone().project(camera);
        const onScreen =
          facing && ndc.z < 1 && Math.abs(ndc.x) <= 1.15 && Math.abs(ndc.y) <= 1.15;
        if (!onScreen) {
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
        if (!marker.userData.selected || !marker.userData.ring) return;
        const ringScale = 1 + (Math.sin(elapsed * 2.4) * 0.5 + 0.5) * 0.35;
        marker.userData.ring.scale.set(ringScale, ringScale, 1);
        marker.userData.ring.material.opacity = 0.65 - ringScale * 0.1;
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
      const hit = intersects[0].object.userData;
      selectPlace(hit.code, hit.placeId, true);
    });

    window.addEventListener("resize", scheduleResize);
    window.addEventListener("orientationchange", scheduleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", scheduleResize);
    }
    window.addEventListener("pagehide", () => {
      disposed = true;
      window.cancelAnimationFrame(animFrame);
      window.clearTimeout(resizeTimer);
      renderer.dispose();
    });

    const hint = root.querySelector(".lang-globe__hint");
    if (hint) hint.textContent = "Click a city · Drag to orbit";

    selectPlace(activeCode, activePlaceId, false);
    animate();
  }

  bindChrome();
  syncUi(activeCode, activePlaceId);

  if (!hasWebGL()) {
    mountFlatGlobe();
    return;
  }

  mountThreeGlobe().catch(() => {
    mountFlatGlobe();
  });
}
