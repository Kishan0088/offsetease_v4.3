/* ==========================================================================
   OffsetEase — Interactive 3D Earth (progressive enhancement)
   Requires THREE (loaded before this file). Falls back to the photo if
   THREE is missing, WebGL is unavailable, or the user prefers reduced motion.
   ========================================================================== */
(function () {
  "use strict";
  var el = document.getElementById("earth3d");
  if (!el || typeof THREE === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // WebGL support check
  try {
    var test = document.createElement("canvas");
    if (!(test.getContext("webgl") || test.getContext("experimental-webgl"))) return;
  } catch (e) { return; }

  var TX = "https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/";
  var size = el.clientWidth || 460;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 3.15);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(size, size);
  el.appendChild(renderer.domElement);

  var loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");

  var group = new THREE.Group();
  scene.add(group);

  // Earth
  var earthGeo = new THREE.SphereGeometry(1, 64, 64);
  var earthMat = new THREE.MeshPhongMaterial({
    map: loader.load(TX + "earth_atmos_2048.jpg", onReady),
    specularMap: loader.load(TX + "earth_specular_2048.jpg"),
    bumpMap: loader.load(TX + "earth_normal_2048.jpg"),
    bumpScale: 0.04,
    specular: new THREE.Color(0x2a6b70),
    shininess: 12
  });
  var earth = new THREE.Mesh(earthGeo, earthMat);
  group.add(earth);

  // Clouds
  var cloudMat = new THREE.MeshPhongMaterial({
    map: loader.load(TX + "earth_clouds_1024.png"),
    transparent: true, opacity: 0.5, depthWrite: false
  });
  var clouds = new THREE.Mesh(new THREE.SphereGeometry(1.012, 48, 48), cloudMat);
  group.add(clouds);

  // Atmosphere (fresnel rim, teal-tinted to match brand)
  var atm = new THREE.Mesh(new THREE.SphereGeometry(1.16, 48, 48), new THREE.ShaderMaterial({
    vertexShader: "varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "varying vec3 vN; void main(){ float i = pow(0.62 - dot(vN, vec3(0.0,0.0,1.0)), 2.4); gl_FragColor = vec4(0.18,0.78,0.68,1.0) * i; }",
    blending: THREE.AdditiveBlending, side: THREE.BackSide, transparent: true
  }));
  scene.add(atm);

  // Region markers (lat, lon)
  var regions = [[21,78],[50,10],[5,110],[24,45],[56,-106],[-25,133]];
  var markerMat = new THREE.MeshBasicMaterial({ color: 0x3fe0c8 });
  var markers = [];
  regions.forEach(function (r) {
    var phi = (90 - r[0]) * Math.PI / 180, theta = (r[1] + 180) * Math.PI / 180, rad = 1.015;
    var m = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), markerMat);
    m.position.set(-rad * Math.sin(phi) * Math.cos(theta), rad * Math.cos(phi), rad * Math.sin(phi) * Math.sin(theta));
    group.add(m); markers.push(m);
  });

  // Stars
  var starGeo = new THREE.BufferGeometry();
  var sv = [];
  for (var i = 0; i < 550; i++) {
    var rr = 18 + Math.random() * 22, u = Math.random(), v = Math.random();
    var th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
    sv.push(rr * Math.sin(ph) * Math.cos(th), rr * Math.sin(ph) * Math.sin(th), rr * Math.cos(ph));
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(sv, 3));
  var stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xbfe9e3, size: 0.09, sizeAttenuation: true, transparent: true, opacity: 0.8 }));
  scene.add(stars);

  // Lights
  scene.add(new THREE.AmbientLight(0x88aab0, 0.55));
  var sun = new THREE.DirectionalLight(0xffffff, 1.15);
  sun.position.set(-2, 1, 2.4);
  scene.add(sun);

  // Initial tilt so India/EU face viewer
  group.rotation.x = 0.35;
  group.rotation.y = -1.1;

  // Interaction: drag + inertia + auto-rotate
  var dragging = false, px = 0, py = 0, vx = 0, vy = 0, auto = 0.0016;
  function down(x, y) { dragging = true; px = x; py = y; el.classList.add("dragging"); }
  function move(x, y) { if (!dragging) return; vy = (x - px) * 0.005; vx = (y - py) * 0.005; group.rotation.y += vy; group.rotation.x += vx; px = x; py = y; }
  function up() { dragging = false; }
  el.addEventListener("mousedown", function (e) { down(e.clientX, e.clientY); });
  window.addEventListener("mousemove", function (e) { move(e.clientX, e.clientY); });
  window.addEventListener("mouseup", up);
  el.addEventListener("touchstart", function (e) { down(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  el.addEventListener("touchmove", function (e) { move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  el.addEventListener("touchend", up);

  function onReady() { el.classList.add("is-live"); }

  // Pause when offscreen
  var visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.05 }).observe(el);
  }

  var t = 0;
  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;
    if (!dragging) {
      group.rotation.y += auto + vy;
      group.rotation.x += vx;
      vx *= 0.94; vy *= 0.94;
      group.rotation.x = Math.max(-0.7, Math.min(0.7, group.rotation.x));
    }
    clouds.rotation.y += 0.0006;
    t += 0.03;
    var pulse = 1 + Math.sin(t) * 0.18;
    for (var i = 0; i < markers.length; i++) markers[i].scale.setScalar(pulse);
    renderer.render(scene, camera);
  }
  tick();

  function resize() {
    var s = el.clientWidth || size;
    renderer.setSize(s, s);
    camera.aspect = 1; camera.updateProjectionMatrix();
  }
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 160); });
})();
