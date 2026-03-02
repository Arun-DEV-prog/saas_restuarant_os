"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

// ── SpotlightTrail: follows mouse with a soft radial glow ──────────────────
function SpotlightTrail() {
  const ref = useRef(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;
    let lx = window.innerWidth / 2,
      ly = window.innerHeight / 2;
    let raf;
    const onMove = (e) => {
      lx = e.clientX;
      ly = e.clientY;
    };
    window.addEventListener("mousemove", onMove);
    const loop = () => {
      el.style.left = lx + "px";
      el.style.top = ly + "px";
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ref} className="rsl-spotlight" />;
}

// ─── RestaurantSaaS Landing Page ──────────────────────────────────────────────
// Stack: React, Three.js (CDN via script), GSAP (CDN via script)
// To use: Drop into a Next.js /app or /pages dir, add CDN scripts to layout.js
// Required in layout.js <head>:
//   <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
//   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
//   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
// Font in layout.js: import { Cormorant_Garamond, Syne } from "next/font/google"

export default function RestaurantSaaSLanding() {
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const navRef = useRef(null);
  const waiterRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0, nx: 0, ny: 0 }); // normalized -1 to 1

  // ─── Three.js 3D Waiter Scene ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !window.THREE) return;
    const THREE = window.THREE;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 2.5, 7);

    // Lighting
    const ambient = new THREE.AmbientLight(0xfff0d0, 0.6);
    scene.add(ambient);
    const spotlight = new THREE.SpotLight(0xff9f43, 3, 20, Math.PI / 5, 0.3);
    spotlight.position.set(2, 8, 4);
    spotlight.castShadow = true;
    scene.add(spotlight);
    const rimLight = new THREE.DirectionalLight(0xff6b35, 1.2);
    rimLight.position.set(-4, 3, -2);
    scene.add(rimLight);
    const fillLight = new THREE.PointLight(0xc0392b, 0.8, 15);
    fillLight.position.set(3, 1, 3);
    scene.add(fillLight);

    // ── Floor ──────────────────────────────────────────────────────────────
    const floorGeo = new THREE.CircleGeometry(3.5, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1a0a00,
      metalness: 0.4,
      roughness: 0.6,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // Helper: rounded box
    function roundedBox(w, h, d, r, segs) {
      const geo = new THREE.BoxGeometry(w, h, d, segs, segs, segs);
      const pos = geo.attributes.position;
      const v3 = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v3.fromBufferAttribute(pos, i);
        v3.x =
          Math.sign(v3.x) * Math.max(Math.abs(v3.x) - r, 0) +
          Math.sign(v3.x) * r * Math.tanh(Math.abs(v3.x) / r);
        pos.setXYZ(i, v3.x, v3.y, v3.z);
      }
      return geo;
    }

    const skinColor = 0xf5cba7;
    const suitColor = 0x1a0a00;
    const shirtColor = 0xfdf5e6;
    const goldColor = 0xd4a843;
    const plateColor = 0xffffff;
    const foodColor = 0xc0392b;

    const group = new THREE.Group();

    // ── Head ──────────────────────────────────────────────────────────────
    const headGeo = new THREE.SphereGeometry(0.28, 32, 32);
    const skinMat = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.7,
    });
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 3.6, 0);
    head.castShadow = true;
    group.add(head);

    // Hair
    const hairGeo = new THREE.SphereGeometry(
      0.285,
      32,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.45,
    );
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x1a0a00,
      roughness: 0.9,
    });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 3.6, 0);
    hair.rotation.x = -0.1;
    group.add(hair);

    // Eyes
    [-0.1, 0.1].forEach((x) => {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x111111 }),
      );
      eye.position.set(x, 3.62, 0.25);
      group.add(eye);
    });

    // Smile
    const smileGeo = new THREE.TorusGeometry(0.08, 0.015, 8, 20, Math.PI * 0.7);
    const smileMesh = new THREE.Mesh(
      smileGeo,
      new THREE.MeshStandardMaterial({ color: 0x8b3a3a }),
    );
    smileMesh.rotation.z = Math.PI;
    smileMesh.position.set(0, 3.46, 0.265);
    group.add(smileMesh);

    // ── Neck ──────────────────────────────────────────────────────────────
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 0.2, 16),
      skinMat,
    );
    neck.position.set(0, 3.22, 0);
    group.add(neck);

    // ── Torso / Suit Jacket ───────────────────────────────────────────────
    const torsoGeo = roundedBox(0.72, 1.1, 0.42, 0.06, 4);
    const suitMat = new THREE.MeshStandardMaterial({
      color: suitColor,
      roughness: 0.5,
      metalness: 0.15,
    });
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.position.set(0, 2.45, 0);
    torso.castShadow = true;
    group.add(torso);

    // Shirt front
    const shirt = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.7),
      new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.8 }),
    );
    shirt.position.set(0, 2.55, 0.215);
    group.add(shirt);

    // Bow tie
    [-0.07, 0.07].forEach((x) => {
      const wing = new THREE.Mesh(
        new THREE.ConeGeometry(0.055, 0.12, 3),
        new THREE.MeshStandardMaterial({
          color: goldColor,
          metalness: 0.6,
          roughness: 0.3,
        }),
      );
      wing.rotation.z = x > 0 ? -Math.PI / 2 : Math.PI / 2;
      wing.position.set(x, 3.07, 0.22);
      group.add(wing);
    });

    // Lapels
    [
      [-0.18, 0.08],
      [0.18, -0.08],
    ].forEach(([x, rz]) => {
      const lapel = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.35, 0.02),
        suitMat,
      );
      lapel.position.set(x, 2.8, 0.22);
      lapel.rotation.z = rz;
      group.add(lapel);
    });

    // Gold button
    const btn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12),
      new THREE.MeshStandardMaterial({
        color: goldColor,
        metalness: 0.8,
        roughness: 0.2,
      }),
    );
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0, 2.2, 0.22);
    group.add(btn);

    // ── Waist / Trousers ──────────────────────────────────────────────────
    const waistGeo = new THREE.CylinderGeometry(0.28, 0.26, 0.15, 16);
    const waist = new THREE.Mesh(waistGeo, suitMat);
    waist.position.set(0, 1.82, 0);
    group.add(waist);

    // Legs
    [
      [-0.15, 0],
      [0.15, 0],
    ].forEach(([x]) => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.09, 1.0, 16),
        suitMat,
      );
      leg.position.set(x, 1.22, 0);
      leg.castShadow = true;
      group.add(leg);

      // Shoe
      const shoe = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.1, 0.28),
        new THREE.MeshStandardMaterial({
          color: 0x0d0000,
          roughness: 0.3,
          metalness: 0.5,
        }),
      );
      shoe.position.set(x, 0.7, 0.05);
      group.add(shoe);
    });

    // ── Left arm (down by side) ────────────────────────────────────────────
    const leftArmGeo = new THREE.CylinderGeometry(0.085, 0.075, 0.85, 16);
    const leftArm = new THREE.Mesh(leftArmGeo, suitMat);
    leftArm.rotation.z = 0.15;
    leftArm.position.set(-0.45, 2.2, 0);
    group.add(leftArm);
    const leftHand = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16),
      skinMat,
    );
    leftHand.position.set(-0.51, 1.75, 0);
    group.add(leftHand);

    // ── Right arm (raised, serving) ────────────────────────────────────────
    const rightArmUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.08, 0.55, 16),
      suitMat,
    );
    rightArmUpper.rotation.z = -1.1;
    rightArmUpper.position.set(0.52, 2.6, 0);
    rightArmUpper.castShadow = true;
    group.add(rightArmUpper);

    const rightArmLower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.07, 0.55, 16),
      suitMat,
    );
    rightArmLower.rotation.z = -0.2;
    rightArmLower.rotation.x = -0.3;
    rightArmLower.position.set(0.85, 3.0, 0.1);
    group.add(rightArmLower);

    const rightHand = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16),
      skinMat,
    );
    rightHand.position.set(0.98, 3.22, 0.2);
    group.add(rightHand);

    // ── Serving plate ─────────────────────────────────────────────────────
    const plateGroup = new THREE.Group();
    plateGroup.position.set(0.98, 3.38, 0.22);

    const plateBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.28, 0.04, 32),
      new THREE.MeshStandardMaterial({
        color: plateColor,
        metalness: 0.3,
        roughness: 0.2,
      }),
    );
    plateGroup.add(plateBase);

    // Dome cloche
    const domeGeo = new THREE.SphereGeometry(
      0.28,
      32,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.55,
    );
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d4,
      metalness: 0.85,
      roughness: 0.1,
      transparent: true,
      opacity: 0.88,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0.04;
    plateGroup.add(dome);

    // Dome handle knob
    const knob = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 12, 12),
      new THREE.MeshStandardMaterial({
        color: goldColor,
        metalness: 0.9,
        roughness: 0.1,
      }),
    );
    knob.position.y = 0.32;
    plateGroup.add(knob);

    // Food visible on plate edge
    const foodColors = [0xc0392b, 0x27ae60, 0xf39c12, 0xe74c3c];
    for (let i = 0; i < 6; i++) {
      const food = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 8, 8),
        new THREE.MeshStandardMaterial({
          color: foodColors[i % 4],
          roughness: 0.7,
        }),
      );
      const angle = (i / 6) * Math.PI * 2;
      food.position.set(Math.cos(angle) * 0.18, 0.06, Math.sin(angle) * 0.18);
      plateGroup.add(food);
    }

    group.add(plateGroup);

    // Floating sparkles around plate
    const sparkleGeo = new THREE.BufferGeometry();
    const sparkleCount = 18;
    const sparklePos = new Float32Array(sparkleCount * 3);
    for (let i = 0; i < sparkleCount; i++) {
      sparklePos[i * 3] = (Math.random() - 0.5) * 1.2 + 0.98;
      sparklePos[i * 3 + 1] = Math.random() * 1.5 + 3.0;
      sparklePos[i * 3 + 2] = (Math.random() - 0.5) * 0.8 + 0.22;
    }
    sparkleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(sparklePos, 3),
    );
    const sparkleMat = new THREE.PointsMaterial({
      color: goldColor,
      size: 0.04,
      transparent: true,
      opacity: 0.8,
    });
    const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
    group.add(sparkles);

    scene.add(group);
    group.position.y = -0.5;

    // ── Floating particles (ambient ambiance) ──────────────────────────────
    const particleGeo = new THREE.BufferGeometry();
    const pCount = 120;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 10;
      pPos[i * 3 + 1] = Math.random() * 6;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xd4a843,
      size: 0.028,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Mouse tracking for 3D scene ────────────────────────────────────────
    const onMouseMove3D = (e) => {
      mouse.current.nx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.ny = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove3D);

    // ── Animation loop ─────────────────────────────────────────────────────
    let frame = 0;
    let animId;
    let smoothX = 0,
      smoothY = 0;
    function animate() {
      animId = requestAnimationFrame(animate);
      frame += 0.01;

      // Smooth mouse interpolation
      smoothX += (mouse.current.nx - smoothX) * 0.04;
      smoothY += (mouse.current.ny - smoothY) * 0.04;

      // Body follows mouse gently
      group.rotation.y = Math.sin(frame * 0.5) * 0.08 + smoothX * 0.22;
      group.rotation.x = smoothY * 0.06;
      group.position.y = Math.sin(frame * 0.8) * 0.04 - 0.5;

      // Head looks toward mouse
      head.rotation.y = smoothX * 0.35;
      head.rotation.x = smoothY * 0.2;
      hair.rotation.y = smoothX * 0.35;
      hair.rotation.x = smoothY * 0.2;

      // Camera subtle parallax
      camera.position.x = smoothX * 0.4;
      camera.position.y = 2.5 + smoothY * 0.3;
      camera.lookAt(0, 2.5, 0);

      // Plate gentle hover + mouse influence
      plateGroup.position.y =
        3.38 + Math.sin(frame * 1.2) * 0.04 + smoothY * 0.08;
      plateGroup.rotation.y = frame * 0.3;
      plateGroup.position.x = 0.98 + smoothX * 0.12;

      // Spotlight tracks mouse
      spotlight.position.x = 2 + smoothX * 3;
      spotlight.position.z = 4 + smoothY * 2;

      // Sparkles pulse
      sparkleMat.opacity = 0.5 + Math.sin(frame * 2) * 0.3;
      sparkles.rotation.y = frame * 0.5;

      // Particles drift + mouse
      particles.rotation.y = frame * 0.04 + smoothX * 0.1;
      particles.position.y = Math.sin(frame * 0.2) * 0.1;
      particles.position.x = smoothX * 0.3;

      renderer.render(scene, camera);
    }
    animate();

    // Resize
    const onResize = () => {
      if (!canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove3D);
      renderer.dispose();
    };
  }, []);

  // ─── GSAP Animations ───────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !window.gsap || !window.ScrollTrigger)
      return;
    const { gsap } = window;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    // Nav slide in
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.3 },
    );

    // Hero text stagger
    gsap.fromTo(
      ".hero-anim",
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.1,
        stagger: 0.15,
        ease: "power4.out",
        delay: 0.6,
      },
    );

    // Waiter scale-in
    gsap.fromTo(
      waiterRef.current,
      { scale: 0.7, opacity: 0, x: 80 },
      {
        scale: 1,
        opacity: 1,
        x: 0,
        duration: 1.4,
        ease: "back.out(1.4)",
        delay: 0.4,
      },
    );

    // Stats counter animation
    gsap.fromTo(
      ".stat-card",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: statsRef.current, start: "top 75%" },
      },
    );

    // Feature cards
    gsap.fromTo(
      ".feature-card",
      { y: 70, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: featuresRef.current, start: "top 75%" },
      },
    );

    // Section headings parallax
    gsap.utils.toArray(".section-heading").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 80%" },
        },
      );
    });

    // Magnetic button effect
    const magnetBtns = document.querySelectorAll(
      ".rsl-btn-primary, .rsl-btn-ghost, .rsl-nav-cta",
    );
    const magnetHandlers = [];
    magnetBtns.forEach((btn) => {
      const onEnter = (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.3;
        const dy = (e.clientY - cy) * 0.3;
        gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: "power2.out" });
      };
      const onLeave = () =>
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1.2, 0.5)",
        });
      btn.addEventListener("mousemove", onEnter);
      btn.addEventListener("mouseleave", onLeave);
      magnetHandlers.push({ btn, onEnter, onLeave });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      magnetHandlers.forEach(({ btn, onEnter, onLeave }) => {
        btn.removeEventListener("mousemove", onEnter);
        btn.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  // ─── Custom Cursor ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    if (!cursor || !dot) return;

    let cx = 0,
      cy = 0,
      dx = 0,
      dy = 0;
    let raf;

    const onMove = (e) => {
      dx = e.clientX;
      dy = e.clientY;
      // Dot snaps instantly
      dot.style.transform = `translate(${dx - 4}px, ${dy - 4}px)`;
      dot.style.opacity = "1";
    };

    const loop = () => {
      cx += (dx - cx) * 0.1;
      cy += (dy - cy) * 0.1;
      cursor.style.transform = `translate(${cx - 20}px, ${cy - 20}px)`;
      raf = requestAnimationFrame(loop);
    };

    const onEnterLink = () => {
      cursor.style.width = "56px";
      cursor.style.height = "56px";
      cursor.style.borderColor = "var(--gold)";
      cursor.style.background = "rgba(212,168,67,0.08)";
    };
    const onLeaveLink = () => {
      cursor.style.width = "40px";
      cursor.style.height = "40px";
      cursor.style.borderColor = "rgba(212,168,67,0.6)";
      cursor.style.background = "transparent";
    };
    const onMouseLeave = () => {
      cursor.style.opacity = "0";
      dot.style.opacity = "0";
    };
    const onMouseEnter = () => {
      cursor.style.opacity = "1";
      dot.style.opacity = "1";
    };

    document
      .querySelectorAll(
        "a, button, .feature-card, .stat-card, .testimonial-card",
      )
      .forEach((el) => {
        el.addEventListener("mouseenter", onEnterLink);
        el.addEventListener("mouseleave", onLeaveLink);
      });

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []);

  // ─── Hero Parallax Layers on Mouse Move ────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hero = heroRef.current;
    if (!hero) return;

    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;

      // Eyebrow + title layer — slow drift
      document.querySelectorAll(".parallax-slow").forEach((el) => {
        el.style.transform = `translate(${nx * -10}px, ${ny * -6}px)`;
      });
      // Sub text — medium
      document.querySelectorAll(".parallax-mid").forEach((el) => {
        el.style.transform = `translate(${nx * -18}px, ${ny * -10}px)`;
      });
      // Background glow — fast
      document.querySelectorAll(".parallax-bg").forEach((el) => {
        el.style.transform = `translate(${nx * 30}px, ${ny * 20}px)`;
      });
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const features = [
    {
      icon: "🍽️",
      title: "Smart Menu Builder",
      desc: "Drag-and-drop menu creation with real-time preview. Update items, prices, and photos instantly from any device.",
    },
    {
      icon: "📊",
      title: "Live Analytics",
      desc: "Track orders, revenue, peak hours, and customer trends. Make data-driven decisions with beautiful dashboards.",
    },
    {
      icon: "🛎️",
      title: "Table Management",
      desc: "Interactive floor plans, reservation sync, and QR-code ordering — all from one unified platform.",
    },
    {
      icon: "🚀",
      title: "Kitchen Display",
      desc: "Real-time order routing to kitchen stations. Reduce wait times, eliminate miscommunication, delight guests.",
    },
    {
      icon: "💳",
      title: "Integrated Payments",
      desc: "Accept all major cards, Apple Pay, and crypto. Auto-split bills, apply discounts, and close tabs in seconds.",
    },
    {
      icon: "🤖",
      title: "AI Recommendations",
      desc: "Personalized upsell suggestions for waitstaff. Boost average check size by up to 23% effortlessly.",
    },
  ];

  const stats = [
    { value: "12,000+", label: "Restaurants" },
    { value: "98.9%", label: "Uptime SLA" },
    { value: "$2.4B", label: "Processed" },
    { value: "4.2min", label: "Avg. Onboarding" },
  ];

  const testimonials = [
    {
      name: "Layla Hassan",
      role: "Owner, Saffron Dubai",
      text: "TableOS transformed our entire operation. Revenue up 34% in 90 days.",
      avatar: "L",
    },
    {
      name: "Marco Bianchi",
      role: "Chef, Rosso Milano",
      text: "The kitchen display system alone saved us 40 minutes of chaos every service.",
      avatar: "M",
    },
    {
      name: "Sara Park",
      role: "GM, Seoul Bites",
      text: "Our guests love the QR experience. Tips increased noticeably — genuinely incredible.",
      avatar: "S",
    },
  ];

  return (
    <>
      {/* ── Inline Styles & Global CSS ─────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Syne:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #050200;
          --bg2: #0d0500;
          --bg3: #120700;
          --gold: #d4a843;
          --gold2: #f0c96a;
          --red: #c0392b;
          --red2: #e74c3c;
          --cream: #fdf5e6;
          --cream2: #f5e6c8;
          --muted: rgba(253,245,230,0.45);
          --glass: rgba(255,255,255,0.04);
          --glass-border: rgba(212,168,67,0.18);
          --font-display: 'Cormorant Garamond', serif;
          --font-body: 'Syne', sans-serif;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--bg);
          color: var(--cream);
          font-family: var(--font-body);
          overflow-x: hidden;
        }

        .rsl-root { min-height: 100vh; background: var(--bg); }

        /* SCROLLBAR */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 2px; }

        /* ── NAV ─────────────────────────────────────────────────────────── */
        .rsl-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 5vw; height: 70px;
          background: rgba(5,2,0,0.82);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
        }
        .rsl-logo {
          font-family: var(--font-display);
          font-size: 1.7rem; font-weight: 700;
          color: var(--gold);
          letter-spacing: 0.02em;
        }
        .rsl-logo span { color: var(--red2); }
        .rsl-nav-links { display: flex; gap: 2.5rem; list-style: none; }
        .rsl-nav-links a {
          font-size: 0.78rem; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--muted);
          text-decoration: none; transition: color 0.25s;
        }
        .rsl-nav-links a:hover { color: var(--gold); }
        .rsl-nav-cta {
          background: var(--gold); color: #050200;
          padding: 0.5rem 1.4rem; border-radius: 2px;
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; text-decoration: none;
          transition: background 0.25s, transform 0.2s;
          border: none; cursor: pointer;
        }
        .rsl-nav-cta:hover { background: var(--gold2); transform: translateY(-1px); }

        /* ── HERO ─────────────────────────────────────────────────────────── */
        .rsl-hero {
          min-height: 100vh; display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          padding: 120px 5vw 80px;
          position: relative; overflow: hidden;
          gap: 2rem;
        }

        .rsl-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 60% at 70% 50%, rgba(192,57,43,0.12) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 80% at 0% 100%, rgba(212,168,67,0.06) 0%, transparent 60%);
          pointer-events: none;
        }

        .rsl-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--gold); font-weight: 600; margin-bottom: 1.5rem;
        }
        .rsl-hero-eyebrow::before {
          content: ''; width: 28px; height: 1px; background: var(--gold);
        }

        .rsl-hero-title {
          font-family: var(--font-display);
          font-size: clamp(3.2rem, 5.5vw, 5.8rem);
          line-height: 1.0; font-weight: 700;
          color: var(--cream); margin-bottom: 1.6rem;
        }
        .rsl-hero-title em {
          font-style: italic; color: var(--gold);
          display: block;
        }
        .rsl-hero-title .rsl-red { color: var(--red2); }

        .rsl-hero-sub {
          font-size: 1.0rem; line-height: 1.75;
          color: var(--muted); max-width: 480px;
          margin-bottom: 2.5rem; font-weight: 400;
        }

        .rsl-hero-actions { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }

        .rsl-btn-primary {
          background: linear-gradient(135deg, var(--gold), var(--gold2));
          color: #050200; padding: 0.85rem 2.2rem; border-radius: 2px;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; text-decoration: none; border: none;
          cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(212,168,67,0.3);
        }
        .rsl-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(212,168,67,0.45);
        }

        .rsl-btn-ghost {
          background: transparent; color: var(--cream);
          padding: 0.85rem 2rem; border-radius: 2px;
          font-size: 0.78rem; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; text-decoration: none;
          border: 1px solid rgba(253,245,230,0.2); cursor: pointer;
          transition: border-color 0.25s, color 0.25s;
        }
        .rsl-btn-ghost:hover { border-color: var(--gold); color: var(--gold); }

        .rsl-play-btn {
          display: flex; align-items: center; gap: 0.6rem;
          font-size: 0.78rem; color: var(--muted); text-decoration: none;
          transition: color 0.25s;
        }
        .rsl-play-btn:hover { color: var(--gold); }
        .rsl-play-icon {
          width: 40px; height: 40px; border-radius: 50%;
          border: 1px solid rgba(212,168,67,0.4);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; transition: background 0.25s, border-color 0.25s;
        }
        .rsl-play-btn:hover .rsl-play-icon {
          background: rgba(212,168,67,0.1); border-color: var(--gold);
        }

        /* ── WAITER / 3D CANVAS ───────────────────────────────────────────── */
        .rsl-waiter-wrap {
          position: relative; display: flex; align-items: center; justify-content: center;
        }
        .rsl-canvas-bg {
          position: absolute; inset: -20%; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(192,57,43,0.1) 0%, transparent 65%);
          filter: blur(30px);
        }
        .rsl-waiter-canvas {
          width: 100%; max-width: 520px; height: 600px;
          position: relative; z-index: 1;
        }
        .rsl-waiter-badge {
          position: absolute; bottom: 60px; right: 5%;
          background: var(--glass);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 12px; padding: 0.9rem 1.2rem;
          display: flex; align-items: center; gap: 0.8rem;
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .rsl-waiter-badge-icon { font-size: 1.4rem; }
        .rsl-waiter-badge-text { font-size: 0.72rem; font-weight: 600; color: var(--cream2); }
        .rsl-waiter-badge-sub { font-size: 0.64rem; color: var(--muted); }

        /* ── MARQUEE ──────────────────────────────────────────────────────── */
        .rsl-marquee-wrap {
          overflow: hidden; border-top: 1px solid var(--glass-border);
          border-bottom: 1px solid var(--glass-border);
          padding: 1rem 0; background: rgba(212,168,67,0.03);
        }
        .rsl-marquee {
          display: flex; gap: 4rem; animation: marquee 22s linear infinite;
          width: max-content;
        }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .rsl-marquee-item {
          display: flex; align-items: center; gap: 1rem; white-space: nowrap;
          font-size: 0.72rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--muted); font-weight: 600;
        }
        .rsl-marquee-dot { color: var(--gold); font-size: 1.2rem; line-height: 1; }

        /* ── STATS ────────────────────────────────────────────────────────── */
        .rsl-stats { padding: 100px 5vw; }
        .rsl-stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px;
          border: 1px solid var(--glass-border);
          border-radius: 4px; overflow: hidden;
        }
        .stat-card {
          background: var(--glass); padding: 3rem 2rem;
          border-right: 1px solid var(--glass-border);
          transition: background 0.3s;
          cursor: default;
        }
        .stat-card:last-child { border-right: none; }
        .stat-card:hover { background: rgba(212,168,67,0.06); }
        .stat-value {
          font-family: var(--font-display);
          font-size: clamp(2.4rem, 3.5vw, 3.6rem);
          font-weight: 700; color: var(--gold);
          line-height: 1; margin-bottom: 0.6rem;
        }
        .stat-label {
          font-size: 0.75rem; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--muted); font-weight: 500;
        }

        /* ── FEATURES ─────────────────────────────────────────────────────── */
        .rsl-features { padding: 100px 5vw; }
        .section-heading {
          font-family: var(--font-display);
          font-size: clamp(2.4rem, 4vw, 4rem);
          font-weight: 700; color: var(--cream);
          margin-bottom: 0.8rem; line-height: 1.1;
        }
        .section-sub {
          font-size: 0.95rem; color: var(--muted); max-width: 560px;
          margin-bottom: 3.5rem; line-height: 1.7;
        }
        .section-eyebrow {
          font-size: 0.7rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--gold);
          font-weight: 600; margin-bottom: 0.8rem;
          display: block;
        }
        .rsl-features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5px;
          background: var(--glass-border);
        }
        .feature-card {
          background: var(--bg2); padding: 2.5rem 2rem;
          position: relative; overflow: hidden;
          transition: background 0.3s, transform 0.3s;
          cursor: default;
        }
        .feature-card::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(212,168,67,0.05), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .feature-card:hover { background: var(--bg3); transform: translateY(-3px); }
        .feature-card:hover::after { opacity: 1; }
        .feature-card:hover .feature-icon { transform: scale(1.15) rotate(-5deg); }

        .feature-icon { font-size: 2rem; margin-bottom: 1rem; display: block; transition: transform 0.3s; }
        .feature-title {
          font-family: var(--font-display);
          font-size: 1.3rem; font-weight: 700;
          color: var(--cream); margin-bottom: 0.8rem;
        }
        .feature-desc { font-size: 0.82rem; color: var(--muted); line-height: 1.7; }
        .feature-arrow {
          display: inline-block; margin-top: 1.2rem;
          font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--gold); font-weight: 600;
          opacity: 0; transition: opacity 0.25s;
        }
        .feature-card:hover .feature-arrow { opacity: 1; }

        /* ── TESTIMONIALS ─────────────────────────────────────────────────── */
        .rsl-testimonials { padding: 100px 5vw; }
        .rsl-testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .testimonial-card {
          background: var(--glass);
          border: 1px solid var(--glass-border); border-radius: 8px;
          padding: 2.2rem; transition: border-color 0.3s, transform 0.3s;
          cursor: default;
        }
        .testimonial-card:hover {
          border-color: rgba(212,168,67,0.35); transform: translateY(-4px);
        }
        .testimonial-quote {
          font-family: var(--font-display);
          font-size: 1.15rem; font-style: italic;
          color: var(--cream2); line-height: 1.65; margin-bottom: 1.5rem;
        }
        .testimonial-avatar {
          width: 42px; height: 42px; border-radius: 50%;
          background: linear-gradient(135deg, var(--red), var(--gold));
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 1rem; color: #050200;
          margin-right: 1rem; flex-shrink: 0;
        }
        .testimonial-name { font-size: 0.85rem; font-weight: 600; color: var(--cream); }
        .testimonial-role { font-size: 0.72rem; color: var(--muted); margin-top: 0.2rem; }

        /* ── CTA ──────────────────────────────────────────────────────────── */
        .rsl-cta {
          padding: 120px 5vw; text-align: center;
          background: radial-gradient(ellipse 80% 60% at 50% 100%, rgba(192,57,43,0.12) 0%, transparent 70%);
          border-top: 1px solid var(--glass-border);
          position: relative; overflow: hidden;
        }
        .rsl-cta-title {
          font-family: var(--font-display);
          font-size: clamp(3rem, 6vw, 6.5rem);
          font-weight: 700; line-height: 1.0;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, var(--cream), var(--gold));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .rsl-cta-sub {
          font-size: 1rem; color: var(--muted); max-width: 520px;
          margin: 0 auto 2.5rem; line-height: 1.7;
        }
        .rsl-cta-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .rsl-cta-badge {
          margin-top: 2rem; font-size: 0.7rem; color: var(--muted);
          letter-spacing: 0.1em; text-transform: uppercase;
        }
        .rsl-cta-badge span { color: var(--gold); }

        /* ── FOOTER ───────────────────────────────────────────────────────── */
        .rsl-footer {
          padding: 3rem 5vw; display: flex; align-items: center;
          justify-content: space-between; border-top: 1px solid var(--glass-border);
          flex-wrap: wrap; gap: 1rem;
        }
        .rsl-footer-copy { font-size: 0.72rem; color: var(--muted); }
        .rsl-footer-links { display: flex; gap: 2rem; }
        .rsl-footer-links a {
          font-size: 0.72rem; color: var(--muted); text-decoration: none;
          transition: color 0.2s; letter-spacing: 0.05em;
        }
        .rsl-footer-links a:hover { color: var(--gold); }

        /* ── CUSTOM CURSOR ────────────────────────────────────────────────── */
        * { cursor: none !important; }

        .rsl-cursor {
          position: fixed; top: 0; left: 0; z-index: 9999;
          width: 40px; height: 40px; border-radius: 50%;
          border: 1.5px solid rgba(212,168,67,0.6);
          pointer-events: none;
          transition: width 0.25s, height 0.25s, border-color 0.25s, background 0.25s, opacity 0.3s;
          mix-blend-mode: difference;
          will-change: transform;
        }
        .rsl-cursor-dot {
          position: fixed; top: 0; left: 0; z-index: 10000;
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--gold);
          pointer-events: none;
          transition: opacity 0.3s;
          will-change: transform;
        }

        /* ── PARALLAX LAYERS ─────────────────────────────────────────────── */
        .parallax-slow, .parallax-mid, .parallax-bg {
          transition: transform 0.12s ease-out;
          will-change: transform;
        }

        /* ── MAGNETIC HOVER (CSS only helper) ────────────────────────────── */
        .rsl-btn-primary, .rsl-btn-ghost, .rsl-nav-cta {
          transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1),
                      box-shadow 0.2s, background 0.25s, border-color 0.25s, color 0.25s;
        }

        /* ── SPOTLIGHT TRAIL ─────────────────────────────────────────────── */
        .rsl-spotlight {
          position: fixed; pointer-events: none; z-index: 1;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(212,168,67,0.04) 0%, transparent 65%);
          transform: translate(-50%, -50%);
          transition: opacity 0.5s;
          will-change: left, top;
        }


        @media (max-width: 900px) {
          .rsl-hero { grid-template-columns: 1fr; padding-top: 100px; }
          .rsl-waiter-wrap { display: none; }
          .rsl-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .rsl-features-grid { grid-template-columns: 1fr 1fr; }
          .rsl-testimonials-grid { grid-template-columns: 1fr; }
          .rsl-nav-links { display: none; }
        }
        @media (max-width: 600px) {
          .rsl-features-grid { grid-template-columns: 1fr; }
          .rsl-stats-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="rsl-root">
        {/* ── CUSTOM CURSOR ─────────────────────────────────────────────────── */}
        <div className="rsl-cursor" ref={cursorRef} />
        <div className="rsl-cursor-dot" ref={cursorDotRef} />

        {/* ── MOUSE SPOTLIGHT ───────────────────────────────────────────────── */}
        <SpotlightTrail />
        {/* ── NAV ──────────────────────────────────────────────────────────── */}
        <nav className="rsl-nav" ref={navRef}>
          <div className="rsl-logo">
            Table<span>OS</span>
          </div>
          <ul className="rsl-nav-links">
            {["Product", "Features", "Pricing", "Blog"].map((l) => (
              <li key={l}>
                <a href="#">{l}</a>
              </li>
            ))}
          </ul>
          <Link href="/register" className="rsl-nav-cta">
            Start Free Trial
          </Link>
        </nav>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="rsl-hero" ref={heroRef}>
          <div>
            <div className="rsl-hero-eyebrow hero-anim parallax-slow">
              Restaurant Operating System
            </div>
            <h1 className="rsl-hero-title hero-anim parallax-slow">
              Run Your <em>Restaurant</em> Like a{" "}
              <span className="rsl-red">Star.</span>
            </h1>
            <p className="rsl-hero-sub hero-anim parallax-mid">
              TableOS is the all-in-one SaaS platform for modern restaurants —
              from tableside ordering to kitchen intelligence, seamlessly
              unified.
            </p>
            <div className="rsl-hero-actions hero-anim parallax-mid">
              <Link href="/register" className="rsl-btn-primary">
                Get Started Free
              </Link>
              <a href="#" className="rsl-play-btn">
                <span className="rsl-play-icon">▶</span> Watch Demo
              </a>
            </div>
          </div>

          <div className="rsl-waiter-wrap" ref={waiterRef}>
            <div className="rsl-canvas-bg" />
            <canvas ref={canvasRef} className="rsl-waiter-canvas" />
            <div className="rsl-waiter-badge">
              <span className="rsl-waiter-badge-icon">⭐</span>
              <div>
                <div className="rsl-waiter-badge-text">Order Placed</div>
                <div className="rsl-waiter-badge-sub">Table 7 · 2 min ago</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MARQUEE ──────────────────────────────────────────────────────── */}
        <div className="rsl-marquee-wrap">
          <div className="rsl-marquee">
            {[...Array(2)].map((_, ri) =>
              [
                "Smart POS",
                "Menu Management",
                "Kitchen Display",
                "Table Reservations",
                "Loyalty Programs",
                "Real-Time Analytics",
                "QR Ordering",
                "Multi-Location",
              ].map((t, i) => (
                <span className="rsl-marquee-item" key={`${ri}-${i}`}>
                  <span className="rsl-marquee-dot">✦</span> {t}
                </span>
              )),
            )}
          </div>
        </div>

        {/* ── STATS ────────────────────────────────────────────────────────── */}
        <section className="rsl-stats" ref={statsRef}>
          <div className="rsl-stats-grid">
            {stats.map((s) => (
              <div className="stat-card" key={s.label}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────────── */}
        <section className="rsl-features" ref={featuresRef}>
          <span className="section-eyebrow section-heading">
            Platform Features
          </span>
          <h2 className="section-heading">
            Everything your team needs,
            <br />
            <em
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontStyle: "italic",
                color: "var(--gold)",
              }}
            >
              nothing they don't.
            </em>
          </h2>
          <p className="section-sub">
            Built for the pace of professional kitchens and the expectations of
            modern guests.
          </p>
          <div className="rsl-features-grid">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <span className="feature-icon">{f.icon}</span>
                <div className="feature-title">{f.title}</div>
                <p className="feature-desc">{f.desc}</p>
                <span className="feature-arrow">Learn more →</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <section className="rsl-testimonials">
          <span className="section-eyebrow section-heading">
            Trusted by Teams Worldwide
          </span>
          <h2 className="section-heading" style={{ marginBottom: "3rem" }}>
            What restaurateurs say
          </h2>
          <div className="rsl-testimonials-grid">
            {testimonials.map((t) => (
              <div className="testimonial-card" key={t.name}>
                <p className="testimonial-quote">"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className="testimonial-avatar">{t.avatar}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="rsl-cta">
          <h2 className="rsl-cta-title section-heading">
            Ready to elevate your restaurant?
          </h2>
          <p className="rsl-cta-sub">
            Join over 12,000 restaurants already running smarter with TableOS.
            Setup takes minutes, results come fast.
          </p>
          <div className="rsl-cta-actions">
            <a href="#" className="rsl-btn-primary">
              Start Your Free Trial
            </a>
            <a href="#" className="rsl-btn-ghost">
              Book a Demo
            </a>
          </div>
          <p className="rsl-cta-badge">
            No credit card required · <span>14-day free trial</span> · Cancel
            anytime
          </p>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="rsl-footer">
          <div className="rsl-logo">
            Table<span style={{ color: "var(--red2)" }}>OS</span>
          </div>
          <div className="rsl-footer-copy">
            © 2025 TableOS Inc. All rights reserved.
          </div>
          <div className="rsl-footer-links">
            {["Privacy", "Terms", "Support", "Status"].map((l) => (
              <a href="#" key={l}>
                {l}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
