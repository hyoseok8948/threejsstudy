# Ybot 포즈 꺾임(Contortion) 근본 해결 계획

## 원인 분석: 왜 아직도 기괴하게 꺾여 있을까?
이전의 2D 평면 Euler 투영 방식은 "꿈틀거리며 튀는 증상(Jitter)"은 멈췄지만, 결정적으로 **뼈대의 로컬(Local) 회전축 무시**라는 치명적인 한계가 있었습니다. 

Ybot의 '왼팔'은 기본적으로 T-Pose 상태에서 월드의 `-X`를 바라보도록 조립되어 있지 않고, 내부적으로 Z축이 앞을 향하거나 Y축이 비틀려 있을 수 있습니다(모델러/프로그램에 따라 다름). 여기에다 월드 공간 기반의 각도(`dx, dy`)를 그대로 `bone.rotation.x` 등에 주입했기 때문에, 팔이 하늘로 꺾이고 다리가 뒤집히는 것입니다.

## Proposed Changes: 로컬 공간 역변환 (World-to-Local FK)

Three.js에서 이 문제를 해결하는 "정석적인" 방법은 다음과 같습니다. 매 프레임마다 아래 과정을 거쳐야 합니다.

### 1. 매 프레임 완전 초기화 (Reset to T-Pose)
꿈틀거리는 증상(오차 누적)을 막기 위해, 매 프레임 회전 계산을 시작하기 전 **모든 뼈대를 초기 T-Pose 상태(`initialQuats`)로 원상복구**시킵니다.
```typescript
joints.forEach(j => nodes[j].quaternion.copy(initialQuats[j]));
nodes.mixamorigHips.updateWorldMatrix(true, true); // 자식 뼈대까지 월드 매트릭스 갱신
```

### 2. 목표 벡터를 "내 뼈대의 로컬 좌표계" 안으로 가져오기 🌟
MediaPipe에서 가져온 타겟 좌표(예: 팔꿈치)는 **월드(World) 좌표**입니다. 이 월드 타겟을 내가 회전시켜야 할 어깨 뼈의 **로컬 공간(Local Space)**으로 역변환(`worldToLocal`)해야 합니다.
내 로컬 공간 안에서 팔꿈치가 있어야 할 곳(Target)과, 현재 내 팔꿈치(Child)가 있는 곳 사이의 벡터를 구한 뒤 `setFromUnitVectors`로 쿼터니언 회전을 구하면, 뼈의 초기 축이 어떻게 비틀려 있든 정확하게 타겟만 바라보게 꺾입니다.

### [MODIFY] [src/Ybot.tsx](file:///c:/Users/USER/Desktop/test/my-3d-test/src/Ybot.tsx)
- 이전의 `applyEuler` 함수를 삭제합니다.
- 새로운 `trackBone(bone, childBone, startMpPos, endMpPos)` 함수를 도입합니다.
- 매 프레임마다 `initialQuats`를 적용하여 뼈대를 초기화하고 `updateMatrixWorld(true)`를 호출하여 매트릭스를 정렬한 뒤, `worldToLocal` 기반의 쿼터니언 회전을 적용합니다.

## User Review Required
"매 프레임 T-Pose 초기화 후, 월드 타겟을 로컬 좌표계로 역변환하여 정확하게 조준시키는" 3D 리타겟팅의 정석적인 방법으로 코드를 다시 개편해 보겠습니다. 동의해주시면 진행하겠습니다!
