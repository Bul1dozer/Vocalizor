import type { VoiceType, ChoirSection, VoiceAssessment } from '../types';
import { VOICE_TYPE_RANGES } from '../types';

export interface ClassificationResult { primaryType: VoiceType; secondaryType: VoiceType | null; confidence: number; choirSection: ChoirSection; }

export function classifyVoice(
  lowestFreq: number, highestFreq: number, tessituraLowFreq: number, tessituraHighFreq: number,
  speakingRangeAvg: number, stabilityScore: number
): ClassificationResult {
  const tessituraMid = (tessituraLowFreq + tessituraHighFreq) / 2;
  const scores: { type: VoiceType; score: number; range: typeof VOICE_TYPE_RANGES[number] }[] = [];

  for (const range of VOICE_TYPE_RANGES) {
    let score = 0;
    const overlapLow = Math.max(lowestFreq, range.lowFreq);
    const overlapHigh = Math.min(highestFreq, range.highFreq);
    const rangeSpan = highestFreq - lowestFreq;
    const rangeOverlap = overlapHigh > overlapLow ? (overlapHigh - overlapLow) / (range.highFreq - range.lowFreq) : 0;
    const singerOverlap = overlapHigh > overlapLow && rangeSpan > 0 ? (overlapHigh - overlapLow) / rangeSpan : 0;
    score += rangeOverlap * 20 + singerOverlap * 20;
    const rangeMid = (range.lowFreq + range.highFreq) / 2;
    score += Math.max(0, 25 - Math.abs(tessituraMid - rangeMid) / rangeMid * 50);
    score += Math.max(0, 20 - Math.abs(speakingRangeAvg - rangeMid) / rangeMid * 40);
    score += (stabilityScore / 100) * 15;
    scores.push({ type: range.type, score, range });
  }

  scores.sort((a, b) => b.score - a.score);
  const primary = scores[0];
  const secondary = scores.length > 1 && scores[1].score > primary.score * 0.6 ? scores[1] : null;

  let confidence = Math.min(99, Math.round((primary.score / 100) * 100));
  if (secondary) {
    const gap = primary.score - secondary.score;
    confidence = Math.min(99, Math.round(confidence * (0.5 + gap / primary.score)));
  }
  confidence = Math.max(15, confidence);

  return { primaryType: primary.type, secondaryType: secondary?.type ?? null, confidence, choirSection: primary.range.choirSection };
}

export function freqToNote(freq: number): string {
  if (freq <= 0) return '--';
  const noteNum = 12 * Math.log2(freq / 440) + 69;
  const rounded = Math.round(noteNum);
  const octave = Math.floor(rounded / 12) - 1;
  const noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  return `${noteNames[((rounded % 12) + 12) % 12]}${octave}`;
}

export function buildAssessment(
  userId: string, lowestFreq: number, highestFreq: number,
  tessituraLowFreq: number, tessituraHighFreq: number,
  speakingLow: number, speakingHigh: number, comfortLow: number, comfortHigh: number,
  stabilityScore: number
): VoiceAssessment {
  const avgPitch = (tessituraLowFreq + tessituraHighFreq) / 2;
  const classification = classifyVoice(lowestFreq, highestFreq, tessituraLowFreq, tessituraHighFreq, (speakingLow + speakingHigh) / 2, stabilityScore);
  return {
    id: crypto.randomUUID(), user_id: userId,
    lowest_note: freqToNote(lowestFreq), highest_note: freqToNote(highestFreq),
    lowest_freq: lowestFreq, highest_freq: highestFreq,
    tessitura_low: freqToNote(tessituraLowFreq), tessitura_high: freqToNote(tessituraHighFreq),
    tessitura_low_freq: tessituraLowFreq, tessitura_high_freq: tessituraHighFreq,
    speaking_range_low: speakingLow, speaking_range_high: speakingHigh,
    comfort_zone_low: comfortLow, comfort_zone_high: comfortHigh,
    average_pitch: avgPitch, stability_score: stabilityScore,
    primary_voice_type: classification.primaryType, secondary_voice_type: classification.secondaryType,
    confidence_score: classification.confidence, created_at: new Date().toISOString(),
  };
}

