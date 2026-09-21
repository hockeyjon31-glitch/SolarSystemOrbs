import React from 'react';
import { SurfaceFeature } from '../types';
import { X, MapPin, Mountain, Flame, Compass, Rocket } from 'lucide-react';

interface FeatureModalProps {
  feature: SurfaceFeature;
  onClose: () => void;
}

export const FeatureModal: React.FC<FeatureModalProps> = ({ feature, onClose }) => {
  const getIcon = () => {
    switch (feature.type) {
      case 'volcano':
        return <Flame size={16} className="text-red-400" />;
      case 'crater':
      case 'mountain':
        return <Mountain size={16} className="text-amber-400" />;
      case 'landing_site':
        return <Rocket size={16} className="text-emerald-400" />;
      default:
        return <MapPin size={16} className="text-blue-400" />;
    }
  };

  return (
    <div
      id="feature-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="feature-modal-card"
        className="w-full max-w-md bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-5 text-slate-100 relative space-y-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-feature-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 pr-8">
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/60 shrink-0">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {feature.type.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {feature.name}
            </h2>
          </div>
        </div>

        {/* Coordinate & Metric Badges */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-slate-400 text-[10px] block mb-0.5">Coordinates</span>
            <span className="text-blue-400 font-semibold">
              {feature.lat >= 0 ? `${feature.lat}° N` : `${Math.abs(feature.lat)}° S`},{' '}
              {feature.lon >= 0 ? `${feature.lon}° E` : `${Math.abs(feature.lon)}° W`}
            </span>
          </div>

          {feature.elevationOrDepth && (
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-slate-400 text-[10px] block mb-0.5">Scale / Relief</span>
              <span className="text-amber-300 font-semibold">{feature.elevationOrDepth}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5 text-xs">
          <span className="text-slate-400 font-medium">Physical Description</span>
          <p className="text-slate-200 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800">
            {feature.description}
          </p>
        </div>

        {/* Significance */}
        <div className="space-y-1 text-xs">
          <span className="text-slate-400 font-medium">Scientific Significance</span>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {feature.significance}
          </p>
        </div>

        {/* Mission Connection */}
        {feature.missionConnection && (
          <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/50 flex items-center gap-2.5 text-xs text-blue-300">
            <Rocket size={14} className="shrink-0 text-blue-400" />
            <span>{feature.missionConnection}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            id="btn-dismiss-modal"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-md"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
