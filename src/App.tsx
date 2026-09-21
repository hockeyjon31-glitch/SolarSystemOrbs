/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CelestialBodyId, SurfaceMode, SurfaceFeature, ViewMode } from './types';
import { CELESTIAL_BODIES, CELESTIAL_ORDER } from './data/celestialBodies';
import { CelestialViewer } from './components/CelestialViewer';
import { ComparativeLineup } from './components/ComparativeLineup';
import { TelemetryPanel } from './components/TelemetryPanel';
import { FeatureModal } from './components/FeatureModal';
import { AudioAmbience } from './components/AudioAmbience';
import { Orbit, Eye, Columns3, PanelRightClose, PanelRightOpen, Sparkles } from 'lucide-react';

export default function App() {
  const [selectedBodyId, setSelectedBodyId] = useState<CelestialBodyId>('moon');
  const [surfaceMode, setSurfaceMode] = useState<SurfaceMode>('natural');
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [selectedFeature, setSelectedFeature] = useState<SurfaceFeature | null>(null);
  const [showTelemetryPanel, setShowTelemetryPanel] = useState(true);

  const currentBody = CELESTIAL_BODIES[selectedBodyId] || CELESTIAL_BODIES.moon;

  // Reset surface mode to natural when switching celestial bodies unless already valid
  const handleSelectBody = (id: CelestialBodyId) => {
    setSelectedBodyId(id);
    setSurfaceMode('natural');
    setSelectedFeature(null);
    if (viewMode === 'lineup') {
      setViewMode('single');
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === '1') handleSelectBody('moon');
      else if (e.key === '2') handleSelectBody('mars');
      else if (e.key === '3') handleSelectBody('venus');
      else if (e.key === '4') handleSelectBody('io');
      else if (e.key === '5') handleSelectBody('titan');
      else if (e.key.toLowerCase() === 'c') {
        setViewMode(prev => (prev === 'single' ? 'lineup' : 'single'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Main Navigation Bar */}
      <header
        id="app-header"
        className="h-16 px-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl flex items-center justify-between shrink-0 z-30 select-none"
      >
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Orbit className="text-blue-400" size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-white uppercase">
                Celestial Spheres
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                3D Explorer
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Detailed revolving models of Moon, Mars, Venus, Io &amp; Titan
            </p>
          </div>
        </div>

        {/* Center Celestial Body Selection Pills */}
        <nav
          id="celestial-body-nav"
          className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl shadow-inner overflow-x-auto no-scrollbar"
        >
          {CELESTIAL_ORDER.map(item => {
            const data = CELESTIAL_BODIES[item.id];
            const isActive = selectedBodyId === item.id && viewMode === 'single';
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => handleSelectBody(item.id as CelestialBodyId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: data.colorHex }}
                />
                <span>{data.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools: View Mode Toggle & Audio & Panel Toggle */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Single Focus vs All-5 Comparative Lineup */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              id="btn-view-single"
              onClick={() => setViewMode('single')}
              title="Inspect Single Celestial Sphere"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'single'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye size={14} />
              <span className="hidden md:inline">Solo Focus</span>
            </button>
            <button
              id="btn-view-lineup"
              onClick={() => setViewMode('lineup')}
              title="Compare all 5 revolving spheres side-by-side"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'lineup'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns3 size={14} />
              <span className="hidden md:inline">5-Sphere Lineup</span>
            </button>
          </div>

          {/* Deep Space Drone Synthesizer */}
          <AudioAmbience />

          {/* Toggle Telemetry Sidebar (in solo view) */}
          {viewMode === 'single' && (
            <button
              id="btn-toggle-telemetry-sidebar"
              onClick={() => setShowTelemetryPanel(!showTelemetryPanel)}
              title={showTelemetryPanel ? 'Hide Telemetry Panel' : 'Show Telemetry Panel'}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              {showTelemetryPanel ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex relative overflow-hidden">
        {viewMode === 'single' ? (
          <>
            {/* 3D Revolving Sphere Explorer View */}
            <section className="flex-1 h-full relative">
              <CelestialViewer
                body={currentBody}
                surfaceMode={surfaceMode}
                onSelectFeature={setSelectedFeature}
                selectedFeature={selectedFeature}
              />
            </section>

            {/* Astrophysical & Geological Telemetry Panel */}
            {showTelemetryPanel && (
              <TelemetryPanel
                body={currentBody}
                currentMode={surfaceMode}
                onModeChange={setSurfaceMode}
                onSelectFeature={feat => setSelectedFeature(feat)}
              />
            )}
          </>
        ) : (
          /* Multi-Body Comparative Lineup View */
          <section className="flex-1 h-full relative">
            <ComparativeLineup
              onSelectBody={id => {
                setSelectedBodyId(id);
                setViewMode('single');
              }}
            />
          </section>
        )}
      </main>

      {/* Surface Feature Details Modal Popup */}
      {selectedFeature && (
        <FeatureModal
          feature={selectedFeature}
          onClose={() => setSelectedFeature(null)}
        />
      )}
    </div>
  );
}
