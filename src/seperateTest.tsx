import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useEffect, useMemo, useState } from "react";
import { CameraAndMaterialControls } from "./gui";

const TEXTURE_PATHS = [
  "/seperateTest/seperate_BaseColor.jpg",
  "/seperateTest/seperate_Normal.jpg",
  "/seperateTest/seperate_Roughness.jpg",
  "/seperateTest/seperate_Metallic.jpg",
  "/seperateTest/seperate_AmbientOcclusion.jpg",
  "/seperateTest/seperate_Height.jpg",
  "/seperateTest/seperate_Opacity.jpg",
  "/seperateTest/seperate_SpecularLevel.jpg",
];

interface SeperateSphereProps {
  roughness: number;
  metalness: number;
  aoMapIntensity: number;
  displacementScale: number;
  envMapIntensity: number;
  alphaTest: number;
  normalScale: number;
}
function SeperateSphere({
  roughness,
  metalness,
  aoMapIntensity,
  displacementScale,
  envMapIntensity,
  alphaTest,
  normalScale,
}: SeperateSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [
    colorMap,
    normalMap,
    roughnessMap,
    metalnessMap,
    aoMap,
    heightMap,
    opacityMap,
    specularMap,
  ] = useLoader(THREE.TextureLoader, TEXTURE_PATHS);

  useMemo(() => {
    [
      colorMap,
      normalMap,
      roughnessMap,
      metalnessMap,
      aoMap,
      heightMap,
      opacityMap,
      specularMap,
    ].forEach((texture) => {
      if (texture) {
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    });
  }, [
    colorMap,
    normalMap,
    roughnessMap,
    metalnessMap,
    aoMap,
    heightMap,
    opacityMap,
    specularMap,
  ]);

  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry;
      if (!geometry.attributes.uv2) {
        geometry.setAttribute(
          "uv2",
          new THREE.BufferAttribute(geometry.attributes.uv.array, 2)
        );
      }
    }
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow receiveShadow>
      <sphereGeometry args={[0.7, 64, 64]} />
      <meshPhysicalMaterial
        map={colorMap}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(normalScale, normalScale)}
        roughnessMap={roughnessMap}
        roughness={roughness}
        metalnessMap={metalnessMap}
        metalness={metalness}
        aoMap={aoMap}
        aoMapIntensity={aoMapIntensity}
        displacementMap={heightMap}
        displacementScale={displacementScale}
        alphaMap={opacityMap}
        transparent
        alphaTest={alphaTest}
        envMapIntensity={envMapIntensity}
        clearcoat={0.7}
        clearcoatRoughness={0.2}
      />
    </mesh>
  );
}

interface LightingProps {
  ambientIntensity: number;
  keyIntensity: number;
  keyColor: string;
  fillIntensity: number;
  rimIntensity: number;
  keyLightPosition: [number, number, number];
}
function Lighting({
  ambientIntensity,
  keyIntensity,
  keyColor,
  fillIntensity,
  rimIntensity,
  keyLightPosition,
}: LightingProps) {
  return (
    <>
      <ambientLight intensity={ambientIntensity} color="#ffffff" />
      <directionalLight
        position={keyLightPosition}
        intensity={keyIntensity}
        color={keyColor}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-far={25}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.00005}
        shadow-normalBias={0.02}
      />
      <directionalLight
        position={[-6, 8, -4]}
        intensity={fillIntensity}
        color="#88bbff"
      />
      <directionalLight
        position={[2, 3, -8]}
        intensity={rimIntensity}
        color="#ffbb66"
      />
      <directionalLight position={[-8, 5, 2]} intensity={0.4} color="#ffffff" />
      <directionalLight position={[8, 3, -2]} intensity={0.3} color="#ffddaa" />
      <pointLight
        position={[2, 3, 3]}
        intensity={0.8}
        color="#ffffff"
        distance={10}
        decay={2}
      />
    </>
  );
}

function GlowingUnderSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]} scale={1.0}>
      <sphereGeometry args={[0.7, 64, 64]} />
      <meshPhysicalMaterial
        color={"#00eaff"}
        emissive={"#00eaff"}
        emissiveIntensity={2}
        transparent
        opacity={0.15}
        roughness={0.3}
        metalness={0.2}
        clearcoat={0.5}
        clearcoatRoughness={0.3}
      />
    </mesh>
  );
}

export default function SeperateTest() {
  // Lighting state
  const [ambientIntensity, setAmbientIntensity] = useState(0.4);
  const [keyIntensity, setKeyIntensity] = useState(1.8);
  const [keyColor, setKeyColor] = useState("#ffffff");
  const [fillIntensity, setFillIntensity] = useState(0.8);
  const [rimIntensity, setRimIntensity] = useState(0.6);
  // Add state for key light position
  const [keyLightPosition, setKeyLightPosition] = useState<
    [number, number, number]
  >([8, 12, 6]);
  // Material state
  const [roughness, setRoughness] = useState(0.3);
  const [metalness, setMetalness] = useState(0.1);
  const [aoMapIntensity, setAoMapIntensity] = useState(1.5);
  const [displacementScale, setDisplacementScale] = useState(0.02);
  const [envMapIntensity, setEnvMapIntensity] = useState(0.8);
  const [alphaTest, setAlphaTest] = useState(0.1);
  const [normalScale, setNormalScale] = useState(1);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        minHeight: "100vh",
        background: "#f4f6fa",
        fontFamily: "Inter, system-ui, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "80vw",
          height: "80vh",
          borderRadius: 18,
          boxShadow: "0 2px 16px 0 rgba(0,0,0,0.07)",
          overflow: "hidden",
          background: "#e9eef6",
          display: "flex",
          flexDirection: "row-reverse",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 32,
        }}
      >
        <section
          style={{
            minWidth: 320,
            maxWidth: 360,
            width: "100%",
            background: "transparent",
            borderRadius: 2,
            boxShadow: "0 2px 16px 0 rgba(0,0,0,0.07)",
            marginTop: 0,
            marginBottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            height: "auto",
          }}
        >
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
        </section>
        <section
          style={{
            flex: 1,
            minWidth: 0,
            height: "70vh",
            maxHeight: 700,
            background: "#e9eef6",
            borderRadius: 18,
            boxShadow: "0 2px 16px 0 rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div style={{ width: "100%", height: "100%" }}>
            <Canvas
              shadows={{ type: THREE.PCFSoftShadowMap, enabled: true }}
              camera={{ position: [0, 0, 8], fov: 30, near: 0.1, far: 100 }}
              gl={{
                antialias: true,
                alpha: false,
                powerPreference: "high-performance",
              }}
            >
              <Lighting
                ambientIntensity={ambientIntensity}
                keyIntensity={keyIntensity}
                keyColor={keyColor}
                fillIntensity={fillIntensity}
                rimIntensity={rimIntensity}
                keyLightPosition={keyLightPosition}
              />
              <GlowingUnderSphere />
              <SeperateSphere
                roughness={roughness}
                metalness={metalness}
                aoMapIntensity={aoMapIntensity}
                displacementScale={displacementScale}
                envMapIntensity={envMapIntensity}
                alphaTest={alphaTest}
                normalScale={normalScale}
              />
              <Environment preset="sunset" background={false} />
              <OrbitControls enablePan enableZoom enableRotate />
            </Canvas>
          </div>
        </section>
      </div>
    </div>
  );
}
