import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import { useRef, useEffect, useMemo, useState } from "react";
import { CameraAndMaterialControls } from "./gui";

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

// Add prop types for Window1
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

// Add prop types for Lighting
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

function PerformanceStats() {
  return null;
}

export default function Window1Test() {
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

  const controlsRef = useRef<any>(null);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#f4f6fa",
        fontFamily: "Inter, system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <header
          style={{
            width: "100%",
            maxWidth: 900,
            margin: "0 auto",
            padding: "1.2rem 0 0.5rem 0",
            textAlign: "left",
            boxSizing: "border-box",
          }}
        >
          <h2
            style={{
              color: "#222",
              fontWeight: 700,
              fontSize: "2.1rem",
              letterSpacing: "0.01em",
              margin: 0,
              textAlign: "left",
              paddingLeft: 24,
              paddingRight: 24,
              lineHeight: 1.15,
            }}
          >
            StreetShapes
          </h2>
          <p
            style={{
              color: "#5a5a5a",
              fontSize: "1.08rem",
              margin: "10px 0 0 0",
              textAlign: "left",
              marginTop: 10,
              marginBottom: 10,
              paddingLeft: 24,
              paddingRight: 24,
              maxWidth: 520,
              lineHeight: 1.5,
            }}
          >
            visualize how real-world photo textures are mapped onto geometry
          </p>
        </header>
      </div>
      {/* Responsive styles */}
      <style>{`
        @media (max-width: 700px) {
          header {
            text-align: center !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          header h2, header p {
            text-align: center !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        }
      `}</style>
      <main
        style={{
          width: "100%",
          maxWidth: 1100,
          display: "flex",
          flexDirection: "row-reverse",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 32,
          margin: "0 auto",
          padding: "0 2vw",
          boxSizing: "border-box",
        }}
      >
        <section
          style={{
            minWidth: 320,
            maxWidth: 360,
            width: "100&",
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
          <div style={{ width: "100%", marginTop: 4 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 6,
                width: "100%",
                overflowX: "auto",
                paddingBottom: 8,
              }}
            >
              {[
                { label: "BaseColor", file: "BaseColor.jpg" },
                { label: "Normal", file: "Normal.jpg" },
                { label: "Roughness", file: "Roughness.jpg" },
                { label: "AO", file: "AmbientOcclusion.jpg" },
                { label: "Height", file: "Height.jpg" },
              ].map(({ label, file }) => (
                <div
                  key={file}
                  style={{ textAlign: "center", minWidth: 60, marginRight: 2 }}
                >
                  <img
                    src={`/window1_metallicSquare/${file}`}
                    alt={label}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: 4,
                      boxShadow: "0 1px 6px 0 rgba(0,0,0,0.08)",
                    }}
                  />
                  <div style={{ fontSize: 12, color: "#444", marginTop: 2 }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
              camera={{ position: [7, 7, 5], fov: 25, near: 0.1, far: 100 }}
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
              <Environment preset="sunset" background={false} />
              <OrbitControls
                ref={controlsRef}
                enablePan
                enableZoom
                enableRotate
              />
              <PerformanceStats />
            </Canvas>
          </div>
        </section>
      </main>
    </div>
  );
}
