"use client";

import { Environment, Float, MeshTransmissionMaterial, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type HeroSceneProps = {
  scrollProgress: number;
};

type SceneContentProps = {
  scrollProgress: number;
  isHovered: boolean;
  isMobile: boolean;
  prefersReducedMotion: boolean;
};

type CardProps = {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  opacity?: number;
  radius?: number;
  emissive?: string;
  emissiveIntensity?: number;
};

function UiCard({
  position,
  size,
  color,
  opacity = 0.75,
  radius = 0.05,
  emissive,
  emissiveIntensity,
}: CardProps) {
  return (
    <RoundedBox args={size} radius={radius} smoothness={6} position={position}>
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={opacity}
        roughness={0.56}
        metalness={0.08}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </RoundedBox>
  );
}

function SceneContent({ scrollProgress, isHovered, isMobile, prefersReducedMotion }: SceneContentProps) {
  const rigRef = useRef<THREE.Group>(null);
  const frameRef = useRef<THREE.Group>(null);
  const layersRef = useRef<THREE.Group>(null);
  const dockRef = useRef<THREE.Group>(null);
  const cameraPhase = useRef(0);
  const pointer = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointer.current.set(
        event.clientX / window.innerWidth - 0.5,
        event.clientY / window.innerHeight - 0.5
      );
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useFrame((state, delta) => {
    const rig = rigRef.current;
    const frame = frameRef.current;
    const layers = layersRef.current;
    const dock = dockRef.current;

    if (!rig || !frame || !layers || !dock) {
      return;
    }

    const hoverBlend = isHovered ? 1 : 0;
    const motionScale = prefersReducedMotion ? 0.15 : 1;

    const baseX = THREE.MathUtils.lerp(0.0698, isMobile ? 0.03 : 0.045, hoverBlend);
    const baseY = THREE.MathUtils.lerp(isMobile ? -0.04 : -0.1745, isMobile ? -0.02 : -0.105, hoverBlend);
    const baseZ = THREE.MathUtils.lerp(-0.0174, -0.0065, hoverBlend);
    const pointerInfluence = THREE.MathUtils.lerp(0.0436, 0.018, hoverBlend) * motionScale;

    frame.rotation.x = THREE.MathUtils.lerp(
      frame.rotation.x,
      baseX + pointer.current.y * pointerInfluence,
      delta * 2.2
    );
    frame.rotation.y = THREE.MathUtils.lerp(
      frame.rotation.y,
      baseY + pointer.current.x * pointerInfluence,
      delta * 2.4
    );
    frame.rotation.z = THREE.MathUtils.lerp(frame.rotation.z, baseZ, delta * 2.2);

    layers.position.x = THREE.MathUtils.lerp(layers.position.x, pointer.current.x * 0.085 * motionScale, delta * 1.4);
    layers.position.y = THREE.MathUtils.lerp(layers.position.y, pointer.current.y * 0.06 * motionScale, delta * 1.4);

    const bob = prefersReducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.75) * 0.02;
    rig.position.y = THREE.MathUtils.lerp(rig.position.y, scrollProgress * -0.14 + bob, delta * 1.2);
    rig.position.x = THREE.MathUtils.lerp(rig.position.x, 0.34 + pointer.current.x * 0.08 * motionScale, delta * 1.25);
    rig.scale.setScalar(THREE.MathUtils.lerp(rig.scale.x, isHovered ? 1.02 : 1, delta * 1.6));

    dock.position.x = THREE.MathUtils.lerp(dock.position.x, -3.42 + pointer.current.x * 0.03 * motionScale, delta * 1.2);
    dock.position.y = THREE.MathUtils.lerp(dock.position.y, pointer.current.y * 0.05 * motionScale, delta * 1.1);

    cameraPhase.current = Math.min(1, cameraPhase.current + delta * 0.7);
    const introZ = THREE.MathUtils.lerp(4.35, 3.55, cameraPhase.current);
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      pointer.current.x * 0.45 * motionScale,
      delta * 1.15
    );
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, introZ, delta * 1.2);

    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      0.05 + scrollProgress * -0.22,
      delta * 1.2
    );

    state.camera.lookAt(0.1, -0.05, 0);
  });

  return (
    <>
      <color attach="background" args={["#070b1e"]} />
      <fog attach="fog" args={["#0a1030", 2.4, 18]} />
      <ambientLight intensity={0.25} />
      <hemisphereLight intensity={0.25} color="#95aaff" groundColor="#0c1238" />
      <rectAreaLight position={[-2.8, 2.5, 2]} intensity={1.1} width={5} height={3.4} color="#58d8f3" />
      <rectAreaLight position={[3.2, 0.7, 2]} intensity={0.65} width={3.8} height={3} color="#9f63f2" />
      <pointLight position={[1.8, -1.3, -1.2]} intensity={16} color="#38d8f4" />
      <pointLight position={[0.2, -1.2, -0.4]} intensity={7} color="#b170f7" />
      <Environment preset="city" />

      <mesh position={[0, 0, -2.8]}>
        <planeGeometry args={[18, 10]} />
        <meshBasicMaterial color="#070b1e" />
      </mesh>

      <group position={[-0.55, 0.28, -1.4]}>
        <mesh scale={[2.5, 1.5, 1.3]}>
          <sphereGeometry args={[1.25, 48, 48]} />
          <meshBasicMaterial color="#5f68ff" transparent opacity={0.35} />
        </mesh>
        <mesh position={[0.75, -0.2, 0.1]} scale={[1.8, 1.2, 1.2]}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshBasicMaterial color="#7b49ff" transparent opacity={0.34} />
        </mesh>
        <mesh position={[-0.62, -0.34, 0.02]} scale={[1.4, 1.15, 1.1]}>
          <sphereGeometry args={[0.9, 42, 42]} />
          <meshBasicMaterial color="#355bff" transparent opacity={0.31} />
        </mesh>
      </group>

      <mesh position={[0.2, -1.05, -1.6]} scale={[3.8, 1, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#ff4edb" transparent opacity={0.14} />
      </mesh>

      <group ref={dockRef} position={[-3.42, 0, 0.32]}>
        <RoundedBox args={[0.26, 3.2, 0.08]} radius={0.09} smoothness={6}>
          <meshPhysicalMaterial color="#0d1740" transparent opacity={0.82} roughness={0.42} metalness={0.2} />
        </RoundedBox>
        {[-1.1, -0.72, -0.34, 0.04, 0.42, 0.8, 1.18].map((y, index) => (
          <mesh key={`dock-icon-${y}`} position={[0, y, 0.08]}>
            <ringGeometry args={[0.045, 0.062, 32]} />
            <meshBasicMaterial color={index === 2 ? "#27d3ff" : "#f2f5ff"} transparent opacity={index === 2 ? 0.95 : 0.72} />
          </mesh>
        ))}
        <mesh position={[0, -1.47, 0.08]}>
          <ringGeometry args={[0.017, 0.024, 24]} />
          <meshBasicMaterial color="#f2f5ff" transparent opacity={0.6} />
        </mesh>
      </group>

      <Float speed={0.85} rotationIntensity={0.05} floatIntensity={0.06}>
        <group ref={rigRef}>
          <group ref={frameRef} scale={1.25}>
            <RoundedBox args={[3.25, 1.95, 0.15]} radius={0.08} smoothness={8}>
              <MeshTransmissionMaterial
                chromaticAberration={0.035}
                anisotropy={0.38}
                thickness={0.28}
                roughness={0.13}
                distortion={0.08}
                distortionScale={0.16}
                temporalDistortion={0.04}
                iridescence={0.5}
                iridescenceIOR={1.1}
                color="#d6edff"
              />
            </RoundedBox>

            <RoundedBox args={[3.25, 1.95, 0.016]} radius={0.08} smoothness={8} position={[0, 0, 0.078]}>
              <meshPhysicalMaterial color="#131f52" transparent opacity={0.9} roughness={0.4} metalness={0.08} />
            </RoundedBox>

            <group ref={layersRef}>
              <UiCard position={[0, 0.69, 0.11]} size={[3.05, 0.18, 0.02]} color="#1c2d73" opacity={0.78} radius={0.03} />

              <UiCard position={[-1.17, -0.06, 0.115]} size={[0.56, 1.45, 0.02]} color="#111d4c" opacity={0.82} radius={0.04} />

              {[
                [0.76, 0.38, 0.115],
                [0.76, -0.15, 0.115],
                [0.76, -0.62, 0.115],
              ].map((position, index) => (
                <UiCard
                  key={`center-${index}`}
                  position={position as [number, number, number]}
                  size={[1.6, index === 0 ? 0.42 : index === 1 ? 0.34 : 0.44, 0.02]}
                  color={index === 0 ? "#1c2d73" : "#0f1c4e"}
                  opacity={0.78}
                  radius={0.045}
                />
              ))}

              <UiCard
                position={[0.23, 0.4, 0.12]}
                size={[1.9, 0.48, 0.02]}
                color="#2a3f86"
                opacity={0.86}
                radius={0.055}
                emissive="#27d3ff"
                emissiveIntensity={0.14}
              />

              {[-0.44, 0.23, 0.9].map((x, index) => (
                <UiCard
                  key={`proj-${x}`}
                  position={[x, -0.04, 0.125]}
                  size={[0.52, 0.34, 0.02]}
                  color={index === 1 ? "#7b49ff" : "#1c2d73"}
                  opacity={0.86}
                  radius={0.04}
                  emissive={index === 1 ? "#a24bff" : "#27d3ff"}
                  emissiveIntensity={index === 1 ? 0.16 : 0.08}
                />
              ))}

              {[-0.13, 0.59].map((x) => (
                <UiCard
                  key={`up-${x}`}
                  position={[x, -0.44, 0.125]}
                  size={[0.92, 0.3, 0.02]}
                  color="#0f1b48"
                  opacity={0.84}
                  radius={0.04}
                />
              ))}

              <UiCard position={[0.23, -0.78, 0.125]} size={[1.9, 0.2, 0.02]} color="#0e1842" opacity={0.88} radius={0.035} />

              {!isMobile ? (
                <>
                  <UiCard position={[1.2, 0.2, 0.122]} size={[0.76, 1.2, 0.02]} color="#111d4c" opacity={0.84} radius={0.05} />
                  <UiCard
                    position={[1.2, 0.58, 0.128]}
                    size={[0.42, 0.42, 0.02]}
                    color="#17285b"
                    opacity={0.9}
                    radius={0.21}
                    emissive="#ff5ae6"
                    emissiveIntensity={0.1}
                  />
                  {[-0.02, -0.21, -0.4].map((y) => (
                    <UiCard key={`act-${y}`} position={[1.2, y, 0.13]} size={[0.58, 0.12, 0.02]} color="#1a2b61" opacity={0.88} radius={0.03} />
                  ))}
                </>
              ) : null}

              {[-0.58, -0.18, 0.22].map((y, index) => (
                <mesh key={`social-ring-${y}`} position={[-0.83, y, 0.135]}>
                  <torusGeometry args={[0.05, 0.012, 24, 40]} />
                  <meshBasicMaterial color={index === 1 ? "#27d3ff" : "#ff5ae6"} transparent opacity={0.78} />
                </mesh>
              ))}
            </group>
          </group>
        </group>
      </Float>

      <points position={[0.2, 0.05, 0.2]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                -2.2, 1.1, 0,
                -1.8, -0.9, 0,
                2.1, 0.7, 0,
                2.4, -1.1, 0,
                0.1, 1.2, 0,
                0.7, -1.3, 0,
              ]),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial color="#b4cbff" size={0.02} transparent opacity={0.22} depthWrite={false} />
      </points>
    </>
  );
}

export function HeroScene({ scrollProgress }: HeroSceneProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setIsMobile(media.matches);
    const updateReduced = () => setPrefersReducedMotion(reduced.matches);

    update();
    updateReduced();

    media.addEventListener("change", update);
    reduced.addEventListener("change", updateReduced);

    return () => {
      media.removeEventListener("change", update);
      reduced.removeEventListener("change", updateReduced);
    };
  }, []);

  return (
    <div
      className="hero-scene-shell"
      aria-hidden="true"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <Canvas
        dpr={[1, 1.7]}
        camera={{ position: [0, 0.05, 3.55], fov: 34 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <SceneContent
          scrollProgress={scrollProgress}
          isHovered={isHovered}
          isMobile={isMobile}
          prefersReducedMotion={prefersReducedMotion}
        />
      </Canvas>
    </div>
  );
}

