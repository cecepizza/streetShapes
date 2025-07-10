// --- Imports ---
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useEffect, useMemo, useState } from "react";
import GUI from "lil-gui";

// --- Texture Paths ---
const TEXTURE_PATHS = [
  "/window1_BaseColor.jpg",
  "/window1_Normal.jpg",
  "/window1_Roughness.jpg",
  "/window1_Metallic.jpg",
  "/window1_AmbientOcclusion.jpg",
  "/window1_Height.jpg",
  "/window1_Opacity.jpg",
];

// --- 3D Window Cube ---
interface Window1Props {
  roughness: number;
  metalness: number;
  aoMapIntensity: number;
  displacementScale: number;
  envMapIntensity: number;
  alphaTest: number;
  normalScale: number;
}
function Window1({
  roughness,
  metalness,
  aoMapIntensity,
  displacementScale,
  envMapIntensity,
  alphaTest,
  normalScale,
}: Window1Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [
    colorMap,
    normalMap,
    roughnessMap,
    metalnessMap,
    aoMap,
    heightMap,
    opacityMap,
  ] = useLoader(THREE.TextureLoader, TEXTURE_PATHS);

  // Texture optimization
  useMemo(() => {
    [
      colorMap,
      normalMap,
      roughnessMap,
      metalnessMap,
      aoMap,
      heightMap,
      opacityMap,
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
  ]);

  // AO UV2 setup
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

  // Subtle animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1, 64, 64, 64]} />
      <meshStandardMaterial
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
      />
    </mesh>
  );
}

// --- Lighting Setup ---
interface LightingProps {
  ambientIntensity: number;
  keyIntensity: number;
  keyColor: string;
  fillIntensity: number;
  rimIntensity: number;
}
function Lighting({
  ambientIntensity,
  keyIntensity,
  keyColor,
  fillIntensity,
  rimIntensity,
}: LightingProps) {
  return (
    <>
      <ambientLight intensity={ambientIntensity} color="#ffffff" />
      <directionalLight
        position={[8, 12, 6]}
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

// --- Ground Plane ---
function Ground() {
  return (
    <>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.5}
        scale={3}
        blur={2}
        far={2}
      />
    </>
  );
}

// --- GUI Controls ---
interface ControlsGUIProps extends LightingProps, Window1Props {
  setAmbientIntensity: (v: number) => void;
  setKeyIntensity: (v: number) => void;
  setKeyColor: (v: string) => void;
  setFillIntensity: (v: number) => void;
  setRimIntensity: (v: number) => void;
  setRoughness: (v: number) => void;
  setMetalness: (v: number) => void;
  setAoMapIntensity: (v: number) => void;
  setDisplacementScale: (v: number) => void;
  setEnvMapIntensity: (v: number) => void;
  setAlphaTest: (v: number) => void;
  setNormalScale: (v: number) => void;
}
function ControlsGUI(props: ControlsGUIProps) {
  useEffect(() => {
    const gui = new GUI();
    const lightingFolder = gui.addFolder("Lighting");
    lightingFolder
      .add(props, "ambientIntensity", 0, 2, 0.01)
      .onChange(props.setAmbientIntensity);
    lightingFolder
      .add(props, "keyIntensity", 0, 4, 0.01)
      .onChange(props.setKeyIntensity);
    lightingFolder.addColor(props, "keyColor").onChange(props.setKeyColor);
    lightingFolder
      .add(props, "fillIntensity", 0, 2, 0.01)
      .onChange(props.setFillIntensity);
    lightingFolder
      .add(props, "rimIntensity", 0, 2, 0.01)
      .onChange(props.setRimIntensity);
    lightingFolder.open();
    const materialFolder = gui.addFolder("Material");
    materialFolder
      .add(props, "roughness", 0, 1, 0.01)
      .onChange(props.setRoughness);
    materialFolder
      .add(props, "metalness", 0, 1, 0.01)
      .onChange(props.setMetalness);
    materialFolder
      .add(props, "aoMapIntensity", 0, 3, 0.01)
      .onChange(props.setAoMapIntensity);
    materialFolder
      .add(props, "displacementScale", 0, 0.1, 0.001)
      .onChange(props.setDisplacementScale);
    materialFolder
      .add(props, "envMapIntensity", 0, 2, 0.01)
      .onChange(props.setEnvMapIntensity);
    materialFolder
      .add(props, "alphaTest", 0, 1, 0.01)
      .onChange(props.setAlphaTest);
    materialFolder
      .add(props, "normalScale", 0, 3, 0.01)
      .onChange(props.setNormalScale);
    materialFolder.open();
    return () => gui.destroy();
  }, [props]);
  return null;
}

// --- Performance Stats (optional) ---
function PerformanceStats() {
  const { gl } = useThree();
  useEffect(() => {
    const context = gl.getContext();
    if (context) {
      console.log("WebGL Renderer Info:", {
        vendor: context.getParameter(context.VENDOR),
        renderer: context.getParameter(context.RENDERER),
        version: context.getParameter(context.VERSION),
        maxTextureSize: context.getParameter(context.MAX_TEXTURE_SIZE),
      });
    }
  }, [gl]);
  return null;
}

// --- Main App ---
export default function App() {
  // Lighting state
  const [ambientIntensity, setAmbientIntensity] = useState(0.4);
  const [keyIntensity, setKeyIntensity] = useState(1.8);
  const [keyColor, setKeyColor] = useState("#ffffff");
  const [fillIntensity, setFillIntensity] = useState(0.8);
  const [rimIntensity, setRimIntensity] = useState(0.6);
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
        backgroundColor: "#0a0a0a",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <ControlsGUI
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
      />
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap, enabled: true }}
        camera={{ position: [3, 2, 5], fov: 45, near: 0.1, far: 100 }}
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
        />
        <Ground />
        <Window1
          roughness={roughness}
          metalness={metalness}
          aoMapIntensity={aoMapIntensity}
          displacementScale={displacementScale}
          envMapIntensity={envMapIntensity}
          alphaTest={alphaTest}
          normalScale={normalScale}
        />
        <Environment preset="city" background={false} />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={2}
          maxDistance={10}
          maxPolarAngle={Math.PI / 2.2}
        />
        <PerformanceStats />
      </Canvas>
    </div>
  );
}
