import { useState, useCallback, useRef } from 'react';
import { Mic, MicOff, Activity } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { AudioProcessor } from '../../audio/pitchDetector';
import PitchGraph from './PitchGraph';

const NOTE_COLORS: Record<string, string> = {
  C: '#ef4444', 'C#': '#f97316', D: '#f59e0b', 'D#': '#eab308', E: '#84cc16',
  F: '#22c55e', 'F#': '#10b981', G: '#14b8a6', 'G#': '#06b6d4', A: '#3b82f6',
  'A#': '#8b5cf6', B: '#a855f7',
};

export default function PitchMonitor() {
  const { theme, currentPitch, setCurrentPitch, addPitchReading, isListening, setIsListening } = useStore();
  const isDark = theme === 'dark';
  const processorRef = useRef<AudioProcessor | null>(null);

  const startListening = useCallback(async () => {
    try {
      const p = new AudioProcessor();
      processorRef.current = p;
      await p.start((reading) => {
        if (reading) addPitchReading(reading);
        setCurrentPitch(reading);
      });
      setIsListening(true);
    } catch { }
  }, [addPitchReading, setCurrentPitch, setIsListening]);

  const stopListening = useCallback(() => {
    processorRef.current?.stop();
    processorRef.current = null;
    setIsListening(false);
    setCurrentPitch(null);
  }, [setIsListening, setCurrentPitch]);

  const noteColor = currentPitch ? NOTE_COLORS[currentPitch.note] || '#3b82f6' : '#3b82f6';

  return (
    <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
      <div className="text-center">
        <h1 className={`font-[family-name:var(--font-display)] text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Pitch Monitor</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Real-time pitch detection and visualization</p>
      </div>
      <div className={`rounded-2xl p-6 text-center transition-colors duration-300 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-lg'}`}>
        <div className="relative w-32 h-32 mx-auto">
          <div className={`absolute inset-0 rounded-full transition-all duration-150 ${isListening ? 'animate-pulse' : ''}`} style={{ backgroundColor: isListening ? `${noteColor}20` : 'transparent', border: `3px solid ${isListening ? noteColor : isDark ? '#374151' : '#d1d5db'}` }} />
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            {currentPitch ? (
              <>
                <div className="text-4xl font-bold" style={{ color: noteColor }}>{currentPitch.note}{currentPitch.octave}</div>
                <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{currentPitch.frequency.toFixed(1)} Hz</div>
              </>
            ) : <Activity className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div><div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Accuracy</div><div className={`text-lg font-bold ${currentPitch?.accuracy && currentPitch.accuracy >= 80 ? 'text-green-500' : currentPitch?.accuracy && currentPitch.accuracy >= 50 ? 'text-yellow-500' : currentPitch ? 'text-red-500' : isDark ? 'text-gray-600' : 'text-gray-300'}`}>{currentPitch ? `${currentPitch.accuracy}%` : '--'}</div></div>
          <div><div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Octave</div><div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentPitch?.octave ?? '--'}</div></div>
          <div><div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Stability</div><div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentPitch ? `${currentPitch.accuracy}%` : '--'}</div></div>
        </div>
        <div className="flex justify-center mt-6">
          <button onClick={isListening ? stopListening : startListening} className={`flex items-center gap-2 rounded-full px-8 py-3 font-medium text-sm transition-all duration-200 ${isListening ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg'}`}>
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {isListening ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>
      <div className={`rounded-2xl p-4 transition-colors duration-300 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-lg'}`}>
        <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pitch History</h3>
        <PitchGraph />
      </div>
    </div>
  );
}
