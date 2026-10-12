import { supabase } from './supabase';
import type { VoiceAssessment, PracticeSession, ChoirSection, VoiceType } from '../types';

export async function saveAssessment(a: VoiceAssessment): Promise<boolean> {
  const { error } = await supabase.from('voice_assessments').insert({
    id: a.id, user_id: a.user_id, lowest_note: a.lowest_note, highest_note: a.highest_note,
    lowest_freq: a.lowest_freq, highest_freq: a.highest_freq, tessitura_low: a.tessitura_low, tessitura_high: a.tessitura_high,
    tessitura_low_freq: a.tessitura_low_freq, tessitura_high_freq: a.tessitura_high_freq,
    speaking_range_low: a.speaking_range_low, speaking_range_high: a.speaking_range_high,
    comfort_zone_low: a.comfort_zone_low, comfort_zone_high: a.comfort_zone_high,
    average_pitch: a.average_pitch, stability_score: a.stability_score,
    primary_voice_type: a.primary_voice_type, secondary_voice_type: a.secondary_voice_type,
    confidence_score: a.confidence_score, created_at: a.created_at,
  });
  return !error;
}

export async function fetchAssessments(userId: string): Promise<VoiceAssessment[]> {
  const { data, error } = await supabase.from('voice_assessments').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) return [];
  return data as VoiceAssessment[];
}

export async function savePracticeSession(s: PracticeSession): Promise<boolean> {
  const { error } = await supabase.from('practice_sessions').insert({
    id: s.id, user_id: s.user_id, exercise_type: s.exercise_type, voice_type: s.voice_type,
    duration_seconds: s.duration_seconds, notes_hit: s.notes_hit, notes_missed: s.notes_missed,
    accuracy_percentage: s.accuracy_percentage, avg_stability: s.avg_stability, created_at: s.created_at,
  });
  return !error;
}

export async function fetchPracticeSessions(userId: string): Promise<PracticeSession[]> {
  const { data, error } = await supabase.from('practice_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) return [];
  return data as PracticeSession[];
}

export async function updateProfile(userId: string, updates: { display_name?: string }): Promise<boolean> {
  const { error } = await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', userId);
  return !error;
}

export async function createChoir(name: string, adminUserId: string): Promise<{ id: string; name: string; admin_user_id: string; created_at: string } | null> {
  const { data, error } = await supabase.from('choir_groups').insert({ name, admin_user_id: adminUserId }).select().single();
  if (error) return null;
  return data as { id: string; name: string; admin_user_id: string; created_at: string };
}

export async function fetchChoirs(userId: string): Promise<{ id: string; name: string; admin_user_id: string; created_at: string }[]> {
  const { data, error } = await supabase.from('choir_groups').select('*').eq('admin_user_id', userId).order('created_at', { ascending: false });
  if (error) return [];
  return data as { id: string; name: string; admin_user_id: string; created_at: string }[];
}

export async function addChoirMember(choirId: string, userId: string, section: ChoirSection, voiceType: VoiceType, confidenceScore: number): Promise<boolean> {
  const { error } = await supabase.from('choir_members').insert({ choir_id: choirId, user_id: userId, section, voice_type: voiceType, confidence_score: confidenceScore });
  return !error;
}

export async function fetchChoirMembers(choirId: string): Promise<{ id: string; section: ChoirSection; voice_type: VoiceType; confidence_score: number; user_id: string; profiles?: { display_name: string | null; email: string } | null }[]> {
  const { data, error } = await supabase.from('choir_members').select('id, section, voice_type, confidence_score, user_id, profiles(display_name, email)').eq('choir_id', choirId);
  if (error) return [];
  return data as unknown as { id: string; section: ChoirSection; voice_type: VoiceType; confidence_score: number; user_id: string; profiles?: { display_name: string | null; email: string } | null }[];
}
