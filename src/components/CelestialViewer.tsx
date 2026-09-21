import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CelestialBodyData, SurfaceMode, SurfaceFeature } from '../types';
import { getCelestialTextures } from '../utils/textureGenerator';
import { Play, Pause, Compass, Layers, Sun, Eye, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface CelestialViewerProps {
  body: CelestialBodyData;
  surfaceMode: SurfaceMode;
  onSelectFeature: (feature: SurfaceFeature | null) => void;
  selectedFeature: SurfaceFeature | null;
}

export const CelestialViewer: React.FC<CelestialViewerProps> = ({
  body,
  surfaceMode,
  onSelectFeature,
  selectedFeature
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sphereGroupRef = useRef<THREE.Group | null>(null);
  const mainSphereRef = useRef<THREE.Mesh | null>(null);
  const cutawayGroupRef = useRef<THREE.Group | null>(null);
  const atmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const gridGroupRef = useRef<THREE.Group | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Animation state
  const isPlayingRef = useRef(true);
  const rotationSpeedMultiplierRef = useRef(1.0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [showTilt, setShowTilt] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showCutaway, setShowCutaway] = useState(false);
  const [lightingMode, setLightingMode] = useState<'sunlit' | 'ambient'>('sunlit');
  const [sunAngle, setSunAngle] = useState(45); // degrees

  // Keep ref updated
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    rotationSpeedMultiplierRef.current = speedMultiplier;
  }, [speedMultiplier]);

  // Convert lat/long to 3D Cartesian coordinates on sphere surface
  const latLonToVector3 = useCallback((lat: number, lon: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3.2;
    controls.maxDistance = 18;
    controls.rotateSpeed = 0.8;
    controlsRef.current = controls;

    // 5. Starfield Background
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 250 + Math.random() * 150;

      const sinPhi = Math.sin(phi);
      starPositions[i * 3] = r * sinPhi * Math.cos(theta);
      starPositions[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const colorVariance = 0.8 + Math.random() * 0.2;
      const isBlue = Math.random() > 0.85;
      const isYellow = Math.random() > 0.85;

      starColors[i * 3] = isYellow ? 1.0 : colorVariance;
      starColors[i * 3 + 1] = isBlue ? colorVariance : (isYellow ? 0.9 : colorVariance);
      starColors[i * 3 + 2] = isBlue ? 1.0 : (isYellow ? 0.6 : colorVariance);
    }

    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starsMat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: false
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 6. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.18);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.6);
    dirLight.position.set(10, 3, 8);
    scene.add(dirLight);
    directionalLightRef.current = dirLight;

    // 7. Sphere Root Group (Rotates and tilts)
    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);
    sphereGroupRef.current = sphereGroup;

    // 8. Markers & Grid Groups
    const markersGroup = new THREE.Group();
    sphereGroup.add(markersGroup);
    markersGroupRef.current = markersGroup;

    const gridGroup = new THREE.Group();
    sphereGroup.add(gridGroup);
    gridGroupRef.current = gridGroup;

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (sphereGroupRef.current && isPlayingRef.current) {
        // Venus is retrograde: rotates in reverse direction
        const dir = body.isRetrograde ? -1 : 1;
        // Base rotational velocity (radians per second)
        const rotationRate = 0.25 * rotationSpeedMultiplierRef.current * dir;
        sphereGroupRef.current.rotation.y += rotationRate * delta;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.dispose();
      starsGeo.dispose();
      starsMat.dispose();
    };
  }, [body.isRetrograde]);

  // Update Lighting when light mode or angle changes
  useEffect(() => {
    if (!directionalLightRef.current || !ambientLightRef.current) return;

    if (lightingMode === 'ambient') {
      directionalLightRef.current.intensity = 1.2;
      ambientLightRef.current.intensity = 1.0;
    } else {
      directionalLightRef.current.intensity = 2.8;
      ambientLightRef.current.intensity = 0.15;
    }

    const rad = (sunAngle * Math.PI) / 180;
    directionalLightRef.current.position.set(Math.cos(rad) * 12, 2.5, Math.sin(rad) * 12);
  }, [lightingMode, sunAngle]);

  // Update Sphere Textures & Material when body or surfaceMode changes
  useEffect(() => {
    if (!sphereGroupRef.current) return;

    const sphereRadius = 2.4;

    // Clean up previous main mesh & cutaways
    if (mainSphereRef.current) {
      sphereGroupRef.current.remove(mainSphereRef.current);
      if (mainSphereRef.current.geometry) mainSphereRef.current.geometry.dispose();
      if (mainSphereRef.current.material) {
        const mat = mainSphereRef.current.material as THREE.Material;
        mat.dispose();
      }
      mainSphereRef.current = null;
    }

    if (atmosphereMeshRef.current) {
      sphereGroupRef.current.remove(atmosphereMeshRef.current);
      atmosphereMeshRef.current.geometry.dispose();
      (atmosphereMeshRef.current.material as THREE.Material).dispose();
      atmosphereMeshRef.current = null;
    }

    if (cutawayGroupRef.current) {
      sphereGroupRef.current.remove(cutawayGroupRef.current);
      cutawayGroupRef.current = null;
    }

    // Generate/retrieve textures
    const textures = getCelestialTextures(body.id, surfaceMode);

    if (showCutaway) {
      // Build 3D Internal Cutaway with layers
      const cutawayGroup = new THREE.Group();

      // Outer crust shell (3/4 sphere slice)
      const crustGeo = new THREE.SphereGeometry(
        sphereRadius,
        64,
        64,
        0,
        Math.PI * 1.5, // 270 degree slice (quarter removed)
        0,
        Math.PI
      );

      const crustMat = new THREE.MeshStandardMaterial({
        map: textures.diffuse,
        bumpMap: textures.bump,
        bumpScale: 0.04,
        roughness: 0.85,
        metalness: 0.08,
        side: THREE.DoubleSide
      });

      const crustMesh = new THREE.Mesh(crustGeo, crustMat);
      cutawayGroup.add(crustMesh);

      // Inner concentric core layers
      body.internalLayers.forEach((layer, i) => {
        const layerR = sphereRadius * Math.max(0.2, layer.radiusPercent * 0.95);
        const layerGeo = new THREE.SphereGeometry(
          layerR,
          48,
          48,
          0,
          Math.PI * 1.5,
          0,
          Math.PI
        );
        const layerMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(layer.color),
          roughness: 0.6,
          metalness: i === body.internalLayers.length - 1 ? 0.6 : 0.1,
          side: THREE.DoubleSide
        });
        const layerMesh = new THREE.Mesh(layerGeo, layerMat);
        cutawayGroup.add(layerMesh);

        // Cross-section cut faces
        const discGeo1 = new THREE.CircleGeometry(layerR, 48, 0, Math.PI);
        const discMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(layer.color),
          side: THREE.DoubleSide,
          roughness: 0.7
        });
        const disc1 = new THREE.Mesh(discGeo1, discMat);
        disc1.rotation.y = Math.PI / 2;
        cutawayGroup.add(disc1);

        const discGeo2 = new THREE.CircleGeometry(layerR, 48, 0, Math.PI);
        const disc2 = new THREE.Mesh(discGeo2, discMat);
        disc2.rotation.x = Math.PI / 2;
        disc2.rotation.z = Math.PI / 2;
        cutawayGroup.add(disc2);
      });

      sphereGroupRef.current.add(cutawayGroup);
      cutawayGroupRef.current = cutawayGroup;
    } else {
      // Normal Complete Revolving Sphere
      const geometry = new THREE.SphereGeometry(sphereRadius, 96, 96);
      const material = new THREE.MeshStandardMaterial({
        map: textures.diffuse,
        bumpMap: textures.bump,
        bumpScale: body.id === 'venus' && surfaceMode === 'natural' ? 0.005 : 0.05,
        roughness: body.id === 'venus' && surfaceMode === 'natural' ? 0.65 : 0.88,
        metalness: 0.05
      });

      const sphereMesh = new THREE.Mesh(geometry, material);
      sphereGroupRef.current.add(sphereMesh);
      mainSphereRef.current = sphereMesh;

      // Atmospheric Glow Layer for bodies with atmospheres
      if (body.hasAtmosphereGlow && (!surfaceMode || surfaceMode === 'natural')) {
        const atmoGeo = new THREE.SphereGeometry(sphereRadius * (1 + body.atmosphereThickness), 64, 64);
        const atmoMat = new THREE.ShaderMaterial({
          vertexShader: `
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec3 vNormal;
            uniform vec3 glowColor;
            void main() {
              float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
              gl_FragColor = vec4(glowColor, intensity * 0.75);
            }
          `,
          uniforms: {
            glowColor: { value: new THREE.Color(body.glowColorHex) }
          },
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false
        });

        const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
        sphereGroupRef.current.add(atmoMesh);
        atmosphereMeshRef.current = atmoMesh;
      }
    }
  }, [body, surfaceMode, showCutaway]);

  // Update Axial Tilt
  useEffect(() => {
    if (!sphereGroupRef.current) return;
    if (showTilt) {
      // Tilt in radians (Euler Z or X axis)
      // If Venus: tilt is 177.36°
      const tiltRad = (body.axialTiltDeg * Math.PI) / 180;
      sphereGroupRef.current.rotation.z = tiltRad;
    } else {
      sphereGroupRef.current.rotation.z = 0;
    }
  }, [body.axialTiltDeg, showTilt]);

  // Update Surface Feature Markers
  useEffect(() => {
    if (!markersGroupRef.current) return;

    // Clear previous markers
    while (markersGroupRef.current.children.length > 0) {
      const child = markersGroupRef.current.children[0];
      markersGroupRef.current.remove(child);
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    }

    if (!showMarkers || showCutaway) return;

    const sphereRadius = 2.4;

    body.features.forEach(feat => {
      const pos = latLonToVector3(feat.lat, feat.lon, sphereRadius * 1.018);

      const markerGroup = new THREE.Group();
      markerGroup.position.copy(pos);

      // Pin look outward from center
      markerGroup.lookAt(pos.clone().multiplyScalar(2));

      // Color based on feature type
      let pinColor = '#38bdf8'; // crater
      if (feat.type === 'volcano') pinColor = '#ef4444';
      else if (feat.type === 'landing_site') pinColor = '#22c55e';
      else if (feat.type === 'canyon') pinColor = '#f97316';
      else if (feat.type === 'mountain') pinColor = '#eab308';
      else if (feat.type === 'sea') pinColor = '#06b6d4';

      const isSelected = selectedFeature?.id === feat.id;

      // Small 3D Pin Cylinder/Cone
      const pinStemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.16, 8);
      pinStemGeo.rotateX(Math.PI / 2);
      const pinStemMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const stem = new THREE.Mesh(pinStemGeo, pinStemMat);
      stem.position.z = 0.08;
      markerGroup.add(stem);

      // Beacon Orb
      const orbGeo = new THREE.SphereGeometry(isSelected ? 0.075 : 0.05, 16, 16);
      const orbMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(pinColor)
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.z = 0.17;
      markerGroup.add(orb);

      // Pulse ring for selected feature
      if (isSelected) {
        const ringGeo = new THREE.RingGeometry(0.09, 0.13, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(pinColor),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.z = 0.17;
        markerGroup.add(ring);
      }

      // Metadata on the group for raycasting if needed
      markerGroup.userData = { feature: feat };

      markersGroupRef.current?.add(markerGroup);
    });
  }, [body.features, showMarkers, showCutaway, selectedFeature, latLonToVector3]);

  // Update Coordinate Grid Parallels / Meridians
  useEffect(() => {
    if (!gridGroupRef.current) return;

    while (gridGroupRef.current.children.length > 0) {
      const child = gridGroupRef.current.children[0];
      gridGroupRef.current.remove(child);
      if (child instanceof THREE.Line) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    }

    if (!showGrid || showCutaway) return;

    const r = 2.415;
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.35
    });

    const equatorMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7
    });

    // Latitude Parallels (every 30 degrees)
    for (let lat = -60; lat <= 60; lat += 30) {
      const points: THREE.Vector3[] = [];
      for (let lon = 0; lon <= 360; lon += 5) {
        points.push(latLonToVector3(lat, lon - 180, r));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, lat === 0 ? equatorMat : gridMat);
      gridGroupRef.current.add(line);
    }

    // Longitude Meridians (every 45 degrees)
    for (let lon = -180; lon < 180; lon += 45) {
      const points: THREE.Vector3[] = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        points.push(latLonToVector3(lat, lon, r));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, lon === 0 ? equatorMat : gridMat);
      gridGroupRef.current.add(line);
    }
  }, [showGrid, showCutaway, latLonToVector3]);

  // Click on canvas to inspect feature pins
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || !markersGroupRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(markersGroupRef.current.children, true);

    if (intersects.length > 0) {
      let topObj: THREE.Object3D | null = intersects[0].object;
      while (topObj && !topObj.userData?.feature && topObj.parent) {
        topObj = topObj.parent;
      }
      if (topObj && topObj.userData?.feature) {
        onSelectFeature(topObj.userData.feature);
      }
    }
  };

  // Reset Camera View
  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0, 7.5);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Zoom buttons
  const handleZoom = (inwards: boolean) => {
    if (cameraRef.current && controlsRef.current) {
      const factor = inwards ? 0.8 : 1.25;
      cameraRef.current.position.multiplyScalar(factor);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col select-none overflow-hidden bg-slate-950">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        id="celestial-canvas-container"
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onClick={handleCanvasClick}
      />

      {/* Top Floating Info Bar: Celestial ID & Rotation Status */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-lg flex items-center gap-2.5">
          <div
            className="w-3.5 h-3.5 rounded-full shadow-sm"
            style={{ backgroundColor: body.colorHex }}
          />
          <div>
            <div className="text-sm font-semibold tracking-wide text-white flex items-center gap-1.5">
              {body.name}
              {body.isRetrograde && (
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                  Retrograde
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {body.rotationPeriodDesc}
            </div>
          </div>
        </div>

        {/* Axial Tilt Indicator */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-xs font-mono text-slate-300 flex items-center gap-2">
          <span className="text-slate-400">Tilt:</span>
          <span className="text-amber-400 font-bold">{body.axialTiltDeg}°</span>
        </div>
      </div>

      {/* Top Right Floating Toolbar: Camera Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 p-1 rounded-xl shadow-lg">
        <button
          id="btn-zoom-in"
          onClick={() => handleZoom(true)}
          title="Zoom In"
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ZoomIn size={16} />
        </button>
        <button
          id="btn-zoom-out"
          onClick={() => handleZoom(false)}
          title="Zoom Out"
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ZoomOut size={16} />
        </button>
        <button
          id="btn-reset-view"
          onClick={handleResetCamera}
          title="Reset Camera Orientation"
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Bottom Floating Control Deck */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 w-[95%] max-w-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-2xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        {/* Play/Pause & Speed Slider */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-toggle-revolution"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Revolution' : 'Start Revolution'}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md transition-all flex items-center justify-center active:scale-95"
          >
            {isPlaying ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
          </button>

          <div className="flex items-center gap-2 px-2 py-1 bg-slate-800/80 rounded-xl border border-slate-700/50">
            <span className="text-[11px] font-mono text-slate-400">Speed</span>
            <input
              id="slider-rotation-speed"
              type="range"
              min="0.2"
              max="4.0"
              step="0.2"
              value={speedMultiplier}
              onChange={e => setSpeedMultiplier(parseFloat(e.target.value))}
              className="w-20 accent-blue-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] font-mono text-blue-400 w-8 text-right">
              {speedMultiplier.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Feature Toggles (Tilt, Pins, Coordinates, Cutaway) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id="btn-toggle-tilt"
            onClick={() => setShowTilt(!showTilt)}
            title="Toggle Physical Axial Tilt"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
              showTilt
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-800/70 text-slate-400 border-slate-700/60 hover:text-white'
            }`}
          >
            <Compass size={14} />
            <span>Tilt</span>
          </button>

          <button
            id="btn-toggle-pins"
            onClick={() => setShowMarkers(!showMarkers)}
            title="Toggle Surface Feature Callout Pins"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
              showMarkers
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm'
                : 'bg-slate-800/70 text-slate-400 border-slate-700/60 hover:text-white'
            }`}
          >
            <Eye size={14} />
            <span>Pins</span>
          </button>

          <button
            id="btn-toggle-grid"
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Coordinate Lat/Lon Grid"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
              showGrid
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                : 'bg-slate-800/70 text-slate-400 border-slate-700/60 hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>Grid</span>
          </button>

          <button
            id="btn-toggle-cutaway"
            onClick={() => setShowCutaway(!showCutaway)}
            title="Toggle 3D Internal Structure Cutaway"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
              showCutaway
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm'
                : 'bg-slate-800/70 text-slate-400 border-slate-700/60 hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>Core Slice</span>
          </button>

          {/* Lighting Mode Selector */}
          <button
            id="btn-toggle-light"
            onClick={() => setLightingMode(lightingMode === 'sunlit' ? 'ambient' : 'sunlit')}
            title="Toggle Day/Night Sun Terminator vs Full Global Illumination"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
              lightingMode === 'sunlit'
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                : 'bg-slate-800/70 text-slate-400 border-slate-700/60 hover:text-white'
            }`}
          >
            <Sun size={14} />
            <span>{lightingMode === 'sunlit' ? 'Sun Terminator' : 'Flat Light'}</span>
          </button>
        </div>

        {/* Sun Angle Slider if in sunlit mode */}
        {lightingMode === 'sunlit' && (
          <div className="w-full flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Sun size={12} className="text-yellow-400" />
              Sun Direction
            </span>
            <div className="flex items-center gap-2">
              <input
                id="slider-sun-angle"
                type="range"
                min="0"
                max="360"
                step="5"
                value={sunAngle}
                onChange={e => setSunAngle(parseInt(e.target.value))}
                className="w-36 accent-yellow-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-yellow-400 w-8 text-right">{sunAngle}°</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
