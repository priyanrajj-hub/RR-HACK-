"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Batter, Bowler } from "@/types";

interface CricketGround3DProps {
  players: (Batter | Bowler)[];
  isBowler: boolean;
  onSelectPlayer: (player: Batter | Bowler) => void;
  selectedPlayerId?: number;
}

export default function CricketGround3D({
  players,
  isBowler,
  onSelectPlayer,
  selectedPlayerId,
}: CricketGround3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPlayer, setHoveredPlayer] = useState<(Batter | Bowler) | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [webglError, setWebglError] = useState(false);

  const top10 = players.slice(0, 10);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 560;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch (err) {
      console.warn("WebGL initialization failed, falling back to 2D view:", err);
      setWebglError(true);
      return;
    }

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#050A19");
    scene.fog = new THREE.FogExp2("#050A19", 0.022);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 13, 18);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minPolarAngle = Math.PI / 8;
    controls.minDistance = 7;
    controls.maxDistance = 26;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(10, 20, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const blueFill = new THREE.DirectionalLight(0x2563eb, 0.8);
    blueFill.position.set(-12, 10, -12);
    scene.add(blueFill);

    const pinkFill = new THREE.DirectionalLight(0xea1a85, 0.8);
    pinkFill.position.set(12, 10, -12);
    scene.add(pinkFill);

    // 4. Realistic Cricket Ground & Stadium
    const groundGroup = new THREE.Group();

    // Outfield with concentric grass rings (mow pattern)
    for (let r = 12; r >= 2; r -= 1.5) {
      const ringMat = new THREE.MeshStandardMaterial({
        color: (r / 1.5) % 2 === 0 ? 0x091b10 : 0x0d2417,
        roughness: 0.85,
        metalness: 0.1,
      });
      const ringGeo = new THREE.CircleGeometry(r, 64);
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.001 * (12 - r);
      ringMesh.receiveShadow = true;
      groundGroup.add(ringMesh);
    }

    // Outer Stadium Hologram Boundary Ring (glowing neon)
    const boundaryRingMat = new THREE.MeshBasicMaterial({
      color: isBowler ? 0x3b82f6 : 0xea1a85,
      side: THREE.DoubleSide,
    });
    const boundaryRing = new THREE.Mesh(new THREE.RingGeometry(11.85, 12.05, 64), boundaryRingMat);
    boundaryRing.rotation.x = -Math.PI / 2;
    boundaryRing.position.y = 0.02;
    groundGroup.add(boundaryRing);

    // Outer Stadium Halo (Gold)
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xf5a623, side: THREE.DoubleSide });
    const haloRing = new THREE.Mesh(new THREE.RingGeometry(12.2, 12.3, 64), haloMat);
    haloRing.rotation.x = -Math.PI / 2;
    haloRing.position.y = 0.02;
    groundGroup.add(haloRing);

    // 30-Yard Inner Circle Line
    const innerCircleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const innerCircle = new THREE.Mesh(new THREE.RingGeometry(4.7, 4.78, 48), innerCircleMat);
    innerCircle.rotation.x = -Math.PI / 2;
    innerCircle.position.y = 0.025;
    groundGroup.add(innerCircle);

    // Pitch Rectangle
    const pitchGeo = new THREE.PlaneGeometry(2.4, 6.2);
    const pitchMat = new THREE.MeshStandardMaterial({
      color: 0xa67c52,
      roughness: 0.9,
      metalness: 0.1,
    });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.y = 0.03;
    pitch.receiveShadow = true;
    groundGroup.add(pitch);

    // Crease Lines & Wickets at both ends
    const creaseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-2.3, 2.3].forEach((pz) => {
      // Popping crease
      const popCrease = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.08), creaseMat);
      popCrease.rotation.x = -Math.PI / 2;
      popCrease.position.set(0, 0.035, pz);
      groundGroup.add(popCrease);

      // Bowling crease
      const bowlCrease = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.04), creaseMat);
      bowlCrease.rotation.x = -Math.PI / 2;
      bowlCrease.position.set(0, 0.035, pz > 0 ? pz + 0.35 : pz - 0.35);
      groundGroup.add(bowlCrease);

      // Return creases
      [-1.0, 1.0].forEach((rx) => {
        const retCrease = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.7), creaseMat);
        retCrease.rotation.x = -Math.PI / 2;
        retCrease.position.set(rx, 0.035, pz > 0 ? pz + 0.15 : pz - 0.15);
        groundGroup.add(retCrease);
      });

      // 3 Wickets & Bail
      [-0.08, 0, 0.08].forEach((wx) => {
        const stump = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8),
          new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.5 })
        );
        stump.position.set(wx, 0.35, pz > 0 ? pz + 0.35 : pz - 0.35);
        groundGroup.add(stump);
      });

      const bail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.22, 6),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      bail.rotation.z = Math.PI / 2;
      bail.position.set(0, 0.71, pz > 0 ? pz + 0.35 : pz - 0.35);
      groundGroup.add(bail);
    });

    // 4 Grandstand Floodlight Towers
    [
      [-11.5, 0, -11.5],
      [11.5, 0, -11.5],
      [-11.5, 0, 11.5],
      [11.5, 0, 11.5],
    ].forEach(([fx, fy, fz]) => {
      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.25, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85 })
      );
      mast.position.set(fx, 5, fz);
      groundGroup.add(mast);

      const lightHead = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.7, 0.35),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xffffff,
          emissiveIntensity: 1.2,
        })
      );
      lightHead.position.set(fx, 10.2, fz);
      groundGroup.add(lightHead);
    });

    scene.add(groundGroup);

    // 5. Atmospheric Floating Particle Field
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const angle = Math.random() * Math.PI * 2;
      const rad = 2 + Math.random() * 11;
      particlePositions[i] = Math.cos(angle) * rad;
      particlePositions[i + 1] = 0.5 + Math.random() * 7;
      particlePositions[i + 2] = Math.sin(angle) * rad;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      color: isBowler ? 0x3b82f6 : 0xea1a85,
      transparent: true,
      opacity: 0.75,
    });
    const particlesMesh = new THREE.Points(particleGeo, particleMat);
    scene.add(particlesMesh);

    // Helper: Canvas Texture for Hologram Label
    function makeLabelSprite(rank: number, name: string, score: number, colorHex: string) {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 70;
      const ctx = c.getContext("2d");
      if (!ctx) return null;

      // Dark glass container
      ctx.fillStyle = "rgba(7, 11, 25, 0.92)";
      ctx.beginPath();
      ctx.roundRect(6, 6, 244, 58, 14);
      ctx.fill();

      // Border glow
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(6, 6, 244, 58, 14);
      ctx.stroke();

      // Text 1: Rank & Name
      ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.fillText(`#${rank}  ${name}`, 128, 32);

      // Text 2: Pressure Score
      ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif";
      ctx.fillStyle = colorHex;
      ctx.fillText(`Score: ${score.toFixed(1)}`, 128, 52);

      const texture = new THREE.CanvasTexture(c);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.9, 0.55, 1);
      return sprite;
    }

    // 6. Interactive Player Pillars + Holographic 3D Avatars
    const textureLoader = new THREE.TextureLoader();
    const raycastTargets: THREE.Object3D[] = [];
    const animatedHolograms: {
      sprite: THREE.Sprite;
      label?: THREE.Sprite;
      baseY: number;
      idx: number;
    }[] = [];
    const pillarGroup = new THREE.Group();

    top10.forEach((p, idx) => {
      const total = top10.length;
      const angle = ((idx - (total - 1) / 2) / (total - 1)) * (Math.PI * 0.85) - Math.PI / 2;
      const radius = 9.0;
      const px = Math.cos(angle) * radius;
      const pz = Math.sin(angle) * radius;

      const pHeight = Math.max(1.2, ((p.reliability_score - 60) / 30) * 3.5 + 1.2);
      const isSelected = selectedPlayerId === p.player_id;

      const baseHex = isBowler ? 0x2563eb : 0xea1a85;
      const glowHex = isBowler ? 0x60a5fa : 0xff4b9e;
      const activeHex = 0xf5a623;
      const hexString = isSelected ? "#F5A623" : isBowler ? "#3B82F6" : "#EA1A85";

      // A. Solid Glowing Pillar Cylinder
      const pillarMat = new THREE.MeshStandardMaterial({
        color: isSelected ? activeHex : baseHex,
        emissive: isSelected ? activeHex : baseHex,
        emissiveIntensity: isSelected ? 0.85 : 0.35,
        roughness: 0.25,
        metalness: 0.75,
      });

      const cylGeo = new THREE.CylinderGeometry(0.35, 0.45, pHeight, 16);
      const pillarMesh = new THREE.Mesh(cylGeo, pillarMat);
      pillarMesh.position.set(px, pHeight / 2, pz);
      pillarMesh.castShadow = true;
      pillarMesh.receiveShadow = true;
      (pillarMesh as any).userData = { player: p, pHeight };
      pillarGroup.add(pillarMesh);
      raycastTargets.push(pillarMesh);

      // B. Hologram Projector Beam (Translucent cone shining up from top of pillar)
      const beamGeo = new THREE.CylinderGeometry(0.55, 0.25, 0.8, 16, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: isSelected ? activeHex : glowHex,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(px, pHeight + 0.4, pz);
      pillarGroup.add(beam);

      // C. Holographic Avatar Sprite (Real Player Photo hovering above the beam)
      const playerImg = p.image_url || "/players/tim_david.png";
      const playerTexture = textureLoader.load(playerImg);
      playerTexture.colorSpace = THREE.SRGBColorSpace;

      const avatarSpriteMat = new THREE.SpriteMaterial({
        map: playerTexture,
        transparent: true,
        blending: THREE.NormalBlending,
      });
      const avatarSprite = new THREE.Sprite(avatarSpriteMat);
      avatarSprite.scale.set(1.5, 1.5, 1);
      const avatarBaseY = pHeight + 1.25;
      avatarSprite.position.set(px, avatarBaseY, pz);
      (avatarSprite as any).userData = { player: p, pHeight };
      pillarGroup.add(avatarSprite);
      raycastTargets.push(avatarSprite);

      // D. Floating Holographic Label Tag (Name & Score)
      const labelSprite = makeLabelSprite(p.rank, p.player_name, p.reliability_score, hexString);
      if (labelSprite) {
        labelSprite.position.set(px, avatarBaseY + 1.05, pz);
        pillarGroup.add(labelSprite);
      }

      animatedHolograms.push({
        sprite: avatarSprite,
        label: labelSprite || undefined,
        baseY: avatarBaseY,
        idx,
      });

      // E. Base Holographic Pedestal Ring
      const ringMat = new THREE.MeshBasicMaterial({
        color: isSelected ? activeHex : glowHex,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.68, 24), ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(px, 0.05, pz);
      pillarGroup.add(ringMesh);
    });

    scene.add(pillarGroup);

    // 7. Raycasting for Mouse Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastTargets);

      if (intersects.length > 0) {
        const topHit = intersects[0].object as any;
        const player = topHit.userData?.player;
        if (player) {
          setHoveredPlayer(player);
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          canvas.style.cursor = "pointer";
          return;
        }
      }
      setHoveredPlayer(null);
      setTooltipPos(null);
      canvas.style.cursor = "default";
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastTargets);

      if (intersects.length > 0) {
        const topHit = intersects[0].object as any;
        const player = topHit.userData?.player;
        if (player) {
          onSelectPlayer(player);
        }
      }
    };

    canvas.addEventListener("mousemove", onPointerMove);
    canvas.addEventListener("click", onClick);

    // 8. Resize Handler
    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || 800;
      height = container.clientHeight || 560;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    // 9. Holographic Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Slowly rotate particle field
      particlesMesh.rotation.y += delta * 0.04;

      // Animate floating hologram avatars with sinusoidal bobbing
      animatedHolograms.forEach(({ sprite, label, baseY, idx }) => {
        const bob = Math.sin(elapsed * 2.2 + idx * 0.6) * 0.08;
        sprite.position.y = baseY + bob;
        if (label) {
          label.position.y = baseY + 1.05 + bob;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", onPointerMove);
      canvas.removeEventListener("click", onClick);
      renderer.dispose();
      controls.dispose();
    };
  }, [players, isBowler, selectedPlayerId, onSelectPlayer]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[540px] md:h-[620px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#050B1B] via-rr-navy to-[#030712] border border-rr-border shadow-2xl"
    >
      {webglError ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="max-w-md p-6 rounded-2xl bg-slate-900/90 border border-rr-border space-y-3">
            <h3 className="text-sm font-black uppercase text-white tracking-wider">
              Tactical Overview • Top 10 {isBowler ? "Bowlers" : "Batters"}
            </h3>
            <p className="text-xs text-slate-400">
              Hardware WebGL is not available on this display. Select any player below to inspect their tactical scouting profile.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {top10.map((p) => (
                <button
                  key={p.player_id}
                  onClick={() => onSelectPlayer(p)}
                  className="px-3 py-2 rounded-lg bg-rr-navy hover:bg-rr-pink/20 border border-rr-border text-left transition-all group flex items-center gap-2"
                >
                  <img
                    src={p.image_url || "/players/tim_david.png"}
                    alt={p.player_name}
                    className="w-7 h-7 rounded-full object-cover border border-rr-border shrink-0"
                  />
                  <div className="truncate">
                    <div className="text-[10px] text-rr-gold font-bold">#{p.rank} {p.player_name}</div>
                    <div className="text-xs font-black text-white group-hover:text-rr-pink">
                      Score: {p.reliability_score.toFixed(1)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <canvas ref={canvasRef} className="w-full h-full block" />
      )}

      {/* Floating Ground Overlay Badge */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2 bg-rr-navy/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-rr-border shadow-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isBowler ? "bg-rr-blue-light" : "bg-rr-pink"
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isBowler ? "bg-rr-blue" : "bg-rr-pink"
              }`}
            ></span>
          </span>
          <span className="text-xs font-black tracking-wider text-slate-100">
            3D HOLOGRAPHIC STADIUM • TOP 10 {isBowler ? "BOWLERS" : "BATTERS"}
          </span>
        </div>
      </div>

      {/* Interactive Tooltip Following Mouse */}
      {hoveredPlayer && tooltipPos && (
        <div
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="bg-rr-dark/95 backdrop-blur-md border border-rr-pink px-4 py-2.5 rounded-xl shadow-2xl text-center min-w-[170px] transform scale-100 flex items-center gap-3">
            <img
              src={hoveredPlayer.image_url || "/players/tim_david.png"}
              alt={hoveredPlayer.player_name}
              className={`w-10 h-10 rounded-full object-cover border-2 shrink-0 ${
                isBowler ? "border-blue-500" : "border-rr-pink"
              }`}
            />
            <div className="text-left">
              <div className="text-[10px] font-black uppercase text-rr-gold">
                Rank #{hoveredPlayer.rank} • {isBowler ? "Bowler" : "Batter"}
              </div>
              <div className="text-xs font-bold text-white truncate">{hoveredPlayer.player_name}</div>
              <div className="text-sm font-black text-rr-pink mt-0.5">
                Score: {hoveredPlayer.reliability_score.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Instruction Hint */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none text-[11px] text-slate-300 bg-rr-dark/85 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-slate-800 shadow-md">
        🖱️ Drag to orbit • Scroll to zoom • Click hologram or pillar for scouting card
      </div>
    </div>
  );
}
