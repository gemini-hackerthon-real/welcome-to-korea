"use client";

// 마스코트 3D 컴포넌트

import { useRef } from "react";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import { useMascotState } from "@/store/gameStore";

export function Mascot() {
  const groupRef = useRef<Group>(null);
  const mascotState = useMascotState();
  const { currentVariant, currentAnimation, isTransitioning } = mascotState;

  // 애니메이션
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    // 기본 부유 효과
    groupRef.current.position.y = 2 + Math.sin(time * 2) * 0.3;

    // 애니메이션별 동작
    switch (currentAnimation) {
      case "dance":
        groupRef.current.rotation.y = Math.sin(time * 4) * 0.3;
        groupRef.current.position.x = Math.sin(time * 2) * 0.5;
        break;
      case "bow":
        groupRef.current.rotation.x = Math.sin(time) * 0.2;
        break;
      case "paint":
        groupRef.current.rotation.z = Math.sin(time * 3) * 0.1;
        break;
      case "phone_call":
        groupRef.current.rotation.y += 0.002;
        break;
      default:
        groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
    }
  });

  // 트랜지션 중 투명도
  const opacity = isTransitioning ? 0.5 : 1;

  return (
    <group
      ref={groupRef}
      position={[mascotState.position.x, mascotState.position.y, mascotState.position.z]}
      scale={isTransitioning ? 0.8 : 1}
    >
      {/* 몸통 */}
      <mesh position={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[1, 1.5, 8, 16]} />
        <meshStandardMaterial
          color={currentVariant.colorTint || "#FFE4B5"}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* 머리 */}
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshStandardMaterial
          color="#FFE4B5"
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* 눈 */}
      <mesh position={[-0.4, 2.2, 1]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.4, 2.2, 1]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* 볼 터치 */}
      <mesh position={[-0.8, 1.9, 0.8]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color="#FFB6C1" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.8, 1.9, 0.8]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color="#FFB6C1" transparent opacity={0.6} />
      </mesh>

      {/* 의상 - 머리 액세서리 */}
      <HeadAccessory type={currentVariant.outfit.head} />

      {/* 의상 - 손 액세서리 */}
      <HandAccessory type={currentVariant.outfit.hand} />
    </group>
  );
}

// 머리 액세서리 컴포넌트
function HeadAccessory({ type }: { type: string }) {
  switch (type) {
    case "hanbok_gat":
      return (
        <group position={[0, 3.5, 0]}>
          {/* 갓 */}
          <mesh>
            <cylinderGeometry args={[1.5, 1.5, 0.3, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      );

    case "dj_headphones":
      return (
        <group position={[0, 2.8, 0]}>
          {/* 헤드폰 */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[1.3, 0.15, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          <mesh position={[-1.3, -0.3, 0]}>
            <boxGeometry args={[0.4, 0.8, 0.6]} />
            <meshStandardMaterial color="#FF1493" />
          </mesh>
          <mesh position={[1.3, -0.3, 0]}>
            <boxGeometry args={[0.4, 0.8, 0.6]} />
            <meshStandardMaterial color="#FF1493" />
          </mesh>
        </group>
      );

    case "beret":
      return (
        <mesh position={[0.3, 3.2, 0]} rotation={[0.2, 0, 0.3]}>
          <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#9370DB" />
        </mesh>
      );

    case "sunglasses":
      return (
        <group position={[0, 2.2, 1.1]}>
          {/* 선글라스 */}
          <mesh position={[-0.4, 0, 0]}>
            <boxGeometry args={[0.5, 0.3, 0.1]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          <mesh position={[0.4, 0, 0]}>
            <boxGeometry args={[0.5, 0.3, 0.1]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.3, 0.05, 0.05]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      );

    default:
      return null;
  }
}

// 손 액세서리 컴포넌트
function HandAccessory({ type }: { type: string }) {
  switch (type) {
    case "fan":
      return (
        <mesh position={[1.5, 0.5, 0.5]} rotation={[0, 0, -0.3]}>
          <circleGeometry args={[0.8, 16, 0, Math.PI]} />
          <meshStandardMaterial color="#DAA520" side={2} />
        </mesh>
      );

    case "glow_stick":
      return (
        <mesh position={[1.5, 0, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
          <meshStandardMaterial
            color="#00FF00"
            emissive="#00FF00"
            emissiveIntensity={0.8}
          />
        </mesh>
      );

    case "spray_can":
      return (
        <group position={[1.5, 0, 0.3]} rotation={[0.3, 0, -0.3]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
            <meshStandardMaterial color="#FF6347" />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.2, 8]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>
      );

    case "coffee_cup":
      return (
        <group position={[1.5, 0, 0.3]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.15, 0.6, 8]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.1, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        </group>
      );

    default:
      return null;
  }
}
