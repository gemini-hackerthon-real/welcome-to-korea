// 카메라 애니메이션 훅
// 프리셋으로 부드럽게 카메라를 이동시키는 기능 제공

import { useCallback, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CameraPreset } from "@/types/camera";

interface AnimationState {
  isAnimating: boolean;
  startTime: number;
  duration: number;
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  startTarget: THREE.Vector3;
  endTarget: THREE.Vector3;
  startFov: number;
  endFov: number;
}

// Cubic ease-in-out 함수
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function useCameraAnimation(
  controlsRef: React.RefObject<any>
) {
  const { camera } = useThree();
  const animationRef = useRef<AnimationState | null>(null);

  // 애니메이션 프레임 업데이트
  useFrame(() => {
    const anim = animationRef.current;
    if (!anim || !anim.isAnimating) return;

    const elapsed = Date.now() - anim.startTime;
    const progress = Math.min(elapsed / anim.duration, 1);
    const eased = easeInOutCubic(progress);

    // 카메라 위치 보간
    camera.position.lerpVectors(anim.startPosition, anim.endPosition, eased);

    // FOV 보간 (PerspectiveCamera인 경우)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(anim.startFov, anim.endFov, eased);
      camera.updateProjectionMatrix();
    }

    // OrbitControls 타겟 보간
    if (controlsRef.current) {
      const target = new THREE.Vector3();
      target.lerpVectors(anim.startTarget, anim.endTarget, eased);
      controlsRef.current.target.copy(target);
      controlsRef.current.update();
    }

    // 애니메이션 완료
    if (progress >= 1) {
      animationRef.current = null;
    }
  });

  // 프리셋으로 애니메이션
  const animateToPreset = useCallback(
    (preset: CameraPreset) => {
      const duration = preset.transitionDuration || 2000;

      // 현재 상태 저장
      const startPosition = camera.position.clone();
      const endPosition = new THREE.Vector3(
        preset.position.x,
        preset.position.y,
        preset.position.z
      );

      const startTarget = controlsRef.current
        ? controlsRef.current.target.clone()
        : new THREE.Vector3(0, 0, 0);
      const endTarget = new THREE.Vector3(
        preset.target.x,
        preset.target.y,
        preset.target.z
      );

      const startFov =
        camera instanceof THREE.PerspectiveCamera ? camera.fov : 50;
      const endFov = preset.fov || 50;

      animationRef.current = {
        isAnimating: true,
        startTime: Date.now(),
        duration,
        startPosition,
        endPosition,
        startTarget,
        endTarget,
        startFov,
        endFov,
      };
    },
    [camera, controlsRef]
  );

  // 애니메이션 중지
  const stopAnimation = useCallback(() => {
    animationRef.current = null;
  }, []);

  // 애니메이션 중인지 확인
  const isAnimating = useCallback(() => {
    return animationRef.current?.isAnimating ?? false;
  }, []);

  return {
    animateToPreset,
    stopAnimation,
    isAnimating,
  };
}
