// --- React Three Fiber Imports ---
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useState } from "react";
import { CameraAndMaterialControls } from "./gui";

// --- Texture Configuration ---
// Available texture options for each PBR map type
const TEXTURE_OPTIONS = {
  albedo: ["/flowersTextures/albedoOG.png", "/flowersTextures/AI_color.png"], // Base color maps
  normal: ["/flowersTextures/normalsColored.png", "/flowersTextures/normalsEmboss.png"], // Surface detail maps
  roughness: ["/flowersTextures/roughness.png"], // Surface roughness map
  ao: ["/flowersTextures/AO_depth.png"], // Ambient occlusion map
  displacement: ["/flowersTextures/displacementGrayscale.png", "/flowersTextures/Blur.png"] // Height/displacement maps
};

// --- Custom Hook: Texture Loader & Configuration ---
// Loads and configures PBR textures based on user selection
function useFlowersTextures(textureRepeat: number, textureIndices: {albedo: number, normal: number, displacement: number}) {
  // Build texture paths array based on user selections
  const texturePaths = [
    TEXTURE_OPTIONS.albedo[textureIndices.albedo], // User-selected albedo texture
    TEXTURE_OPTIONS.normal[textureIndices.normal], // User-selected normal texture
    TEXTURE_OPTIONS.roughness[0], // Only one roughness option
    TEXTURE_OPTIONS.ao[0], // Only one AO option
    TEXTURE_OPTIONS.displacement[textureIndices.displacement] // User-selected displacement texture
  ];
  
  // Load all textures using Three.js TextureLoader
  const textures = useLoader(THREE.TextureLoader, texturePaths);

  // Configure texture properties for optimal quality and tiling
  return useMemo(() => {
    textures.forEach((texture) => {
      if (texture) {
        // High-quality filtering for smooth appearance
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        
        // Enable texture repeating/tiling
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(textureRepeat, textureRepeat);
      }
    });
    return textures;
  }, [textures, textureRepeat]);
}

// --- Main Plane Component ---
// Renders a plane geometry with fully configurable PBR material
function FlowersPlane({ 
  roughness, 
  metalness, 
  aoMapIntensity, 
  displacementScale, 
  envMapIntensity, 
  normalScale,
  textureRepeat,
  textureIndices
}: {
  roughness: number;
  metalness: number;
  aoMapIntensity: number;
  displacementScale: number;
  envMapIntensity: number;
  normalScale: number;
  textureRepeat: number;
  textureIndices: {albedo: number, normal: number, displacement: number};
}) {
  // Load and configure textures based on user selections
  const textures = useFlowersTextures(textureRepeat, textureIndices);
  
  // Destructure loaded textures in the correct order
  const [
    albedoMap,      // Base color/diffuse texture
    normalMap,      // Surface detail/bump texture  
    roughnessMap,   // Surface roughness variation
    aoMap,          // Ambient occlusion (shadows in crevices)
    displacementMap // Height map for geometry displacement
  ] = textures;

  return (
    <mesh rotation={[0, 0, 0]} receiveShadow>
      {/* High-resolution plane geometry (16:9 aspect ratio) */}
      {/* args: [width, height, widthSegments, heightSegments] */}
      <planeGeometry args={[16, 9, 512, 288]} />
      
      {/* PBR Material with all texture maps */}
      <meshStandardMaterial
        map={albedoMap}                                          // Base color
        normalMap={normalMap}                                    // Surface details
        normalScale={new THREE.Vector2(normalScale, normalScale)} // Normal intensity
        roughnessMap={roughnessMap}                             // Roughness variation
        roughness={roughness}                                   // Overall roughness multiplier
        metalness={metalness}                                   // Metallic properties
        aoMap={aoMap}                                          // Ambient occlusion
        aoMapIntensity={aoMapIntensity}                        // AO strength
        displacementMap={displacementMap}                      // Height displacement
        displacementScale={displacementScale}                  // Displacement strength
        displacementBias={-0.1}                               // Displacement offset for smoother transitions
        envMapIntensity={envMapIntensity}                      // Environment reflection strength
      />
    </mesh>
  );
}

