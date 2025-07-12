import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, Icosahedron } from '@react-three/drei'

export default function ThreeBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
          <Icosahedron args={[2, 1]}>
            <meshStandardMaterial color="#6366f1" wireframe />
          </Icosahedron>
        </Float>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.5} />
      </Canvas>
    </div>
  )
} 