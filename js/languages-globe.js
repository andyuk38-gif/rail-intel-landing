/**
 * Languages coverage globe — interactive Three.js earth with language markers.
 * Plots every place where each supported interface language is used.
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
        lat: places.find((p) => p.primary)?.lat ?? places[0]?.lat ?? lat,
        lng: places.find((p) => p.primary)?.lng ?? places[0]?.lng ?? lng,
        places,
        button: btn,
      };
    })
    .filter((lang) => lang.code && lang.places.length);

  if (!stage || !canvasWrap || !languages.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeCode = languages[0].code;
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
    const places = lang.places.map((p) => p.name).join(" · ");
    statusEl.innerHTML =
      "<strong>" +
      escapeHtml(lang.name) +
      "</strong> · " +
      escapeHtml(lang.nativeName) +
      "<br /><span class=\"lang-globe__status-places\">" +
      escapeHtml(places) +
      "</span>";
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
      const on = el.getAttribute("data-flat-marker") === code;
      el.classList.toggle("is-active", on);
      el.classList.toggle("is-dim", !on);
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

  function bindChrome() {
    listButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.getAttribute("data-lang-globe-select");
        selectLanguage(code, true);
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

  /** Equirectangular mapped onto the visible disc (full world). */
  function projectFlat(lat, lng) {
    const x = 0.5 + lng / 360;
    const y = 0.5 - lat / 180;
    return {
      x: Math.min(0.94, Math.max(0.06, x)),
      y: Math.min(0.94, Math.max(0.06, y)),
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
        marker.setAttribute(
          "aria-label",
          lang.name + " — " + place.name + (place.country ? ", " + place.country : "")
        );
        marker.title = place.name + (place.country ? ", " + place.country : "");
        marker.style.left = pos.x * 100 + "%";
        marker.style.top = pos.y * 100 + "%";
        marker.innerHTML =
          `<span class="lang-globe__flat-pulse"></span><span class="lang-globe__flat-core"></span>` +
          (place.primary
            ? `<span class="lang-globe__flat-tag">${escapeHtml(place.name)}</span>`
            : "");
        marker.addEventListener("click", () => {
          selectLanguage(lang.code, true);
        });
        markersHost.appendChild(marker);
      });
    });

    focusHandler = (code) => {
      const sphere = disc.querySelector(".lang-globe__flat-sphere");
      const lang = languages.find((l) => l.code === code);
      if (!sphere || !lang) return;
      const primary = lang.places.find((p) => p.primary) || lang.places[0];
      const offsetX = primary.lng * -0.12;
      const offsetY = primary.lat * 0.08;
      sphere.style.transform =
        "rotateX(" + (6 + offsetY * 0.12) + "deg) rotateY(" + offsetX + "deg)";

      markersHost.querySelectorAll(".lang-globe__flat-tag").forEach((tag) => {
        const parent = tag.closest("[data-flat-marker]");
        tag.hidden = !(parent && parent.getAttribute("data-flat-marker") === code);
      });
    };

    const hint = root.querySelector(".lang-globe__hint");
    if (hint) {
      hint.textContent = "Select a language to highlight where it is used";
    }

    selectLanguage(activeCode, false);
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
    const MARKER_RADIUS = 0.024;
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
    const accent = new THREE.PointLight(0xf59e0b, 0.7, 14);
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
      color: 0xd7e4f5,
      roughness: 0.82,
      metalness: 0.04,
      emissive: 0x1a2a44,
      emissiveIntensity: 0.35,
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
        earthMat.color = new THREE.Color(0x2a4060);
      }
    );
    loader.load(
      LIGHTS_TEX,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        earthMat.emissiveMap = tex;
        earthMat.emissive = new THREE.Color(0xffffff);
        earthMat.emissiveIntensity = 0.55;
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
    const hitScale = mobileLike ? 5.8 : 4.2;

    languages.forEach((lang) => {
      const primary = lang.places.find((p) => p.primary) || lang.places[0];

      lang.places.forEach((place) => {
        const group = new THREE.Group();
        const pos = latLngToVector3(place.lat, place.lng, GLOBE_RADIUS + 0.012);
        group.position.copy(pos);
        group.lookAt(pos.clone().multiplyScalar(2));
        group.userData = {
          code: lang.code,
          placeName: place.name,
          country: place.country || "",
          primary: Boolean(place.primary),
          active: false,
        };

        const size = place.primary ? MARKER_RADIUS * 1.35 : MARKER_RADIUS * 0.78;
        const core = new THREE.Mesh(
          new THREE.SphereGeometry(size, 16, 16),
          new THREE.MeshStandardMaterial({
            color: 0xffc14a,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.9,
            metalness: 0.2,
            roughness: 0.3,
          })
        );
        group.add(core);
        group.userData.core = core;

        const shell = new THREE.Mesh(
          new THREE.SphereGeometry(size * 1.4, 14, 14),
          new THREE.MeshBasicMaterial({
            color: 0xffe08a,
            transparent: true,
            opacity: place.primary ? 0.45 : 0.28,
            depthWrite: false,
          })
        );
        group.add(shell);
        group.userData.shell = shell;

        // Soft halo only on primary hubs — avoids Europe turning into one orange blob
        if (place.primary) {
          const halo = new THREE.Mesh(
            new THREE.SphereGeometry(size * 2.2, 16, 16),
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
            new THREE.RingGeometry(size * 1.8, size * 2.5, 48),
            new THREE.MeshBasicMaterial({
              color: 0xfbbf24,
              transparent: true,
              opacity: 0.65,
              side: THREE.DoubleSide,
              depthWrite: false,
            })
          );
          ring.visible = false;
          group.add(ring);
          group.userData.ring = ring;
        }

        const hit = new THREE.Mesh(
          new THREE.SphereGeometry(size * hitScale, 8, 8),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        hit.userData.code = lang.code;
        group.add(hit);
        group.userData.hit = hit;

        globeGroup.add(group);
        markers.push(group);

        // One label per language (primary city only) — stops stacked tooltips
        if (labelsLayer && place.primary) {
          const el = document.createElement("div");
          el.className = "lang-globe__label lang-globe__label--primary";
          el.setAttribute("data-lang", lang.code);
          el.innerHTML =
            escapeHtml(lang.name) +
            "<span>" +
            escapeHtml(place.name) +
            (place.country ? ", " + escapeHtml(place.country) : "") +
            "</span>";
          labelsLayer.appendChild(el);
          labelEls.push({ el: el, marker: group });
        }
      });

      // Arcs only to distant regions — skip short hops that clutter Europe
      lang.places.forEach((place) => {
        if (place === primary) return;
        const start = latLngToVector3(primary.lat, primary.lng, GLOBE_RADIUS + 0.02);
        const end = latLngToVector3(place.lat, place.lng, GLOBE_RADIUS + 0.02);
        if (start.distanceTo(end) < GLOBE_RADIUS * 0.55) return;
        const mid = start.clone().add(end).multiplyScalar(0.5);
        mid.normalize().multiplyScalar(GLOBE_RADIUS * (1.14 + start.distanceTo(end) * 0.05));
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(curve.getPoints(36)),
          new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.12 })
        );
        line.userData = { code: lang.code };
        globeGroup.add(line);
        arcs.push(line);
      });
    });

    let focusTween = null;
    let pointerDown = false;
    let disposed = false;
    let animFrame = 0;
    const clock = new THREE.Clock();

    function syncMarkers(code) {
      markers.forEach((marker) => {
        const on = marker.userData.code === code;
        marker.userData.active = on;
        marker.scale.setScalar(
          on ? (marker.userData.primary ? 1.4 : 1.05) : marker.userData.primary ? 0.85 : 0.65
        );
        marker.visible = true;
        if (marker.userData.core) {
          marker.userData.core.material.emissiveIntensity = on
            ? marker.userData.primary
              ? 1.5
              : 1.05
            : 0.45;
          marker.userData.core.material.color.set(on ? 0xffd36a : 0xd4a24a);
          marker.userData.core.material.transparent = !on;
          marker.userData.core.material.opacity = on ? 1 : 0.7;
        }
        if (marker.userData.shell) {
          marker.userData.shell.material.opacity = on
            ? marker.userData.primary
              ? 0.55
              : 0.3
            : 0.12;
        }
        if (marker.userData.halo) {
          marker.userData.halo.material.opacity = on ? 0.28 : 0.08;
        }
        if (marker.userData.ring) {
          marker.userData.ring.visible = on && marker.userData.primary;
        }
      });
      labelEls.forEach(({ el }) => {
        el.classList.toggle("is-visible", el.getAttribute("data-lang") === code);
      });
      arcs.forEach((arc) => {
        arc.material.opacity = arc.userData.code === code ? 0.4 : 0.04;
      });
    }

    function focusLanguage(code, animate) {
      const lang = languages.find((item) => item.code === code);
      if (!lang) return;
      syncMarkers(code);

      const primary = lang.places.find((p) => p.primary) || lang.places[0];
      const target = latLngToVector3(primary.lat, primary.lng, GLOBE_RADIUS);
      const camDist = Math.max(camera.position.length(), mobileLike ? 3.7 : 3.55);
      const desired = target.clone().normalize().multiplyScalar(camDist);
      desired.y += 0.28;
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
        duration: 1200,
      };
    }

    focusHandler = (code, animate) => {
      focusLanguage(code, animate);
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
        const facing = world.clone().normalize().dot(camDir) > 0.08;
        const ndc = world.clone().project(camera);
        const onScreen =
          facing && ndc.z < 1 && Math.abs(ndc.x) <= 1.2 && Math.abs(ndc.y) <= 1.2;
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

      controls.autoRotate = false;

      markers.forEach((marker) => {
        if (!marker.userData.active || !marker.userData.primary) return;
        const pulse = 1 + Math.sin(elapsed * 2.2) * 0.08;
        if (marker.userData.halo) {
          marker.userData.halo.scale.setScalar(pulse * 1.2);
        }
        if (marker.userData.ring && marker.userData.ring.visible) {
          const ringScale = 1 + (Math.sin(elapsed * 2.6) * 0.5 + 0.5) * 0.4;
          marker.userData.ring.scale.set(ringScale, ringScale, 1);
          marker.userData.ring.material.opacity = 0.6 - ringScale * 0.12;
        }
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
      const code = intersects[0].object.userData.code;
      selectLanguage(code, true);
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
    if (hint) {
      hint.textContent = mobileLike
        ? "Select a language · Drag to orbit"
        : "Select a language · Drag to orbit";
    }

    selectLanguage(activeCode, false);
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
