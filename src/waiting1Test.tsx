import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState } from "react";
import { OBJLoader } from "three-stdlib";

// Removed CameraAndMaterialControls import and related state

function WaitingModel() {
  const meshRef = useRef<THREE.Group>(null);
  const [displacementScale, setDisplacementScale] = useState(0.03);
  const [targetDisplacement, setTargetDisplacement] = useState(0.03);
  const obj = useLoader(OBJLoader, "/models/Waiting1_.obj");
  // Load all PBR maps
  const [
    colorMap,
    normalMap,
    roughnessMap,
    metalnessMap,
    aoMap,
    heightMap,
    opacityMap,
  ] = useLoader(THREE.TextureLoader, [
    "/models/matcap-revised (1).png",
    "/waitingMaterial/waitingMaterial_Normal.jpg",
    "/waitingMaterial/waitingMaterial_Roughness.jpg",
    "/waitingMaterial/waitingMaterial_Metallic.jpg",
    "/waitingMaterial/waitingMaterial_AmbientOcclusion.jpg",
    "/waitingMaterial/waitingMaterial_Height.jpg",
    "/waitingMaterial/waitingMaterial_Opacity.jpg",
  ]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  useFrame(() => {
    // Smoothly interpolate toward the target value
    setDisplacementScale((prev) =>
      Math.abs(prev - targetDisplacement) < 0.001
        ? targetDisplacement
        : prev + (targetDisplacement - prev) * 0.1
    );
  });

  const clonedObj = obj.clone();
  clonedObj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({
        map: colorMap,
        normalMap: normalMap,
        roughnessMap: roughnessMap,
        metalnessMap: metalnessMap,
        aoMap: aoMap,
        displacementMap: heightMap,
        displacementScale,
        alphaMap: opacityMap,
        transparent: true,
        roughness: 0.4,
        metalness: 0.2,
        aoMapIntensity: 1.5,
        envMapIntensity: 1.0,
      });
      child.castShadow = true;
      child.receiveShadow = true;
      // Ensure uv2 for aoMap
      if (!child.geometry.attributes.uv2 && child.geometry.attributes.uv) {
        child.geometry.setAttribute(
          "uv2",
          new THREE.BufferAttribute(child.geometry.attributes.uv.array, 2)
        );
      }
    }
  });

  return (
    <group
      ref={meshRef}
      position={[0, 0, 0]}
      scale={[1, 1, 1]}
      onPointerOver={() => setTargetDisplacement(0.7)}
      onPointerOut={() => setTargetDisplacement(0.001)}
    >
      <primitive object={clonedObj} />
    </group>
  );
}

function Ground() {
  return (
    <>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
    </>
  );
}

export default function Waiting1Test() {
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
            Waiting Model
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
            3D model visualization with matcap material
          </p>
        </header>
      </div>
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
        {/* Removed CameraAndMaterialControls section */}
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
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Canvas
              shadows={{ type: THREE.PCFSoftShadowMap, enabled: true }}
              camera={{ position: [0, 0, 15], fov: 10, near: 0.1, far: 100 }}
              gl={{
                antialias: true,
                alpha: false,
                powerPreference: "high-performance",
              }}
            >
              {/* <Lighting
                ambientIntensity={ambientIntensity}
                keyIntensity={keyIntensity}
                keyColor={keyColor}
                fillIntensity={fillIntensity}
                rimIntensity={rimIntensity}
                keyLightPosition={keyLightPosition}
              /> */}
              {/* Add a strong back light behind the model */}
              <pointLight
                position={[0, 0.1, 0.5]}
                intensity={13}
                color="#fff8b0"
                distance={20}
                decay={2}
                castShadow={false}
              />
              <Ground />
              <WaitingModel />
              <Environment preset="sunset" background={false} />
              <OrbitControls enablePan enableZoom enableRotate />
            </Canvas>
            {/* <img
              src="/models/waiting01.png"
              alt="Overlay"
              className="overlay-img"
            /> */}
          </div>
        </section>
      </main>
    </div>
  );
}
