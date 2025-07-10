import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

function Window1() {
  const [
    colorMap,
    normalMap,
    roughnessMap,
    metalnessMap,
    aoMap,
    heightMap,
    opacityMap,
  ] = useLoader(THREE.TextureLoader, [
    "/window1_BaseColor.jpg",
    "/window1_Normal.jpg",
    "/window1_Roughness.jpg",
    "/window1_Metallic.jpg",
    "/window1_AmbientOcclusion.jpg",
    "/window1_Height.jpg",
    "/window1_SpecularLevel.jpg",
    "/window1_Opacity.jpg",
  ]);
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        metalnessMap={metalnessMap}
        aoMap={aoMap}
        displacementMap={heightMap}
        displacementScale={0.01}
        alphaMap={opacityMap}
      />
    </mesh>
  );
}

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "black" }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 7]} intensity={1} />
        <Window1 />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
