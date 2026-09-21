import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CELESTIAL_BODIES, CELESTIAL_ORDER } from '../data/celestialBodies';
import { CelestialBodyId } from '../types';
import { getCelestialTextures } from '../utils/textureGenerator';
import { Play, Pause, Maximize2, Scale } from 'lucide-react';

interface ComparativeLineupProps {
  onSelectBody: (id: CelestialBodyId) => void;
}

export const ComparativeLineup: React.FC<ComparativeLineupProps> = ({ onSelectBody }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sphereMeshesRef = useRef<Record<string, { group: THREE.Group; mesh: THREE.Mesh; isRetrograde: boolean }>>({});

  const [isPlaying, setIsPlaying] = useState(true);
  const [scaleMode, setScaleMode] = useState<'relative' | 'normalized'>('relative');
  const [hoveredBodyId, setHoveredBodyId] = useState<CelestialBodyId | null>(null);

  const isPlayingRef = useRef(true);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 550;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 14.5);
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
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 25;
    controls.maxPolarAngle = Math.PI / 2 + 0.2;
    controlsRef.current = controls;

    // 5. Starfield
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 200 + Math.random() * 100;
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 1.2,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.75
    });
    scene.add(new THREE.Points(starsGeo, starsMat));

    // 6. Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.4);
    dirLight.position.set(12, 10, 15);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    backLight.position.set(-10, -5, -10);
    scene.add(backLight);

    // 7. Add 5 Celestial Spheres in a row along X axis
    // Ordering: Moon, Mars, Venus, Io, Titan
    const totalBodies = CELESTIAL_ORDER.length;
    const spacing = 4.2;
    const startX = -((totalBodies - 1) * spacing) / 2;

    const meshesMap: Record<string, { group: THREE.Group; mesh: THREE.Mesh; isRetrograde: boolean }> = {};

    CELESTIAL_ORDER.forEach((item, index) => {
      const bData = CELESTIAL_BODIES[item.id];
      const posX = startX + index * spacing;

      const group = new THREE.Group();
      group.position.set(posX, 0, 0);

      // Tilt
      group.rotation.z = (bData.axialTiltDeg * Math.PI) / 180;

      // Base radius calculation
      const baseRadius = 1.35;
      const radius = scaleMode === 'relative'
        ? baseRadius * (bData.equatorialRadiusKm / 6052)
        : baseRadius;

      const textures = getCelestialTextures(bData.id, 'natural');
      const geo = new THREE.SphereGeometry(radius, 64, 64);
      const mat = new THREE.MeshStandardMaterial({
        map: textures.diffuse,
        bumpMap: textures.bump,
        bumpScale: 0.04,
        roughness: 0.82,
        metalness: 0.05
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { bodyId: bData.id };
      group.add(mesh);

      // Pedestal ring on "floor"
      const ringGeo = new THREE.RingGeometry(radius * 1.05, radius * 1.08, 36);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(bData.colorHex),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = -baseRadius * 1.3;
      group.add(ring);

      scene.add(group);
      meshesMap[bData.id] = { group, mesh, isRetrograde: bData.isRetrograde };
    });

    sphereMeshesRef.current = meshesMap;

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (isPlayingRef.current) {
        Object.values(sphereMeshesRef.current).forEach(({ mesh, isRetrograde }) => {
          const dir = isRetrograde ? -1 : 1;
          mesh.rotation.y += 0.4 * dir * delta;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObs.disconnect();
      renderer.dispose();
      starsGeo.dispose();
      starsMat.dispose();
    };
  }, [scaleMode]);

  // Click on sphere in lineup
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const meshes = Object.values(sphereMeshesRef.current).map(item => item.mesh);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      const bodyId = clickedMesh.userData.bodyId as CelestialBodyId;
      if (bodyId) {
        onSelectBody(bodyId);
      }
    }
  };

  // Mouse move to detect hovering
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const meshes = Object.values(sphereMeshesRef.current).map(item => item.mesh);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const id = intersects[0].object.userData.bodyId as CelestialBodyId;
      setHoveredBodyId(id);
    } else {
      setHoveredBodyId(null);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 select-none overflow-hidden">
      {/* 3D Canvas */}
      <div
        ref={containerRef}
        id="lineup-canvas-container"
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
      />

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <div className="px-4 py-2 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-lg">
          <h2 className="text-sm font-semibold tracking-wide text-white">Comparative Lineup</h2>
          <p className="text-[11px] text-slate-400">
            Click any revolving sphere to enter detailed single-body exploration mode
          </p>
        </div>

        {/* Scale Toggle: True Relative Scale vs Uniform Normalized */}
        <div className="flex items-center bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-1 rounded-xl shadow-lg">
          <button
            id="btn-scale-relative"
            onClick={() => setScaleMode('relative')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              scaleMode === 'relative'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale size={14} />
            <span>True Relative Scale</span>
          </button>
          <button
            id="btn-scale-normalized"
            onClick={() => setScaleMode('normalized')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              scaleMode === 'normalized'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Maximize2 size={14} />
            <span>Equalized Size</span>
          </button>
        </div>

        {/* Play / Pause */}
        <button
          id="btn-lineup-play-toggle"
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-white shadow-lg transition-all"
          title={isPlaying ? 'Pause All Revolutions' : 'Play All Revolutions'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>

      {/* Bottom Comparative Telemetry Cards across the 5 spheres */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[96%] max-w-6xl pointer-events-none">
        <div className="grid grid-cols-5 gap-2.5">
          {CELESTIAL_ORDER.map(item => {
            const data = CELESTIAL_BODIES[item.id];
            const isHovered = hoveredBodyId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectBody(item.id as CelestialBodyId)}
                className={`pointer-events-auto p-3 rounded-2xl backdrop-blur-md border transition-all cursor-pointer ${
                  isHovered
                    ? 'bg-slate-900/95 border-blue-500 shadow-xl scale-[1.03] ring-1 ring-blue-500/40'
                    : 'bg-slate-900/75 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/85'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs tracking-wide text-white flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: data.colorHex }}
                    />
                    {data.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {(data.relativeRadiusEarth * 100).toFixed(0)}% Earth
                  </span>
                </div>

                <div className="space-y-1 text-[11px] font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Radius:</span>
                    <span>{data.equatorialRadiusKm.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gravity:</span>
                    <span>{data.surfaceGravity} m/s²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rotation:</span>
                    <span className="truncate max-w-[90px]" title={data.rotationPeriodDesc}>
                      {data.isRetrograde ? 'Retrograde' : `${(data.rotationPeriodHours / 24).toFixed(1)}d`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Temp:</span>
                    <span>{data.meanTempC > 0 ? `+${data.meanTempC}` : data.meanTempC}°C</span>
                  </div>
                </div>

                <button
                  id={`btn-inspect-${item.id}`}
                  className="mt-2.5 w-full py-1 text-[11px] font-medium text-center text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-colors"
                >
                  Inspect 3D Globe →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
