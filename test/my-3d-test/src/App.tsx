import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, Grid } from '@react-three/drei'
import { Ybot } from './Ybot'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#1a1a1a' }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        {/* 자동 조명 및 환경 설정 */}
        <Stage intensity={0.5} environment="city" adjustCamera={false}>
          <Ybot />
        </Stage>
        
        {/* 이미지와 같은 바닥 그리드 */}
        <Grid infiniteGrid fadeDistance={50} cellColor="#444" />
        
        {/* 마우스로 돌려볼 수 있는 컨트롤 */}
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}

export default App