import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState, useEffect, useMemo } from "react";
import { OBJLoader } from "three-stdlib";

// Removed CameraAndMaterialControls import and related state

function WaitingModel() {
  const meshRef = useRef<THREE.Group>(null);
  const [displacementScale, setDisplacementScale] = useState(0.03);
  const [targetDisplacement, setTargetDisplacement] = useState(0.03);
  const obj = useLoader(OBJLoader, "/models/Waiting1_.obj");

  // Load all PBR maps
  const [colorMap, normalMap, roughnessMap, metalnessMap, aoMap, heightMap] =
    useLoader(THREE.TextureLoader, [
      "/waitingMaterial/painterTest/DefaultMaterial_Base_color.jpg",
      "/waitingMaterial/painterTest/DefaultMaterial_Normal.jpg",
      "/waitingMaterial/painterTest/DefaultMaterial_Roughness.jpg",
      "/waitingMaterial/painterTest/DefaultMaterial_Metallic.jpg",
      "/waitingMaterial/painterTest/DefaultMaterial_Mixed_AO.jpg",
      "/waitingMaterial/painterTest/DefaultMaterial_Height.jpg",
    ]);

  // Configure textures
  useMemo(() => {
    [colorMap, normalMap, roughnessMap, metalnessMap, aoMap, heightMap].forEach(
      (texture) => {
        if (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = true;
          texture.flipY = false; // OBJ models often need this
        }
      }
    );

    // Debug: log texture loading
    console.log("Textures loaded:", {
      colorMap: colorMap?.image?.src,
      hasColorMap: !!colorMap,
      textureSize: colorMap
        ? `${colorMap.image.width}x${colorMap.image.height}`
        : "none",
    });
  }, [colorMap, normalMap, roughnessMap, metalnessMap, aoMap, heightMap]);

  // Create material and apply to model
  const clonedObj = useMemo(() => {
    const cloned = obj.clone();

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Ensure UV2 for AO map
        if (!child.geometry.attributes.uv2 && child.geometry.attributes.uv) {
          child.geometry.setAttribute(
            "uv2",
            new THREE.BufferAttribute(child.geometry.attributes.uv.array, 2)
          );
        }

        child.material = new THREE.MeshStandardMaterial({
          map: colorMap,
          normalMap: normalMap,
          normalScale: new THREE.Vector2(1, 1),
          roughnessMap: roughnessMap,
          roughness: 1.0,
          metalnessMap: metalnessMap,
          metalness: 1.5,
          aoMap: aoMap,
          aoMapIntensity: 2.0,
          displacementMap: heightMap,
          displacementScale: 0.1,
          envMapIntensity: 1.0,
        });

        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return cloned;
  }, [obj, colorMap, normalMap, roughnessMap, metalnessMap, aoMap, heightMap]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  useFrame(() => {
    setDisplacementScale((prev) =>
      Math.abs(prev - targetDisplacement) < 0.001
        ? targetDisplacement
        : prev + (targetDisplacement - prev) * 0.1
    );
  });

  // Update displacement scale on material
  useEffect(() => {
    clonedObj.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        child.material.displacementScale = displacementScale;
      }
    });
  }, [displacementScale, clonedObj]);

  return (
    <group
      ref={meshRef}
      position={[0, 0, 0]}
      scale={[1, 1, 1]}
      onPointerOver={() => setTargetDisplacement(55)}
      onPointerOut={() => setTargetDisplacement(0.001)}
    >
      <primitive object={clonedObj} />
    </group>
  );
}

function ReferenceImage({
  inverted = false,
  position = [0, 0, 0.4] as [number, number, number],
}: {
  inverted?: boolean;
  position?: [number, number, number];
}) {
  const texture = useLoader(THREE.TextureLoader, "/models/waiting01.png");

  useMemo(() => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
    }
  }, [texture]);

  return (
    <mesh position={position} rotation={[0, 0, 0]}>
      <planeGeometry args={[1.92, 1.92]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={1}
        onBeforeCompile={
          inverted
            ? (shader) => {
                shader.fragmentShader = shader.fragmentShader.replace(
                  "#include <map_fragment>",
                  `
              #include <map_fragment>
              if (diffuseColor.a > 0.0) {
                diffuseColor.rgb = 1.0 - diffuseColor.rgb;
              }
            `
                );
              }
            : undefined
        }
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// function Ground() {
//   return (
//     <>
//       <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
//         <planeGeometry args={[10, 10]} />
//         <meshStandardMaterial
//           color="#1a1a1a"
//           roughness={0.9}
//           metalness={0.05}
//         />
//       </mesh>
//     </>
//   );
// }

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
              {/* Improved lighting setup for PBR materials */}
              <ambientLight intensity={0.3} color="#ffffff" />

              {/* Key light - main directional light */}
              <directionalLight
                position={[5, 8, 3]}
                intensity={2.5}
                color="#ffffff"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={20}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
                shadow-bias={-0.0001}
                shadow-normalBias={0.01}
              />

              {/* Fill light - softer light from opposite side */}
              <directionalLight
                position={[-3, 4, -2]}
                intensity={1.2}
                color="#b8d4ff"
              />

              {/* Rim light - highlight edges and surface details */}
              <directionalLight
                position={[2, 2, -5]}
                intensity={1.8}
                color="#fff2cc"
              />

              {/* Additional accent lights for texture detail */}
              <pointLight
                position={[3, 3, 3]}
                intensity={1.5}
                color="#ffffff"
                distance={15}
                decay={2}
              />

              <pointLight
                position={[-2, 1, 4]}
                intensity={1.0}
                color="#ffcc99"
                distance={12}
                decay={2}
              />
              {/* <Ground /> */}
              <ReferenceImage inverted={true} position={[0, 0, 0.4]} />
              <group scale={[0.5, 0.5, 0.5]}>
                <ReferenceImage inverted={false} position={[3, 0, 0.4]} />
              </group>
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