export function getVoiceTypeExercises(voiceType: VoiceType): { name: string; description: string; range: string }[] {
  const exercises: Record<VoiceType, { name: string; description: string; range: string }[]> = {
    'Bass': [
      { name: 'Low Register Warm-up', description: 'Gentle humming in your lowest comfortable range', range: 'E2 - G3' },
      { name: 'Chest Voice Foundation', description: 'Sustained tones in chest voice', range: 'G2 - C4' },
      { name: 'Deep Resonance Drill', description: 'Lip trills focusing on vocal fold closure', range: 'E2 - E3' },
    ],
    'Bass-Baritone': [
      { name: 'Lower-Mid Bridge', description: 'Smooth transitions between low and mid register', range: 'G2 - F4' },
      { name: 'Resonance Balancing', description: 'Humming with focus on even tone', range: 'A2 - D4' },
      { name: 'Chest Voice Expansion', description: 'Gradual range extension exercises', range: 'G2 - Eb4' },
    ],
    'Baritone': [
      { name: 'Mid-Register Flow', description: 'Scales in comfortable mid-range', range: 'A2 - G4' },
      { name: 'Passaggio Training', description: 'Smooth bridge across the break', range: 'B2 - F4' },
      { name: 'Mixed Voice Building', description: 'Exercises connecting chest and head voice', range: 'A2 - Ab4' },
    ],
    'Tenor': [
      { name: 'Upper Chest Development', description: 'Building strength in upper chest voice', range: 'C3 - G4' },
      { name: 'Mixed Register Smoothness', description: 'Seamless transitions through passaggio', range: 'D3 - B4' },
      { name: 'Head Voice Expansion', description: 'Extending and strengthening head voice', range: 'C3 - C5' },
    ],
    'Countertenor': [
      { name: 'Falsetto Foundation', description: 'Building consistent falsetto control', range: 'C4 - G5' },
      { name: 'Register Isolation', description: 'Switching between chest and falsetto cleanly', range: 'C3 - E5' },
      { name: 'Upper Range Extension', description: 'Gently extending upper falsetto range', range: 'E4 - A5' },
    ],
    'Alto': [
      { name: 'Lower Register Warm-up', description: 'Gentle exercises in lower range', range: 'G3 - E5' },
      { name: 'Chest-Head Balance', description: 'Even tone across registers', range: 'F3 - F5' },
      { name: 'Mid-Range Agility', description: 'Quick scales in comfortable zone', range: 'G3 - D5' },
    ],
    'Contralto': [
      { name: 'Deep Tone Development', description: 'Building richness in lower register', range: 'F3 - D5' },
      { name: 'Chest Voice Strength', description: 'Sustained tones with power', range: 'E3 - C5' },
      { name: 'Lower Bridge Work', description: 'Smooth transitions in lower passaggio', range: 'F3 - B4' },
    ],
    'Mezzo-Soprano': [
      { name: 'Mid-Register Flexibility', description: 'Agile exercises in the middle voice', range: 'A3 - A5' },
      { name: 'Upper-Mid Expansion', description: 'Building strength approaching upper range', range: 'G3 - G5' },
      { name: 'Dynamic Control', description: 'Soft-to-loud exercises across range', range: 'A3 - F5' },
    ],
    'Soprano': [
      { name: 'Upper Register Brilliance', description: 'Exercises for clear, resonant high notes', range: 'C4 - C6' },
      { name: 'Head Voice Development', description: 'Strengthening and refining head voice', range: 'C4 - A5' },
      { name: 'Agility Drills', description: 'Fast runs and scales in upper range', range: 'E4 - C6' },
    ],
  };
  return exercises[voiceType] || exercises['Tenor'];
}
