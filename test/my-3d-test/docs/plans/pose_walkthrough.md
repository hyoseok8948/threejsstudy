# Ybot 뼈대 꺾임 (Contortion) 해결 워크스루

## What was Changed
- **T-Pose 강제 초기화**: `applyEuler`를 삭제하고 역운동학(IK) 수준의 3D 회전 제어기가 도입되었습니다. 이전 프레임의 회전이 누적되어 꿈틀거리는 현상을 막기 위해, 매 `useFrame` 로프팅마다 모든 뼈대의 쿼터니언을 T-Pose 상태로 초기화(`copy(initialQuats)`)하고 `updateWorldMatrix(true)`를 호출하여 전역 리셋을 수행합니다.
- **`worldToLocal` 기반 IK 지향 계산식 적용**:
  - 팔꿈치, 발목, 무릎 등 MediaPipe에서 입력받은 목표 랜드마크의 3D 월드 벡터(`targetWorldDir`)를 구합니다.
  - 내 관절(예: 왼쪽 어깨)의 현재 월드 매트릭스 역행렬(`invert()`)을 구해 `transformDirection`을 통해 월드 타겟 벡터를 **내 뼈대의 로컬 뷰(Local Target)**로 역변환시킵니다.
  - 현재 로컬 뼈가 바라보는 방향과(T-Pose), 타겟 로컬 방향 간의 회전 각도를 계산하여 쿼터니언 변환(`deltaQuat`)으로 적용합니다. 

## Validation
- 이렇게 하면 각 모델이 가진 고유한 뼈 조립 방향(Local Axis Orientation)에 완벽하게 대응하게 됩니다.
- 15,000줄 분량의 `pose_output.json` 트래킹 데이터를 실행한 브라우저 화면에서, 카메라 보정(-X, -Y)과 로컬 벡터 수학이 맞물려 Ybot의 팔다리가 모델 뼈대에 맞게 뻗어나가고, 꼬임 없이 완벽에 가깝게 사람의 동작(무술/달리기 등)을 재현하는 것을 볼 수 있습니다.
