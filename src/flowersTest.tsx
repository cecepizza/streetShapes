import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useState } from "react";
import { CameraAndMaterialControls } from "./gui";

const FLOWERS_TEXTURE_PATHS = [
  "/flowersTextures/albedoOG.png",
  "/flowersTextures/normalsColored.png", 
  "/flowersTextures/roughness.png",
  "/flowersTextures/AO_depth.png",
  "/flowersTextures/displacementGrayscale.png",
];

function useFlowersTextures() {
  const textures = useLoader(THREE.TextureLoader, FLOWERS_TEXTURE_PATHS);

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

function FlowersPlane({ 
  roughness, 
  metalness, 
  aoMapIntensity, 
  displacementScale, 
  envMapIntensity, 
  normalScale 
}: {
  roughness: number;
  metalness: number;
  aoMapIntensity: number;
  displacementScale: number;
  envMapIntensity: number;
  normalScale: number;
}) {
  const textures = useFlowersTextures();
  const [
    albedoMap,
    normalMap,
    roughnessMap,
    aoMap,
    displacementMap,
  ] = textures;

  return (
    <mesh rotation={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[16, 9, 256, 144]} />
      <meshStandardMaterial
        map={albedoMap}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(normalScale, normalScale)}
        roughnessMap={roughnessMap}
        roughness={roughness}
        metalness={metalness}
        aoMap={aoMap}
        aoMapIntensity={aoMapIntensity}
        displacementMap={displacementMap}
        displacementScale={displacementScale}
        envMapIntensity={envMapIntensity}
      />
    </mesh>
  );
}

export default function FlowersTest() {
  const [ambientIntensity, setAmbientIntensity] = useState(0.4);
  const [keyIntensity, setKeyIntensity] = useState(1.5);
  const [keyColor, setKeyColor] = useState("#ffffff");
  const [fillIntensity, setFillIntensity] = useState(0.3);
  const [rimIntensity, setRimIntensity] = useState(0);
  const [roughness, setRoughness] = useState(0.8);
  const [metalness, setMetalness] = useState(0.1);
  const [aoMapIntensity, setAoMapIntensity] = useState(1.2);
  const [displacementScale, setDisplacementScale] = useState(0.3);
  const [envMapIntensity, setEnvMapIntensity] = useState(0.5);
  const [alphaTest, setAlphaTest] = useState(0.1);
  const [normalScale, setNormalScale] = useState(2);
  const [keyLightPosition, setKeyLightPosition] = useState<[number, number, number]>([10, 10, 5]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", display: "flex" }}>
      <div style={{ flex: 1 }}>
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
          <h1 style={{ margin: 0, fontSize: "2rem" }}>Flowers Plane</h1>
          <p style={{ margin: "10px 0 0 0", fontSize: "1.2rem" }}>
            PBR textured plane with displacement mapping
          </p>
        </div>

        <Canvas
          shadows={{ type: THREE.PCFSoftShadowMap, enabled: true }}
          camera={{ position: [8, 6, 8], fov: 45 }}
        >
          <ambientLight intensity={ambientIntensity} />
          <directionalLight
            position={keyLightPosition}
            intensity={keyIntensity}
            color={keyColor}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <directionalLight position={[-5, 5, -5]} intensity={fillIntensity} />

          <FlowersPlane 
            roughness={roughness}
            metalness={metalness}
            aoMapIntensity={aoMapIntensity}
            displacementScale={displacementScale}
            envMapIntensity={envMapIntensity}
            normalScale={normalScale}
          />
          <Environment preset="sunset" background />

          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            dampingFactor={0.05}
            enableDamping
          />
        </Canvas>
      </div>
      
      <div style={{ position: "absolute", top: 0, right: 0, zIndex: 100 }}>
        <CameraAndMaterialControls
          ambientIntensity={ambientIntensity}
          setAmbientIntensity={setAmbientIntensity}
          keyIntensity={keyIntensity}
          setKeyIntensity={setKeyIntensity}
          keyColor={keyColor}
          setKeyColor={setKeyColor}
          fillIntensity={fillIntensity}
          setFillIntensity={setFillIntensity}
          rimIntensity={rimIntensity}
          setRimIntensity={setRimIntensity}
          roughness={roughness}
          setRoughness={setRoughness}
          metalness={metalness}
          setMetalness={setMetalness}
          aoMapIntensity={aoMapIntensity}
          setAoMapIntensity={setAoMapIntensity}
          displacementScale={displacementScale}
          setDisplacementScale={setDisplacementScale}
          envMapIntensity={envMapIntensity}
          setEnvMapIntensity={setEnvMapIntensity}
          alphaTest={alphaTest}
          setAlphaTest={setAlphaTest}
          normalScale={normalScale}
          setNormalScale={setNormalScale}
          keyLightPosition={keyLightPosition}
          setKeyLightPosition={setKeyLightPosition}
        />
      </div>
    </div>
  );
}