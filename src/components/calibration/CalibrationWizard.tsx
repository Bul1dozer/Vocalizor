import { useState, useCallback, useRef } from 'react';
import { ChevronRight, ChevronLeft, Mic, MicOff, CheckCircle } from 'lucide-react';
import { AudioProcessor } from '../../audio/pitchDetector';
import { useStore } from '../../store/useStore';
import { buildAssessment } from '../../audio/classifier';
import { saveAssessment } from '../../lib/api';
import { queueOrSave } from '../../lib/offlineSync';
import { VOICE_TYPE_RANGES } from '../../types';

const STEPS = [
  { step:1, title:'Lowest Note', description:'Sing the lowest note you can sustain comfortably for 3 seconds.', instruction:'Start low and hold a steady pitch.' },
  { step:2, title:'Highest Note', description:'Sing the highest note you can sustain comfortably for 3 seconds.', instruction:'Start high and hold a steady pitch.' },
  { step:3, title:'Speaking Range', description:'Speak naturally in your comfortable speaking voice for 5 seconds.', instruction:'Read aloud or talk naturally.' },
  { step:4, title:'Singing Comfort Zone', description:'Sing in the range that feels most natural and effortless for 5 seconds.', instruction:'Sing comfortably in your favorite range.' },
  { step:5, title:'Review & Calculate', description:'Review your calibration data and calculate your voice profile.', instruction:'Verify the collected data below.' },
  { step:6, title:'Your Results', description:'Your voice has been classified.', instruction:'View your voice profile below.' },
];