// --- Main App Component ---
export default function FlowersTest() {
  // --- Lighting Control States ---
  const [ambientIntensity, setAmbientIntensity] = useState(0.4);  // Overall ambient lighting
  const [keyIntensity, setKeyIntensity] = useState(1.5);          // Main directional light intensity
  const [keyColor, setKeyColor] = useState("#ffffff");            // Main light color
  const [fillIntensity, setFillIntensity] = useState(0.3);        // Fill light intensity
  const [rimIntensity, setRimIntensity] = useState(0);            // Rim/back light (unused)
  const [keyLightPosition, setKeyLightPosition] = useState<[number, number, number]>([10, 10, 5]); // Main light position

  // --- Material Property States ---
  const [roughness, setRoughness] = useState(0.8);               // Surface roughness (0=mirror, 1=rough)
  const [metalness, setMetalness] = useState(0.1);               // Metallic properties (0=dielectric, 1=metal)
  const [aoMapIntensity, setAoMapIntensity] = useState(1.2);      // Ambient occlusion strength
  const [displacementScale, setDisplacementScale] = useState(0.3); // Height displacement amount
  const [envMapIntensity, setEnvMapIntensity] = useState(0.5);    // Environment map reflection strength
  const [normalScale, setNormalScale] = useState(4);             // Normal map intensity
  const [alphaTest, setAlphaTest] = useState(0.1);               // Alpha cutoff threshold
  
  // --- Texture Control States ---
  const [textureRepeat, setTextureRepeat] = useState(1);          // Texture tiling amount
  const [textureIndices, setTextureIndices] = useState({          // Which textures to use
    albedo: 0,      // 0=albedoOG.png (vibrant), 1=AI_color.png (muted)
    normal: 0,      // 0=normalsColored.png, 1=normalsEmboss.png
    displacement: 0 // 0=displacementGrayscale.png, 1=Blur.png (smoother)
  });

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", display: "flex" }}>
      <div style={{ flex: 1 }}>
        {/* --- Page Title Overlay --- */}
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

        {/* --- Three.js Canvas --- */}
        <Canvas
          shadows={{ type: THREE.PCFSoftShadowMap, enabled: true }} // Soft shadow rendering
          camera={{ position: [8, 6, 8], fov: 45 }}                // Camera setup
        >
          {/* --- Lighting Setup --- */}
          <ambientLight intensity={ambientIntensity} />              {/* Soft overall lighting */}
          
          {/* Main directional light with shadows */}
          <directionalLight
            position={keyLightPosition}
            intensity={keyIntensity}
            color={keyColor}
            castShadow
            shadow-mapSize={[2048, 2048]}    // High-res shadow maps
            shadow-camera-far={50}          // Shadow camera range
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          
          {/* Fill light for softer shadows */}
          <directionalLight position={[-5, 5, -5]} intensity={fillIntensity} />

          {/* --- Main Plane with PBR Material --- */}
          <FlowersPlane 
            roughness={roughness}
            metalness={metalness}
            aoMapIntensity={aoMapIntensity}
            displacementScale={displacementScale}
            envMapIntensity={envMapIntensity}
            normalScale={normalScale}
            textureRepeat={textureRepeat}
            textureIndices={textureIndices}
          />
          
          {/* --- Environment/Background --- */}
          <Environment preset="sunset" background />                 {/* HDRI environment */}

          {/* --- Camera Controls --- */}
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            dampingFactor={0.05}             // Smooth camera movement
            enableDamping
          />
        </Canvas>
      </div>
      
      {/* --- Advanced Material Controls (Right Panel) --- */}
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
      
      {/* --- Quick Texture Controls (Bottom-Left Panel) --- */}
      <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 100, background: "rgba(0,0,0,0.8)", padding: "15px", borderRadius: "8px", minWidth: "300px" }}>
        {/* Texture tiling control */}
        <div style={{ marginBottom: "10px" }}>
          <label style={{ color: "white", fontSize: "14px" }}>Texture Repeat: </label>
          <input 
            type="range" 
            min="0.1" 
            max="5" 
            step="0.1" 
            value={textureRepeat} 
            onChange={(e) => setTextureRepeat(parseFloat(e.target.value))}
            style={{ marginLeft: "10px" }}
          />
          <span style={{ color: "white", marginLeft: "10px", fontSize: "12px" }}>{textureRepeat.toFixed(1)}</span>
        </div>
        
        {/* Albedo texture selection */}
        <div style={{ marginBottom: "8px" }}>
          <label style={{ color: "white", fontSize: "14px", marginRight: "10px" }}>Albedo:</label>
          <select value={textureIndices.albedo} onChange={(e) => setTextureIndices({...textureIndices, albedo: parseInt(e.target.value)})} style={{ fontSize: "12px" }}>
            <option value={0}>Original (albedoOG) - Vibrant</option>
            <option value={1}>AI Color - Muted</option>
          </select>
        </div>
        
        {/* Normal map selection */}
        <div style={{ marginBottom: "8px" }}>
          <label style={{ color: "white", fontSize: "14px", marginRight: "10px" }}>Normal:</label>
          <select value={textureIndices.normal} onChange={(e) => setTextureIndices({...textureIndices, normal: parseInt(e.target.value)})} style={{ fontSize: "12px" }}>
            <option value={0}>Colored</option>
            <option value={1}>Emboss</option>
          </select>
        </div>
        
        {/* Displacement map selection */}
        <div>
          <label style={{ color: "white", fontSize: "14px", marginRight: "10px" }}>Displacement:</label>
          <select value={textureIndices.displacement} onChange={(e) => setTextureIndices({...textureIndices, displacement: parseInt(e.target.value)})} style={{ fontSize: "12px" }}>
            <option value={0}>Grayscale - Sharp</option>
            <option value={1}>Blur - Smooth</option>
          </select>
        </div>
      </div>
    </div>
  );
}