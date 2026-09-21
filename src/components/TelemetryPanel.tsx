import React, { useState } from 'react';
import { CelestialBodyData, SurfaceMode, SurfaceFeature } from '../types';
import {
  Thermometer,
  Gauge,
  RotateCcw,
  Compass,
  MapPin,
  Rocket,
  Layers,
  Info,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface TelemetryPanelProps {
  body: CelestialBodyData;
  currentMode: SurfaceMode;
  onModeChange: (mode: SurfaceMode) => void;
  onSelectFeature: (feature: SurfaceFeature) => void;
}

type TabType = 'telemetry' | 'geology' | 'landmarks' | 'structure' | 'missions';

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  body,
  currentMode,
  onModeChange,
  onSelectFeature
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('telemetry');

  return (
    <aside
      id="telemetry-panel"
      className="w-full lg:w-96 h-full flex flex-col bg-slate-900/95 border-l border-slate-800 text-slate-100 backdrop-blur-xl overflow-hidden shadow-2xl z-20"
    >
      {/* Header Profile */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            {body.classification}
          </span>
          <span className="text-[11px] font-mono text-blue-400">
            {body.parentBody}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span
            className="w-3.5 h-3.5 rounded-full inline-block shadow-md"
            style={{ backgroundColor: body.colorHex }}
          />
          {body.name}
        </h1>
        <p className="text-xs text-slate-300 font-medium leading-relaxed">
          {body.subtitle}
        </p>

        {/* Surface Visualization Mode Switcher (if multiple modes exist, e.g. Venus or Titan) */}
        {body.surfaceModesAvailable.length > 1 && (
          <div className="mt-2 p-1 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 px-2 pt-1">
              Visual Surface Layer
            </span>
            <div className="grid grid-cols-2 gap-1">
              {body.surfaceModesAvailable.map(sm => (
                <button
                  key={sm.mode}
                  id={`btn-mode-${sm.mode}`}
                  onClick={() => onModeChange(sm.mode)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-all text-center ${
                    currentMode === sm.mode
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                  title={sm.description}
                >
                  {sm.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-2 overflow-x-auto no-scrollbar">
        <button
          id="tab-telemetry"
          onClick={() => setActiveTab('telemetry')}
          className={`px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'telemetry'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gauge size={13} />
          Telemetry
        </button>
        <button
          id="tab-landmarks"
          onClick={() => setActiveTab('landmarks')}
          className={`px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'landmarks'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin size={13} />
          Landmarks ({body.features.length})
        </button>
        <button
          id="tab-geology"
          onClick={() => setActiveTab('geology')}
          className={`px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'geology'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Info size={13} />
          Geology
        </button>
        <button
          id="tab-structure"
          onClick={() => setActiveTab('structure')}
          className={`px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'structure'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers size={13} />
          Interior
        </button>
        <button
          id="tab-missions"
          onClick={() => setActiveTab('missions')}
          className={`px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'missions'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Rocket size={13} />
          Missions
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* TAB 1: TELEMETRY */}
        {activeTab === 'telemetry' && (
          <div className="space-y-3.5">
            {/* Radius & Scale */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400">Equatorial Radius</span>
                <span className="font-mono font-semibold text-white">
                  {body.equatorialRadiusKm.toLocaleString()} km
                </span>
              </div>
              <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden mb-1.5">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, body.relativeRadiusEarth * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{(body.relativeRadiusEarth * 100).toFixed(1)}% of Earth</span>
                <span>Earth: 6,371 km</span>
              </div>
            </div>

            {/* Gravity */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block mb-0.5">Surface Gravity</span>
                <span className="text-slate-300 font-mono text-[11px]">
                  {(body.relativeGravityEarth * 100).toFixed(1)}% Earth gravity (1g)
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-base font-bold text-white">
                  {body.surfaceGravity}
                </span>
                <span className="text-[11px] font-mono text-slate-400 ml-1">m/s²</span>
              </div>
            </div>

            {/* Rotation & Day Period */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <RotateCcw size={13} className="text-blue-400" />
                  Rotation Period
                </span>
                {body.isRetrograde && (
                  <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Retrograde
                  </span>
                )}
              </div>
              <p className="font-mono font-medium text-white text-xs">
                {body.rotationPeriodDesc}
              </p>
            </div>

            {/* Axial Tilt & Temperature Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400 flex items-center gap-1 mb-1">
                  <Compass size={13} className="text-amber-400" />
                  Axial Tilt
                </span>
                <span className="font-mono font-bold text-base text-amber-300">
                  {body.axialTiltDeg}°
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-slate-400 flex items-center gap-1 mb-1">
                  <Thermometer size={13} className="text-rose-400" />
                  Mean Temp
                </span>
                <span className="font-mono font-bold text-base text-rose-300">
                  {body.meanTempC > 0 ? `+${body.meanTempC}` : body.meanTempC}°C
                </span>
              </div>
            </div>

            {/* Surface Pressure */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <span className="text-slate-400 block mb-1">Surface Pressure</span>
              <p className="font-mono text-white text-xs font-medium">
                {body.surfacePressureDesc}
              </p>
            </div>

            {/* Atmospheric Composition */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <span className="text-slate-300 font-semibold block">
                Atmosphere Composition
              </span>
              <div className="space-y-1.5">
                {body.atmosphericComposition.map((gas, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">{gas.gas}</span>
                    <span className="font-mono font-medium text-blue-300">
                      {gas.percentage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LANDMARKS */}
        {activeTab === 'landmarks' && (
          <div className="space-y-2.5">
            <p className="text-[11px] text-slate-400 mb-2">
              Key surface sites, volcanic calderas, impact basins, and landing locations. Click to focus:
            </p>
            {body.features.map(feat => (
              <div
                key={feat.id}
                id={`feature-card-${feat.id}`}
                onClick={() => onSelectFeature(feat)}
                className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {feat.name}
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5"
                  />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-1.5">
                  <span className="capitalize px-1.5 py-0.5 rounded bg-slate-700/70 text-slate-300">
                    {feat.type.replace('_', ' ')}
                  </span>
                  <span>
                    {feat.lat >= 0 ? `${feat.lat}°N` : `${Math.abs(feat.lat)}°S`},{' '}
                    {feat.lon >= 0 ? `${feat.lon}°E` : `${Math.abs(feat.lon)}°W`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: GEOLOGY */}
        {activeTab === 'geology' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <h3 className="font-semibold text-white mb-1.5">Summary</h3>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {body.summary}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-white text-xs">Geological Highlights</h3>
              {body.geologyHighlights.map((hl, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/40 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span className="text-slate-300 text-[11px] leading-relaxed">
                    {hl}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STRUCTURE / INTERIOR */}
        {activeTab === 'structure' && (
          <div className="space-y-3">
            <p className="text-[11px] text-slate-400">
              Concentric interior layers from outer crust to dense planetary core:
            </p>
            {body.internalLayers.map((layer, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: layer.color }}
                    />
                    {layer.name}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {layer.depth}
                  </span>
                </div>
                <div className="text-[11px] text-blue-300 font-mono">
                  {layer.composition}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {layer.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: MISSIONS */}
        {activeTab === 'missions' && (
          <div className="space-y-2.5">
            <p className="text-[11px] text-slate-400 mb-2">
              Key robotic and human exploration missions to {body.name}:
            </p>
            {body.missions.map((m, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-2.5"
              >
                <Rocket size={14} className="text-blue-400 mt-0.5 shrink-0" />
                <span className="text-slate-200 text-[11px] leading-relaxed">
                  {m}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
