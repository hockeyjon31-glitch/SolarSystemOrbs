import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const AudioAmbience: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscNodesRef = useRef<OscillatorNode[]>([]);

  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 3);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Low cosmic harmonic drone frequencies: 55Hz (A1), 110Hz (A2), 164.81Hz (E3)
      const freqs = [55, 110, 164.81];
      const oscs: OscillatorNode[] = [];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Low pass filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(idx === 0 ? 0.6 : 0.25, ctx.currentTime);

        osc.connect(filter);
        filter.connect(subGain);
        subGain.connect(masterGain);

        osc.start();
        oscs.push(osc);
      });

      oscNodesRef.current = oscs;
      setIsPlaying(true);
    } catch {
      // AudioContext policy
    }
  };

  const stopAudio = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 1);
      setTimeout(() => {
        oscNodesRef.current.forEach(osc => osc.stop());
        oscNodesRef.current = [];
        audioCtxRef.current?.close();
        audioCtxRef.current = null;
        setIsPlaying(false);
      }, 1000);
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  useEffect(() => {
    return () => {
      oscNodesRef.current.forEach(osc => {
        try {
          osc.stop();
        } catch {}
      });
      audioCtxRef.current?.close();
    };
  }, []);

  return (
    <button
      id="btn-toggle-ambience"
      onClick={toggleAudio}
      title={isPlaying ? 'Mute Deep Space Ambience' : 'Play Deep Space Ambient Drone'}
      className={`p-2 rounded-xl backdrop-blur-md border transition-all flex items-center gap-1.5 text-xs font-mono ${
        isPlaying
          ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
          : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-700/60'
      }`}
    >
      {isPlaying ? <Volume2 size={15} /> : <VolumeX size={15} />}
      <span className="hidden sm:inline">{isPlaying ? 'Audio On' : 'Audio Off'}</span>
    </button>
  );
};
