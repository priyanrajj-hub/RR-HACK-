"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Float } from "@react-three/drei";
import * as THREE from "three";
import { Batter, Bowler } from "@/types";

interface CricketGround3DProps {
  players: (Batter | Bowler)[];
  isBowler: boolean;
  onSelectPlayer: (player: Batter | Bowler) => void;
  selectedPlayerId?: number;
}

// Single Player Pillar Component
function PlayerPillar({
  player,
  index,
  total,
  isBowler,
  isSelected,
  onSelect,
}: {
  player: Batter | Bowler;
  index: number;
  total: number;
  isBowler: boolean;
  isSelected: boolean;
  onSelect: (p: Batter | Bowler) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  // Position pillars in an amphitheater arc facing center pitch
  const angle = ((index - (total - 1) / 2) / (total - 1)) * (Math.PI * 0.85) - Math.PI / 2;
  const radius = 9.0;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  // Height proportional to reliability score (60 - 90 -> 1.5m - 4.5m)
  const height = Math.max(1.2, ((player.reliability_score - 60) / 30) * 3.5 + 1.2);
  const y = height / 2;

  // Colors
  const baseColor = isBowler ? "#254AA5" : "#EA1A85";
  const glowColor = isBowler ? "#3B82F6" : "#FF4B9E";
  const activeColor = "#F5A623";

  useFrame((state, delta) => {
    if (meshRef.current && (hovered || isSelected)) {
      meshRef.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* 3D Pillar Cylinder */}
      <mesh
        ref={meshRef}
        position={[0, y, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(player);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.35, 0.45, height, 16]} />
        <meshStandardMaterial
          color={isSelected ? activeColor : hovered ? glowColor : baseColor}
          emissive={isSelected ? activeColor : hovered ? glowColor : baseColor}
          emissiveIntensity={isSelected ? 0.8 : hovered ? 0.6 : 0.25}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* Glowing Orb on top of pillar */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2}>
        <mesh position={[0, height + 0.35, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color={isSelected ? "#FFF" : glowColor}
            emissive={isSelected ? activeColor : glowColor}
            emissiveIntensity={0.9}
            roughness={0.1}
          />
        </mesh>
      </Float>

      {/* Rank Marker Ring at base */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.65, 24]} />
        <meshBasicMaterial color={hovered || isSelected ? activeColor : glowColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Tooltip on Hover / Selected */}
      {(hovered || isSelected) && (
        <Html position={[0, height + 1.1, 0]} center distanceFactor={14}>
          <div className="bg-rr-dark/95 backdrop-blur-md border border-rr-pink px-3 py-2 rounded-lg shadow-2xl text-center pointer-events-none min-w-[140px] transform transition-all scale-105">
            <div className="text-[10px] font-bold tracking-wider uppercase text-rr-gold">
              Rank #{player.rank} • {isBowler ? "Bowler" : "Batter"}
            </div>
            <div className="text-xs font-bold text-white truncate">{player.player_name}</div>
            <div className="text-sm font-extrabold text-rr-pink mt-0.5">
              Score: {player.reliability_score.toFixed(1)}
            </div>
            <div className="text-[10px] text-slate-300">
              {isBowler
                ? `Econ ${(player as Bowler).hp_econ.toFixed(2)} | ${(player as Bowler).hp_wickets} Wkts`
                : `SR ${(player as Batter).hp_sr.toFixed(1)} | Avg ${(player as Batter).hp_avg.toFixed(1)}`}
            </div>
            <div className="text-[9px] text-rr-cyan mt-1">Click for Full Scouting Card</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Low-poly Cricket Ground Stadium Scene
function StadiumGround() {
  return (
    <group>
      {/* Outfield Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[14, 48]} />
        <meshStandardMaterial color="#0A182E" roughness={0.9} />
      </mesh>

      {/* 30-Yard Circle Marker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[6.8, 6.9, 48]} />
        <meshBasicMaterial color="#1E3A8A" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Boundary Rope Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[13.7, 13.9, 64]} />
        <meshStandardMaterial color="#EA1A85" roughness={0.4} />
      </mesh>

      {/* Center Cricket Pitch Rectangle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[2.4, 6.5]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.8} />
      </mesh>

      {/* Popping Crease lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 2.4]}>
        <planeGeometry args={[2.2, 0.08]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, -2.4]}>
        <planeGeometry args={[2.2, 0.08]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Wickets / Stumps (North & South) */}
      <mesh position={[0, 0.35, 2.7]}>
        <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
        <meshStandardMaterial color="#D7CCC8" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.35, -2.7]}>
        <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
        <meshStandardMaterial color="#D7CCC8" roughness={0.5} />
      </mesh>

      {/* 4 Floodlight Towers */}
      {[
        [-11, 0, -11],
        [11, 0, -11],
        [-11, 0, 11],
        [11, 0, 11],
      ].map(([fx, fy, fz], idx) => (
        <group key={idx} position={[fx, fy, fz]}>
          {/* Mast */}
          <mesh position={[0, 5, 0]}>
            <cylinderGeometry args={[0.15, 0.25, 10, 8]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Light Head */}
          <mesh position={[0, 10.1, 0]}>
            <boxGeometry args={[1.4, 0.8, 0.4]} />
            <meshStandardMaterial color="#F8FAFC" emissive="#FFFFFF" emissiveIntensity={1.2} />
          </mesh>
          <spotLight
            position={[0, 10, 0]}
            target-position={[0, 0, 0]}
            color="#E0F2FE"
            intensity={80}
            distance={28}
            angle={0.6}
            penumbra={0.7}
            castShadow
          />
        </group>
      ))}
    </group>
  );
}

// Floating atmospheric particle dust
function AtmosphericParticles({ isBowler }: { isBowler: boolean }) {
  const count = 120;
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const radius = 2 + Math.random() * 12;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0.5 + Math.random() * 6;
      temp.push({ x, y, z, size: 0.05 + Math.random() * 0.08 });
    }
    return temp;
  }, []);

  return (
    <group>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? (isBowler ? "#3B82F6" : "#EA1A85") : "#F5A623"}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function CricketGround3D({
  players,
  isBowler,
  onSelectPlayer,
  selectedPlayerId,
}: CricketGround3DProps) {
  const top10 = useMemo(() => players.slice(0, 10), [players]);

  return (
    <div className="relative w-full h-[540px] md:h-[620px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#050B1B] via-rr-navy to-[#030712] border border-rr-border shadow-2xl">
      {/* 3D Scene Canvas */}
      <Canvas
        camera={{ position: [0, 11, 15], fov: 45 }}
        shadows
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#060B1C"]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[8, 16, 10]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[0, 4, 0]} intensity={0.8} color={isBowler ? "#254AA5" : "#EA1A85"} distance={15} />

        <StadiumGround />
        <AtmosphericParticles isBowler={isBowler} />

        {/* 10 Ranked 3D Pillars */}
        {top10.map((p, idx) => (
          <PlayerPillar
            key={p.player_id}
            player={p}
            index={idx}
            total={top10.length}
            isBowler={isBowler}
            isSelected={selectedPlayerId === p.player_id}
            onSelect={onSelectPlayer}
          />
        ))}

        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2.15}
          minPolarAngle={Math.PI / 8}
          minDistance={8}
          maxDistance={24}
          dampingFactor={0.06}
          autoRotate={false}
        />
      </Canvas>

      {/* Floating Ground Overlay Badge */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2 bg-rr-navy/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-rr-border">
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
          <span className="text-xs font-bold tracking-wide text-slate-200">
            3D PRESSURE STADIUM • TOP 10 {isBowler ? "BOWLERS" : "BATTERS"}
          </span>
        </div>
      </div>

      {/* Control instruction hint */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none text-[11px] text-slate-400 bg-rr-dark/80 px-3 py-1 rounded-md border border-slate-800">
        🖱️ Drag to orbit • Scroll to zoom • Click pillar to inspect player
      </div>
    </div>
  );
}
