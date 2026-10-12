export interface UserProfile {
  id: string; email: string; display_name: string | null; avatar_url: string | null;
  created_at: string; updated_at: string;
}
export interface VoiceAssessment {
  id: string; user_id: string; lowest_note: string; highest_note: string;
  lowest_freq: number; highest_freq: number; tessitura_low: string; tessitura_high: string;
  tessitura_low_freq: number; tessitura_high_freq: number; speaking_range_low: number; speaking_range_high: number;
  comfort_zone_low: number; comfort_zone_high: number; average_pitch: number; stability_score: number;
  primary_voice_type: VoiceType; secondary_voice_type: VoiceType | null; confidence_score: number; created_at: string;
}
export interface PracticeSession {
  id: string; user_id: string; exercise_type: string; voice_type: VoiceType;
  duration_seconds: number; notes_hit: number; notes_missed: number;
  accuracy_percentage: number; avg_stability: number; created_at: string;
}
export interface ChoirGroup { id: string; name: string; admin_user_id: string; created_at: string; }
export interface ChoirMember { id: string; choir_id: string; user_id: string; section: ChoirSection; voice_type: VoiceType; confidence_score: number; joined_at: string; }
export type VoiceType = 'Soprano'|'Mezzo-Soprano'|'Alto'|'Contralto'|'Tenor'|'Baritone'|'Bass-Baritone'|'Bass'|'Countertenor';
export type ChoirSection = 'Soprano'|'Alto'|'Tenor'|'Bass';
export interface PitchReading { frequency: number; note: string; octave: number; accuracy: number; timestamp: number; }
export const VOICE_TYPES: VoiceType[] = ['Soprano','Mezzo-Soprano','Alto','Contralto','Tenor','Baritone','Bass-Baritone','Bass','Countertenor'];
export const CHOIR_SECTIONS: ChoirSection[] = ['Soprano','Alto','Tenor','Bass'];
export const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as const;
export interface VoiceTypeRange { type: VoiceType; lowFreq: number; highFreq: number; lowNote: string; highNote: string; choirSection: ChoirSection; }
export const VOICE_TYPE_RANGES: VoiceTypeRange[] = [
  { type:'Soprano', lowFreq:261.63, highFreq:1046.50, lowNote:'C4', highNote:'C6', choirSection:'Soprano' },
  { type:'Mezzo-Soprano', lowFreq:220.00, highFreq:880.00, lowNote:'A3', highNote:'A5', choirSection:'Alto' },
  { type:'Alto', lowFreq:196.00, highFreq:698.46, lowNote:'G3', highNote:'F5', choirSection:'Alto' },
  { type:'Contralto', lowFreq:174.61, highFreq:587.33, lowNote:'F3', highNote:'D5', choirSection:'Alto' },
  { type:'Countertenor', lowFreq:261.63, highFreq:783.99, lowNote:'C4', highNote:'G5', choirSection:'Alto' },
  { type:'Tenor', lowFreq:130.81, highFreq:493.88, lowNote:'C3', highNote:'B4', choirSection:'Tenor' },
  { type:'Baritone', lowFreq:110.00, highFreq:392.00, lowNote:'A2', highNote:'G4', choirSection:'Bass' },
  { type:'Bass-Baritone', lowFreq:98.00, highFreq:349.23, lowNote:'G2', highNote:'F4', choirSection:'Bass' },
  { type:'Bass', lowFreq:82.41, highFreq:293.66, lowNote:'E2', highNote:'D4', choirSection:'Bass' },
];
