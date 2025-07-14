import { useRef, useEffect } from "react";
import GUI from "lil-gui";

export interface CameraAndMaterialControlsProps {
  ambientIntensity: number;
  setAmbientIntensity: (v: number) => void;
  keyIntensity: number;
  setKeyIntensity: (v: number) => void;
  keyColor: string;
  setKeyColor: (v: string) => void;
  fillIntensity: number;
  setFillIntensity: (v: number) => void;
  rimIntensity: number;
  setRimIntensity: (v: number) => void;
  roughness: number;
  setRoughness: (v: number) => void;
  metalness: number;
  setMetalness: (v: number) => void;
  aoMapIntensity: number;
  setAoMapIntensity: (v: number) => void;
  displacementScale: number;
  setDisplacementScale: (v: number) => void;
  envMapIntensity: number;
  setEnvMapIntensity: (v: number) => void;
  alphaTest: number;
  setAlphaTest: (v: number) => void;
  normalScale: number;
  setNormalScale: (v: number) => void;
  minDistance: number;
  setMinDistance: (v: number) => void;
  maxDistance: number;
  setMaxDistance: (v: number) => void;
  maxPolarAngle: number;
  setMaxPolarAngle: (v: number) => void;
}

export function CameraAndMaterialControls(
  props: CameraAndMaterialControlsProps
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const guiState = useRef<any>({});
  const guiRef = useRef<GUI | null>(null);

  // Create GUI only once
  useEffect(() => {
    guiState.current = {
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
      minDistance: props.minDistance,
      maxDistance: props.maxDistance,
      maxPolarAngle: props.maxPolarAngle,
    };
    const gui = new GUI({ container: containerRef.current || undefined });
    guiRef.current = gui;
    const lightingFolder = gui.addFolder("Lighting");
    lightingFolder
      .add(guiState.current, "ambientIntensity", 0, 2, 0.01)
      .onChange(props.setAmbientIntensity);
    lightingFolder
      .add(guiState.current, "keyIntensity", 0, 4, 0.01)
      .onChange(props.setKeyIntensity);
    lightingFolder
      .addColor(guiState.current, "keyColor")
      .onChange(props.setKeyColor);
    lightingFolder
      .add(guiState.current, "fillIntensity", 0, 2, 0.01)
      .onChange(props.setFillIntensity);
    lightingFolder
      .add(guiState.current, "rimIntensity", 0, 2, 0.01)
      .onChange(props.setRimIntensity);
    lightingFolder.open();
    const materialFolder = gui.addFolder("Material");
    materialFolder
      .add(guiState.current, "roughness", 0, 1, 0.01)
      .onChange(props.setRoughness);
    materialFolder
      .add(guiState.current, "metalness", 0, 1, 0.01)
      .onChange(props.setMetalness);
    materialFolder
      .add(guiState.current, "aoMapIntensity", 0, 3, 0.01)
      .onChange(props.setAoMapIntensity);
    materialFolder
      .add(guiState.current, "displacementScale", 0, 0.1, 0.001)
      .onChange(props.setDisplacementScale);
    materialFolder
      .add(guiState.current, "envMapIntensity", 0, 2, 0.01)
      .onChange(props.setEnvMapIntensity);
    materialFolder
      .add(guiState.current, "alphaTest", 0, 1, 0.01)
      .onChange(props.setAlphaTest);
    materialFolder
      .add(guiState.current, "normalScale", 0, 3, 0.01)
      .onChange(props.setNormalScale);
    materialFolder.open();
    const cameraFolder = gui.addFolder("Camera Controls");
    cameraFolder
      .add(guiState.current, "minDistance", 1, 10, 0.1)
      .onChange(props.setMinDistance);
    cameraFolder
      .add(guiState.current, "maxDistance", 2, 20, 0.1)
      .onChange(props.setMaxDistance);
    cameraFolder
      .add(guiState.current, "maxPolarAngle", 0.1, Math.PI, 0.01)
      .onChange(props.setMaxPolarAngle);
    cameraFolder.open();
    return () => gui.destroy();
  }, []);

  // Update guiState when props change (but don't recreate GUI)
  useEffect(() => {
    if (!guiRef.current) return;
    guiState.current.ambientIntensity = props.ambientIntensity;
    guiState.current.keyIntensity = props.keyIntensity;
    guiState.current.keyColor = props.keyColor;
    guiState.current.fillIntensity = props.fillIntensity;
    guiState.current.rimIntensity = props.rimIntensity;
    guiState.current.roughness = props.roughness;
    guiState.current.metalness = props.metalness;
    guiState.current.aoMapIntensity = props.aoMapIntensity;
    guiState.current.displacementScale = props.displacementScale;
    guiState.current.envMapIntensity = props.envMapIntensity;
    guiState.current.alphaTest = props.alphaTest;
    guiState.current.normalScale = props.normalScale;
    guiState.current.minDistance = props.minDistance;
    guiState.current.maxDistance = props.maxDistance;
    guiState.current.maxPolarAngle = props.maxPolarAngle;
    // lil-gui will update the UI automatically if the value changes from the GUI, but not from React, so we force a refresh
    guiRef.current
      .controllersRecursive?.()
      .forEach((c: any) => c.updateDisplay && c.updateDisplay());
  }, [
    props.ambientIntensity,
    props.keyIntensity,
    props.keyColor,
    props.fillIntensity,
    props.rimIntensity,
    props.roughness,
    props.metalness,
    props.aoMapIntensity,
    props.displacementScale,
    props.envMapIntensity,
    props.alphaTest,
    props.normalScale,
    props.minDistance,
    props.maxDistance,
    props.maxPolarAngle,
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        minHeight: 0,
        height: "100%",
        padding: 0,
        margin: 0,
        display: "flex",
        alignItems: "stretch",
        justifyContent: "stretch",
      }}
    />
  );
}
