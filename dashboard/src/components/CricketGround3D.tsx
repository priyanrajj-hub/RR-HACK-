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

  const top10 = players.slice(0, 10);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 560;

    // 1. Scene & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#060B1C");
    scene.fog = new THREE.FogExp2("#060B1C", 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 12, 17);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
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
    controls.minDistance = 8;
    controls.maxDistance = 24;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 18, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const centerPoint = new THREE.PointLight(
      isBowler ? 0x254aa5 : 0xea1a85,
      1.2,
      18
    );
    centerPoint.position.set(0, 4, 0);
    scene.add(centerPoint);

    // 4. Ground & Cricket Pitch
    const groundGroup = new THREE.Group();

    // Outfield Grass
    const grassGeo = new THREE.CircleGeometry(14, 48);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x0a182e,
      roughness: 0.9,
    });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;
    groundGroup.add(grass);

    // 30-yard Ring
    const innerRingGeo = new THREE.RingGeometry(6.8, 6.95, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x1e3a8a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.02;
    groundGroup.add(innerRing);

    // Boundary Rope
    const ropeGeo = new THREE.RingGeometry(13.6, 13.85, 64);
    const ropeMat = new THREE.MeshStandardMaterial({
      color: 0xea1a85,
      roughness: 0.3,
    });
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    rope.rotation.x = -Math.PI / 2;
    rope.position.y = 0.04;
    groundGroup.add(rope);

    // Pitch
    const pitchGeo = new THREE.PlaneGeometry(2.4, 6.5);
    const pitchMat = new THREE.MeshStandardMaterial({
      color: 0x8d6e63,
      roughness: 0.8,
    });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.y = 0.03;
    groundGroup.add(pitch);

    // Crease Lines
    const creaseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-2.4, 2.4].forEach((pz) => {
      const crease = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.08), creaseMat);
      crease.rotation.x = -Math.PI / 2;
      crease.position.set(0, 0.035, pz);
      groundGroup.add(crease);

      // Stumps
      const stump = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8),
        new THREE.MeshStandardMaterial({ color: 0xd7ccc8 })
      );
      stump.position.set(0, 0.35, pz > 0 ? pz + 0.3 : pz - 0.3);
      groundGroup.add(stump);
    });

    // 4 Floodlight Towers
    [
      [-11, 0, -11],
      [11, 0, -11],
      [-11, 0, 11],
      [11, 0, 11],
    ].forEach(([fx, fy, fz]) => {
      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.22, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
      );
      mast.position.set(fx, 5, fz);
      groundGroup.add(mast);

      const lightHead = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.6, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.0 })
      );
      lightHead.position.set(fx, 10.1, fz);
      groundGroup.add(lightHead);
    });

    scene.add(groundGroup);

    // 5. Atmospheric Floating Particles
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const angle = Math.random() * Math.PI * 2;
      const rad = 2 + Math.random() * 11;
      particlePositions[i] = Math.cos(angle) * rad;
      particlePositions[i + 1] = 0.5 + Math.random() * 6;
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

    // 6. Interactive Player Pillars
    const pillarMeshes: { mesh: THREE.Mesh; player: Batter | Bowler }[] = [];
    const pillarGroup = new THREE.Group();

    top10.forEach((p, idx) => {
      const total = top10.length;
      const angle = ((idx - (total - 1) / 2) / (total - 1)) * (Math.PI * 0.85) - Math.PI / 2;
      const radius = 9.0;
      const px = Math.cos(angle) * radius;
      const pz = Math.sin(angle) * radius;

      const pHeight = Math.max(1.2, ((p.reliability_score - 60) / 30) * 3.5 + 1.2);
      const isSelected = selectedPlayerId === p.player_id;

      const baseHex = isBowler ? 0x254aa5 : 0xea1a85;
      const glowHex = isBowler ? 0x3b82f6 : 0xff4b9e;
      const activeHex = 0xf5a623;

      const pillarMat = new THREE.MeshStandardMaterial({
        color: isSelected ? activeHex : baseHex,
        emissive: isSelected ? activeHex : baseHex,
        emissiveIntensity: isSelected ? 0.8 : 0.25,
        roughness: 0.2,
        metalness: 0.7,
      });

      const cylGeo = new THREE.CylinderGeometry(0.35, 0.45, pHeight, 16);
      const pillarMesh = new THREE.Mesh(cylGeo, pillarMat);
      pillarMesh.position.set(px, pHeight / 2, pz);
      pillarMesh.castShadow = true;
      pillarMesh.receiveShadow = true;
      (pillarMesh as any).userData = { player: p, pHeight };
      pillarGroup.add(pillarMesh);
      pillarMeshes.push({ mesh: pillarMesh, player: p });

      // Floating Orb on top
      const orbMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0xffffff : glowHex,
        emissive: isSelected ? activeHex : glowHex,
        emissiveIntensity: 0.9,
      });
      const orbMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), orbMat);
      orbMesh.position.set(px, pHeight + 0.35, pz);
      pillarGroup.add(orbMesh);

      // Base Ring
      const ringMat = new THREE.MeshBasicMaterial({
        color: isSelected ? activeHex : glowHex,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.65, 24), ringMat);
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
      const intersects = raycaster.intersectObjects(pillarMeshes.map((m) => m.mesh));

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const player = (hit as any).userData?.player;
        if (player) {
          setHoveredPlayer(player);
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          canvas.style.cursor = "pointer";
          return;
        }
      }
      setHoveredPlayer(null);
      setTooltipPos(null);
      canvas.style.cursor = "grab";
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pillarMeshes.map((m) => m.mesh));

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const player = (hit as any).userData?.player;
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

    // 9. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Slowly rotate particles
      particlesMesh.rotation.y += delta * 0.05;

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
      <canvas ref={canvasRef} className="w-full h-full block" />

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
            3D STADIUM • TOP 10 {isBowler ? "BOWLERS" : "BATTERS"}
          </span>
        </div>
      </div>

      {/* Interactive Tooltip Following Mouse */}
      {hoveredPlayer && tooltipPos && (
        <div
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="bg-rr-dark/95 backdrop-blur-md border border-rr-pink px-3.5 py-2 rounded-xl shadow-2xl text-center min-w-[150px] transform scale-100">
            <div className="text-[10px] font-black uppercase text-rr-gold">
              Rank #{hoveredPlayer.rank} • {isBowler ? "Bowler" : "Batter"}
            </div>
            <div className="text-xs font-bold text-white truncate">{hoveredPlayer.player_name}</div>
            <div className="text-sm font-black text-rr-pink mt-0.5">
              Score: {hoveredPlayer.reliability_score.toFixed(1)}
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">
              {isBowler
                ? `Econ ${(hoveredPlayer as Bowler).hp_econ?.toFixed(2) || "7.2"} | ${(hoveredPlayer as Bowler).hp_wickets || 15} Wkts`
                : `SR ${(hoveredPlayer as Batter).hp_sr?.toFixed(1) || "160"} | Avg ${(hoveredPlayer as Batter).hp_avg?.toFixed(1) || "35"}`}
            </div>
            <div className="text-[9px] text-rr-cyan mt-1 font-semibold">Click to Open Scouting Card</div>
          </div>
        </div>
      )}

      {/* Control Instruction Hint */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none text-[11px] text-slate-300 bg-rr-dark/85 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-slate-800 shadow-md">
        🖱️ Drag to orbit • Scroll to zoom • Click pillar for scouting card
      </div>
    </div>
  );
}
