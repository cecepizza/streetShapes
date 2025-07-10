import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useEffect, useMemo } from "react";

// Texture configuration for better performance and quality
const TEXTURE_PATHS = [
  "/window1_BaseColor.jpg",
  "/window1_Normal.jpg",
  "/window1_Roughness.jpg",
  "/window1_Metallic.jpg",
  "/window1_AmbientOcclusion.jpg",
  "/window1_Height.jpg",
  "/window1_Opacity.jpg",
];

function Window1() {
  const meshRef = useRef<THREE.Mesh>(null);
  // Fix: useLoader expects string[]
  const [
    colorMap,
    normalMap,
    roughnessMap,
    metalnessMap,
    aoMap,
    heightMap,
    opacityMap,
  ] = useLoader(THREE.TextureLoader, TEXTURE_PATHS as string[]);

  // Optimize texture settings for better quality and performance
  const optimizedTextures = useMemo(() => {
    const textures = [
      colorMap,
      normalMap,
      //   roughnessMap,
      metalnessMap,
      aoMap,
      heightMap,
      opacityMap,
    ];
    textures.forEach((texture) => {
      if (texture) {
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    });
    return {
      colorMap,
      normalMap,
      roughnessMap,
      metalnessMap,
      aoMap,
      heightMap,
      opacityMap,
    };
  }, [
    colorMap,
    normalMap,
    roughnessMap,
    metalnessMap,
    aoMap,
    heightMap,
    opacityMap,
  ]);

  // Set up UV2 for AO map
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

  // Optional: Add subtle rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow receiveShadow>
      {/* Increased geometry subdivisions for better displacement */}
      <boxGeometry args={[1, 1, 1, 64, 64, 64]} />
      <meshStandardMaterial
        map={optimizedTextures.colorMap}
        normalMap={optimizedTextures.normalMap}
        // normalScale={[1, 1]} // Remove or use Vector2 if needed
        roughnessMap={optimizedTextures.roughnessMap}
        roughness={0.3}
        metalnessMap={optimizedTextures.metalnessMap}
        metalness={0.1}
        aoMap={optimizedTextures.aoMap}
        aoMapIntensity={1.5}
        displacementMap={optimizedTextures.heightMap}
        displacementScale={0.02}
        alphaMap={optimizedTextures.opacityMap}
        transparent={true}
        alphaTest={0.1}
        envMapIntensity={0.8}
      />
    </mesh>
  );
}

// Enhanced lighting setup for better texture visibility
function Lighting() {
  return (
    <>
      {/* Higher ambient light to see texture details in shadows */}
      <ambientLight intensity={0.4} color="#ffffff" />
      {/* Key light - stronger and more focused */}
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.8}
        color="#ffffff"
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
      {/* Fill light - cooler tone, medium intensity */}
      <directionalLight
        position={[-6, 8, -4]}
        intensity={0.8}
        color="#88bbff"
      />
      {/* Rim light - warm accent from behind */}
      <directionalLight position={[2, 3, -8]} intensity={0.6} color="#ffbb66" />
      {/* Additional side lights for texture detail */}
      <directionalLight position={[-8, 5, 2]} intensity={0.4} color="#ffffff" />
      <directionalLight position={[8, 3, -2]} intensity={0.3} color="#ffddaa" />
      {/* Point light close to object for detail */}
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
  const { gl } = useThree();
  useEffect(() => {
    // Get WebGL context for stats
    const context = gl.getContext();
    if (context) {
      // These constants are available on the WebGLRenderingContext
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

export default function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#0a0a0a",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <Canvas
        shadows={{
          type: THREE.PCFSoftShadowMap,
          enabled: true,
        }}
        camera={{
          position: [3, 2, 5],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        <Lighting />
        <Ground />
        <Window1 />
        <Environment preset="city" background={false} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          maxPolarAngle={Math.PI / 2.2}
        />
        <PerformanceStats />
      </Canvas>
    </div>
  );
}