export default function CalibrationWizard() {
  const { theme, user, addAssessment, setCalibrationData, setCurrentVoiceType } = useStore();
  const isDark = theme === 'dark';
  const [step, setStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const processorRef = useRef<AudioProcessor | null>(null);
  const readingsRef = useRef<number[]>([]);
  const [calibration, setCalibration] = useState({ lowestFreq:0, highestFreq:0, speakingLow:0, speakingHigh:0, comfortLow:0, comfortHigh:0 });
  const [result, setResult] = useState<ReturnType<typeof buildAssessment> | null>(null);

  const startRecording = useCallback(async () => {
    try { setError(''); readingsRef.current = []; const p = new AudioProcessor(); processorRef.current = p; await p.start((r) => { if (r) readingsRef.current.push(r.frequency); }); setIsRecording(true); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not access microphone'); }
  }, []);

  const stopRecording = useCallback(() => {
    processorRef.current?.stop(); processorRef.current = null; setIsRecording(false);
    const freqs = readingsRef.current;
    if (freqs.length < 5) { setError('Not enough data. Please try again.'); return; }
    const sorted = [...freqs].sort((a, b) => a - b);
    const p10 = sorted[Math.floor(sorted.length * 0.1)], p90 = sorted[Math.floor(sorted.length * 0.9)];
    if (step === 1) setCalibration(p => ({ ...p, lowestFreq: p10 }));
    else if (step === 2) setCalibration(p => ({ ...p, highestFreq: p90 }));
    else if (step === 3) setCalibration(p => ({ ...p, speakingLow: p10, speakingHigh: p90 }));
    else if (step === 4) setCalibration(p => ({ ...p, comfortLow: p10, comfortHigh: p90 }));
  }, [step]);

  const calculateResult = useCallback(() => {
    const tessLow = calibration.comfortLow * 1.1, tessHigh = calibration.comfortHigh * 0.9, stabilityScore = 70;
    const assessment = buildAssessment(user?.id || 'anonymous', calibration.lowestFreq, calibration.highestFreq, tessLow, tessHigh, calibration.speakingLow, calibration.speakingHigh, calibration.comfortLow, calibration.comfortHigh, stabilityScore);
    setResult(assessment); addAssessment(assessment); setCurrentVoiceType(assessment.primary_voice_type);
    setCalibrationData({ lowestFreq:calibration.lowestFreq, highestFreq:calibration.highestFreq, tessituraLowFreq:tessLow, tessituraHighFreq:tessHigh, speakingLow:calibration.speakingLow, speakingHigh:calibration.speakingHigh, comfortLow:calibration.comfortLow, comfortHigh:calibration.comfortHigh, stabilityScore });
    if (user?.id) { saveAssessment(assessment); queueOrSave('saveAssessment', assessment); }
  }, [calibration, user, addAssessment, setCalibrationData, setCurrentVoiceType]);

  const nextStep = () => { if (step === 5) calculateResult(); setStep(s => Math.min(s + 1, 6)); };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const cs = STEPS[step - 1];
  const canProceed = step === 5 ? calibration.lowestFreq > 0 && calibration.highestFreq > 0
    : step < 5 ? (step === 1 ? calibration.lowestFreq > 0 : step === 2 ? calibration.highestFreq > 0 : step === 3 ? calibration.speakingLow > 0 : step === 4 ? calibration.comfortLow > 0 : true) : true;
  const choirSection = result ? VOICE_TYPE_RANGES.find(r => r.type === result.primary_voice_type)?.choirSection : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-[fade-in_0.4s_ease-out]">
      <div className="text-center">
        <h1 className={`font-[family-name:var(--font-display)] text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Voice Calibration</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Guided wizard to discover your voice profile</p>
      </div>
      <div className="flex items-center gap-2 px-4">
        {STEPS.slice(0,5).map((s, i) => (
          <div key={s.step} className="flex-1 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${step > s.step ? 'bg-green-500 text-white' : step === s.step ? 'bg-primary-600 text-white' : isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-400'}`}>
              {step > s.step ? <CheckCircle className="w-4 h-4" /> : s.step}
            </div>
            {i < 4 && <div className={`flex-1 h-0.5 rounded transition-colors duration-300 ${step > s.step ? 'bg-green-500' : isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
      <div className={`rounded-2xl p-6 transition-colors duration-300 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-lg'}`}>
        <div className="text-center mb-6">
          <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>Step {cs.step} of 6</div>
          <h2 className={`font-[family-name:var(--font-display)] text-xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{cs.title}</h2>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{cs.description}</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{cs.instruction}</p>
        </div>
        {error && <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-sm text-red-500 mb-4">{error}</div>}
        {step <= 4 && (
          <div className="flex justify-center">
            <button onClick={isRecording ? stopRecording : startRecording} className={`flex items-center gap-2 rounded-full px-8 py-3 font-medium text-sm transition-all duration-200 ${isRecording ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 animate-pulse' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg'}`}>
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
          </div>
        )}
        {step === 5 && (
          <div className={`rounded-xl p-4 space-y-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            {[['Lowest Note', calibration.lowestFreq > 0 ? `${calibration.lowestFreq.toFixed(1)} Hz` : 'Not recorded'],
              ['Highest Note', calibration.highestFreq > 0 ? `${calibration.highestFreq.toFixed(1)} Hz` : 'Not recorded'],
              ['Speaking Range', calibration.speakingLow > 0 ? `${calibration.speakingLow.toFixed(0)} - ${calibration.speakingHigh.toFixed(0)} Hz` : 'Not recorded'],
              ['Comfort Zone', calibration.comfortLow > 0 ? `${calibration.comfortLow.toFixed(0)} - ${calibration.comfortHigh.toFixed(0)} Hz` : 'Not recorded'],
            ].map(([l,v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{l}</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{v}</span>
              </div>
            ))}
          </div>
        )}
        {step === 6 && result && (
          <div className="space-y-4 animate-[slide-up_0.5s_ease-out]">
            <div className="text-center">
              <div className="text-4xl font-[family-name:var(--font-display)] font-bold text-primary-500">{result.primary_voice_type}</div>
              {result.secondary_voice_type && <div className={`text-lg mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Secondary: {result.secondary_voice_type}</div>}
              <div className="mt-3"><span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold ${result.confidence_score >= 80 ? 'bg-green-500/10 text-green-500' : result.confidence_score >= 50 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>Confidence: {result.confidence_score}%</span></div>
            </div>
            <div className={`rounded-xl p-4 space-y-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              {[['Range', `${result.lowest_note} - ${result.highest_note}`], ['Tessitura', `${result.tessitura_low} - ${result.tessitura_high}`], ['Choir Section', choirSection || 'Tenor']].map(([l,v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{l}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <button onClick={prevStep} disabled={step === 1} className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 disabled:opacity-30 ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        {step < 6 && (
          <button onClick={nextStep} disabled={!canProceed} className="flex items-center gap-1 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-sm font-medium transition-colors duration-200 disabled:opacity-50">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
