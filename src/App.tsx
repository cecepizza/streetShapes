// --- Imports ---
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import { useRef, useEffect, useMemo, useState } from "react";
import GUI from "lil-gui";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Window1Test from "./window1Test";
import SeperateTest from "./seperateTest";

// --- Texture Paths ---
const TEXTURE_PATHS = [
  "/window1_metallicSquare/BaseColor.jpg",
  "/window1_metallicSquare/Normal.jpg",
  "/window1_metallicSquare/Roughness.jpg",
  "/window1_metallicSquare/Metallic.jpg",
  "/window1_metallicSquare/AmbientOcclusion.jpg",
  "/window1_metallicSquare/Height.jpg",
  "/window1_metallicSquare/Opacity.jpg",
  "/window1_metallicSquare/SpecularLevel.jpg",
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
    <RoundedBox
      args={[1, 1, 1]}
      radius={0.1}
      smoothness={8}
      position={[0, 0.5, 0]}
      castShadow
      receiveShadow
      ref={meshRef}
    >
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
    </RoundedBox>
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
    // Create a local object for lil-gui to control
    const guiState = {
      ambientIntensity: props.ambientIntensity,
      keyIntensity: props.keyIntensity,
      keyColor: props.keyColor,
      fillIntensity: props.fillIntensity,
      rimIntensity: props.rimIntensity,
      roughness: props.roughness,
      metalness: props.metalness,
      aoMapIntensity: props.aoMapIntensity,
      displacementScale: props.displacementScale,
      envMapIntensity: props.envMapIntensity,
      alphaTest: props.alphaTest,
      normalScale: props.normalScale,
    };

    const gui = new GUI();
    const lightingFolder = gui.addFolder("Lighting");
    lightingFolder
      .add(guiState, "ambientIntensity", 0, 2, 0.01)
      .onChange(props.setAmbientIntensity);
    lightingFolder
      .add(guiState, "keyIntensity", 0, 4, 0.01)
      .onChange(props.setKeyIntensity);
    lightingFolder.addColor(guiState, "keyColor").onChange(props.setKeyColor);
    lightingFolder
      .add(guiState, "fillIntensity", 0, 2, 0.01)
      .onChange(props.setFillIntensity);
    lightingFolder
      .add(guiState, "rimIntensity", 0, 2, 0.01)

      .onChange(props.setRimIntensity);
    lightingFolder.open();
    const materialFolder = gui.addFolder("Material");
    materialFolder
      .add(guiState, "roughness", 0, 1, 0.01)
      .onChange(props.setRoughness);
    materialFolder
      .add(guiState, "metalness", 0, 1, 0.01)
      .onChange(props.setMetalness);
    materialFolder
      .add(guiState, "aoMapIntensity", 0, 3, 0.01)
      .onChange(props.setAoMapIntensity);
    materialFolder
      .add(guiState, "displacementScale", 0, 0.1, 0.001)
      .onChange(props.setDisplacementScale);
    materialFolder
      .add(guiState, "envMapIntensity", 0, 2, 0.01)
      .onChange(props.setEnvMapIntensity);
    materialFolder
      .add(guiState, "alphaTest", 0, 1, 0.01)
      .onChange(props.setAlphaTest);
    materialFolder
      .add(guiState, "normalScale", 0, 3, 0.01)
      .onChange(props.setNormalScale);
    materialFolder.open();
    return () => gui.destroy();
  }, []); // <--- Only run once

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
  return (
    <Router>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#fafbfc",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <nav
          style={{
            width: "100vw",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0.5rem 0",
            background: "#fff",
            boxShadow: "0 2px 12px 0 rgba(0,0,0,0.06)",
            borderBottom: "1px solid #e5e7eb",
            borderRadius: 0,
            fontFamily: "Inter, system-ui, sans-serif",
            gap: 32,
          }}
        >
          <Link
            to="/window1"
            style={{
              color: "#222",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "1.08rem",
              letterSpacing: "0.01em",
              margin: "0 1.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "10px",
              background: "none",
              border: "none",
              transition: "color 0.18s, border-bottom 0.18s",
              position: "relative",
              display: "inline-block",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#2563eb";
              e.currentTarget.style.textDecoration = "underline";
              e.currentTarget.style.textUnderlineOffset = "6px";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#222";
              e.currentTarget.style.textDecoration = "none";
            }}
          >
            Window1 Test
          </Link>
          <Link
            to="/seperate"
            style={{
              color: "#222",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "1.08rem",
              letterSpacing: "0.01em",
              margin: "0 1.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "10px",
              background: "none",
              border: "none",
              transition: "color 0.18s, border-bottom 0.18s",
              position: "relative",
              display: "inline-block",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#2563eb";
              e.currentTarget.style.textDecoration = "underline";
              e.currentTarget.style.textUnderlineOffset = "6px";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#222";
              e.currentTarget.style.textDecoration = "none";
            }}
          >
            Seperate Test
          </Link>
        </nav>
        <div style={{ paddingTop: 70 }}>
          <Routes>
            <Route path="/window1" element={<Window1Test />} />
            <Route path="/seperate" element={<SeperateTest />} />
            <Route
              path="*"
              element={
                <div
                  style={{ color: "#222", textAlign: "center", marginTop: 40 }}
                >
                  <h2>Choose a test page above</h2>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
