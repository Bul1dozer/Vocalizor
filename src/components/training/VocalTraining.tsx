import { useState, useCallback, useRef } from 'react';
import { Dumbbell, Play, Square, CheckCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getVoiceTypeExercises } from '../../audio/classifier';
import { AudioProcessor } from '../../audio/pitchDetector';
import { savePracticeSession } from '../../lib/api';
import { queueOrSave } from '../../lib/offlineSync';
import type { VoiceType, PitchReading } from '../../types';

export default function VocalTraining() {
  const { theme, currentVoiceType, user, addPracticeSession } = useStore();
  const isDark = theme === 'dark';
  const voiceType = currentVoiceType || 'Tenor';
  const exercises = getVoiceTypeExercises(voiceType);
  const [activeExercise, setActiveExercise] = useState<number|null>(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [notesHit, setNotesHit] = useState(0);
  const [notesMissed, setNotesMissed] = useState(0);
  const [stabilityReadings, setStabilityReadings] = useState<number[]>([]);
  const processorRef = useRef<AudioProcessor|null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const startPractice = useCallback(async (i:number) => {
    try { setActiveExercise(i); setIsPracticing(true); setElapsed(0); setNotesHit(0); setNotesMissed(0); setStabilityReadings([]);
      const p = new AudioProcessor(); processorRef.current = p;
      await p.start((r:PitchReading|null) => { if (r) { if (r.accuracy>50) setNotesHit(n=>n+1); else setNotesMissed(n=>n+1); setStabilityReadings(prev=>[...prev.slice(-49),r.accuracy]); } });
      timerRef.current = setInterval(() => setElapsed(s=>s+1), 1000);
    } catch { setIsPracticing(false); }
  }, []);

  const stopPractice = useCallback(() => {
    processorRef.current?.stop(); processorRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null;
    setIsPracticing(false);
    const total = notesHit+notesMissed, accuracy = total>0?(notesHit/total)*100:0;
    const avgStability = stabilityReadings.length>0 ? stabilityReadings.reduce((a,b)=>a+b,0)/stabilityReadings.length : 0;
    const session = { id:crypto.randomUUID(), user_id:user?.id||'anonymous', exercise_type:exercises[activeExercise??0]?.name||'Unknown', voice_type:voiceType as VoiceType, duration_seconds:elapsed, notes_hit:notesHit, notes_missed:notesMissed, accuracy_percentage:Math.round(accuracy*10)/10, avg_stability:Math.round(avgStability*10)/10, created_at:new Date().toISOString() };
    addPracticeSession(session);
    if (user?.id) { savePracticeSession(session); queueOrSave('savePracticeSession', session); }
  }, [notesHit,notesMissed,elapsed,stabilityReadings,activeExercise,voiceType,user,exercises,addPracticeSession]);

  const formatTime = (s:number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
      <div className="text-center">
        <h1 className={`font-[family-name:var(--font-display)] text-2xl font-bold ${isDark?'text-white':'text-gray-900'}`}>Vocal Training</h1>
        <p className={`text-sm mt-1 ${isDark?'text-gray-400':'text-gray-500'}`}>Exercises tailored for {voiceType} voice</p>
      </div>
      {isPracticing && (
        <div className={`rounded-2xl p-6 text-center transition-colors duration-300 ${isDark?'bg-gray-900 border border-primary-500/30':'bg-white border border-primary-500/30 shadow-lg'}`}>
          <div className="text-4xl font-mono font-bold text-primary-500">{formatTime(elapsed)}</div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div><div className={`text-xs ${isDark?'text-gray-500':'text-gray-400'}`}>Notes Hit</div><div className="text-lg font-bold text-green-500">{notesHit}</div></div>
            <div><div className={`text-xs ${isDark?'text-gray-500':'text-gray-400'}`}>Missed</div><div className="text-lg font-bold text-red-500">{notesMissed}</div></div>
            <div><div className={`text-xs ${isDark?'text-gray-500':'text-gray-400'}`}>Accuracy</div><div className={`text-lg font-bold ${isDark?'text-white':'text-gray-900'}`}>{notesHit+notesMissed>0?`${Math.round((notesHit/(notesHit+notesMissed))*100)}%`:'--'}</div></div>
          </div>
          <button onClick={stopPractice} className="flex items-center gap-2 mx-auto mt-4 rounded-full bg-red-500/10 text-red-500 border border-red-500/30 px-6 py-2.5 text-sm font-medium hover:bg-red-500/20 transition-colors duration-200"><Square className="w-4 h-4" /> Stop Practice</button>
        </div>
      )}
      <div className="space-y-3">
        {exercises.map((ex, i) => (
          <div key={i} className={`rounded-xl p-4 transition-colors duration-300 ${activeExercise===i&&isPracticing ? isDark?'bg-primary-900/20 border border-primary-500/30':'bg-primary-50 border border-primary-500/30' : isDark?'bg-gray-900 border border-gray-800':'bg-white border border-gray-200 shadow-sm'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2"><Dumbbell className={`w-4 h-4 ${isDark?'text-primary-400':'text-primary-600'}`} /><h3 className={`font-medium text-sm ${isDark?'text-white':'text-gray-900'}`}>{ex.name}</h3></div>
                <p className={`text-xs mt-1 ${isDark?'text-gray-500':'text-gray-400'}`}>{ex.description}</p>
                <div className={`text-xs mt-1 font-mono ${isDark?'text-gray-600':'text-gray-300'}`}>{ex.range}</div>
              </div>
              {isPracticing&&activeExercise===i ? <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" /> : (
                <button onClick={() => startPractice(i)} disabled={isPracticing} className="flex items-center gap-1 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 text-xs font-medium transition-colors duration-200 disabled:opacity-30"><Play className="w-3 h-3" /> Start</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
