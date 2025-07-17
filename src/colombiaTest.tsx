import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import {
  Physics,
  useSphere,
  useBox,
  useContactMaterial,
} from "@react-three/cannon";
import * as THREE from "three";
import { useMemo, useState, useCallback } from "react";

const TEXTURE_PATHS = [
  "/colombiaTexture/colombiaMaterial/colombiaMaterial_BaseColor.jpg",
  "/colombiaTexture/colombiaMaterial/colombiaMaterial_Normal.jpg",
  "/colombiaTexture/colombiaMaterial/colombiaMaterial_Roughness.jpg",
  "/colombiaTexture/colombiaMaterial/colombiaMaterial_Metallic.jpg",
  "/colombiaTexture/colombiaMaterial/colombiaMaterial_AmbientOcclusion.jpg",
  "/colombiaTexture/colombiaMaterial/colombiaMaterial_Height.jpg",
  "/colombiaTexture/colombiaMaterial/colombiaMaterial_Opacity.jpg",
  "/colombiaTexture/colombiaMaterial/colombiaMaterial_SpecularLevel.jpg",
];

function useColombiaTextures() {
  const textures = useLoader(THREE.TextureLoader, TEXTURE_PATHS);

  return useMemo(() => {
    textures.forEach((texture) => {
      if (texture) {
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    });
    return textures;
  }, [textures]);
}

function Marble({ position, cameraAngle }: { position: [number, number, number]; cameraAngle: THREE.Vector3 }) {
  const marbleRadius = 0.5;
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: [position[0], position[1] + marbleRadius, position[2]], // Rest on surface
    material: "marble",
    args: [marbleRadius]
  }));

  const textures = useColombiaTextures();
  const [
    colorMap,
    normalMap,
    roughnessMap,
    metalnessMap,
    aoMap,
    heightMap,
    opacityMap,
  ] = textures;

  // Apply smoother force based on camera viewing angle (like tilting a table)
  useFrame(() => {
    if (ref.current && cameraAngle) {
      const tiltForce = 3.5;
      
      // More intuitive tilt mapping
      const forceX = Math.sin(cameraAngle.y) * Math.cos(cameraAngle.x) * tiltForce;
      const forceZ = -Math.cos(cameraAngle.y) * Math.sin(cameraAngle.x) * tiltForce;
      
      api.applyForce([forceX, 0, forceZ], [0, 0, 0]);
    }
  });

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <sphereGeometry args={[marbleRadius, 32, 32]} />
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(1, 1)}
        roughnessMap={roughnessMap}
        roughness={0.3}
        metalnessMap={metalnessMap}
        metalness={0.1}
        aoMap={aoMap}
        aoMapIntensity={1.5}
        displacementMap={heightMap}
        displacementScale={0.02}
        alphaMap={opacityMap}
        transparent
        alphaTest={0.1}
        envMapIntensity={0.8}
      />
    </mesh>
  );
}

function Marbles({ cameraAngle }: { cameraAngle: THREE.Vector3 }) {
  const marblePositions: [number, number, number][] = useMemo(
    () => [
      [0, 0, 0],
      [2, 0, 1],
      [-1.5, 0, -0.5],
      [1, 0, -2],
      [-2, 0, 1.5],
      [0.5, 0, 0.8],
      [-1, 0, -1.2],
      [2.5, 0, 0.3],
    ],
    []
  );

  return (
    <>
      {marblePositions.map((position, index) => (
        <Marble key={index} position={position} cameraAngle={cameraAngle} />
      ))}
    </>
  );
}

function WoodFloor() {
  const [ref] = useBox(() => ({
    type: "Static",
    position: [0, -0.25, 0],
    args: [20, 0.5, 20],
    material: "wood",
  }));

  return (
    <mesh ref={ref} receiveShadow position={[0, -0.25, 0]}>
      <boxGeometry args={[20, 0.5, 20]} />
      <meshStandardMaterial 
        color="#D2691E" 
        roughness={0.9} 
        metalness={0.05}
        normalScale={new THREE.Vector2(1, 1)}
      />
    </mesh>
  );
}

function ContainerWall({ position, args }: { position: [number, number, number]; args: [number, number, number] }) {
  const [ref] = useBox(() => ({
    type: "Static",
    position,
    args,
  }));

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial color="#666" transparent opacity={0.2} />
    </mesh>
  );
}

function ContainerWalls() {
  const wallConfigs = useMemo(
    () => [
      {
        position: [0, 5, -10] as [number, number, number],
        args: [20, 10, 0.5] as [number, number, number],
      },
      {
        position: [0, 5, 10] as [number, number, number],
        args: [20, 10, 0.5] as [number, number, number],
      },
      {
        position: [-10, 5, 0] as [number, number, number],
        args: [0.5, 10, 20] as [number, number, number],
      },
      {
        position: [10, 5, 0] as [number, number, number],
        args: [0.5, 10, 20] as [number, number, number],
      },
    ],
    []
  );

  return (
    <>
      {wallConfigs.map((config, index) => (
        <ContainerWall key={index} position={config.position} args={config.args} />
      ))}
    </>
  );
}

function CameraTracker({ onCameraMove }: { onCameraMove: (rotation: THREE.Vector3) => void }) {
  const { camera } = useThree();
  
  useFrame(() => {
    const rotation = new THREE.Vector3(camera.rotation.x, camera.rotation.y, camera.rotation.z);
    onCameraMove(rotation);
  });

  return null;
}

function PhysicsScene({ cameraAngle }: { cameraAngle: THREE.Vector3 }) {
  useContactMaterial("marble", "wood", {
    friction: 0.3,
    restitution: 0.4,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e7,
    frictionEquationRelaxation: 3,
  });

  useContactMaterial("marble", "marble", {
    friction: 0.2,
    restitution: 0.7,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e7,
    frictionEquationRelaxation: 3,
  });

  return (
    <>
      <WoodFloor />
      <ContainerWalls />
      <Marbles cameraAngle={cameraAngle} />
    </>
  );
}

export default function ColombiaTest() {
  const [cameraAngle, setCameraAngle] = useState(new THREE.Vector3(0, 0, 0));
  
  const handleCameraMove = useCallback((rotation: THREE.Vector3) => {
    setCameraAngle(rotation.clone());
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          textAlign: "center",
          color: "white",
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          pointerEvents: "none",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "2rem" }}>Marble Physics</h1>
        <p style={{ margin: "10px 0 0 0", fontSize: "1.2rem" }}>
          Drag to tilt the wooden table and roll marbles
        </p>
      </div>

      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap, enabled: true }}
        camera={{ position: [15, 10, 15], fov: 45 }}
      >
        <Physics gravity={[0, -9.82, 0]} broadphase="SAP">
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} />

          <CameraTracker onCameraMove={handleCameraMove} />
          <PhysicsScene cameraAngle={cameraAngle} />
          <Environment preset="apartment" background />

          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            dampingFactor={0.05}
            enableDamping
          />
        </Physics>
      </Canvas>
    </div>
  );
}
