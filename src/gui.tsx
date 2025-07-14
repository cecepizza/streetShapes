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
  keyLightPosition: [number, number, number];
  setKeyLightPosition: (v: [number, number, number]) => void;
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
      keyLightPosition: [...props.keyLightPosition],
    };
    const gui = new GUI({ container: containerRef.current || undefined });
    guiRef.current = gui;
    const lightingFolder = gui.addFolder("Lighting");
    lightingFolder
      .add(guiState.current, "ambientIntensity", 0, 10, 0.01)
      .onChange(props.setAmbientIntensity);
    lightingFolder
      .add(guiState.current, "keyIntensity", 0, 20, 0.01)
      .onChange(props.setKeyIntensity);
    lightingFolder
      .addColor(guiState.current, "keyColor")
      .onChange(props.setKeyColor);
    lightingFolder
      .add(guiState.current, "fillIntensity", 0, 10, 0.01)
      .onChange(props.setFillIntensity);
    lightingFolder
      .add(guiState.current, "rimIntensity", 0, 10, 0.01)
      .onChange(props.setRimIntensity);
    // Add key light position controls
    lightingFolder
      .add(
        {
          get x() {
            return props.keyLightPosition[0];
          },
          set x(v) {
            props.setKeyLightPosition([
              v,
              props.keyLightPosition[1],
              props.keyLightPosition[2],
            ]);
          },
        },
        "x",
        -30,
        30,
        0.1
      )
      .name("keyLightX");
    lightingFolder
      .add(
        {
          get y() {
            return props.keyLightPosition[1];
          },
          set y(v) {
            props.setKeyLightPosition([
              props.keyLightPosition[0],
              v,
              props.keyLightPosition[2],
            ]);
          },
        },
        "y",
        -30,
        30,
        0.1
      )
      .name("keyLightY");
    lightingFolder
      .add(
        {
          get z() {
            return props.keyLightPosition[2];
          },
          set z(v) {
            props.setKeyLightPosition([
              props.keyLightPosition[0],
              props.keyLightPosition[1],
              v,
            ]);
          },
        },
        "z",
        -30,
        30,
        0.1
      )
      .name("keyLightZ");
    lightingFolder.open();
    const materialFolder = gui.addFolder("Material");
    materialFolder
      .add(guiState.current, "roughness", 0, 5, 0.01)
      .onChange(props.setRoughness);
    materialFolder
      .add(guiState.current, "metalness", 0, 5, 0.01)
      .onChange(props.setMetalness);
    materialFolder
      .add(guiState.current, "aoMapIntensity", 0, 10, 0.01)
      .onChange(props.setAoMapIntensity);
    materialFolder
      .add(guiState.current, "displacementScale", 0, 0.5, 0.001)
      .onChange(props.setDisplacementScale);
    materialFolder
      .add(guiState.current, "envMapIntensity", 0, 10, 0.01)
      .onChange(props.setEnvMapIntensity);

    materialFolder
      .add(guiState.current, "normalScale", 0, 10, 0.01)
      .onChange(props.setNormalScale);
    materialFolder.open();
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
    // Force update of all controllers
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
    props.keyLightPosition[0],
    props.keyLightPosition[1],
    props.keyLightPosition[2],
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "auto",
        maxWidth: 340,
        minHeight: 0,
        height: "auto",
        padding: "1.5rem 1.2rem 1.2rem 1.2rem",
        margin: "1.5rem auto",
        color: "gray",
        borderRadius: 16,
        boxShadow: "0 2px 16px 0 rgba(0,0,0,0.07)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflow: "auto",
      }}
    />
  );
}
