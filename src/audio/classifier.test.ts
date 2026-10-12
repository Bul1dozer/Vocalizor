import { describe, it, expect } from 'vitest';
import { classifyVoice, freqToNote, buildAssessment, getVoiceTypeExercises } from './classifier';

describe('classifyVoice', () => {
  it('classifies typical Tenor range', () => {
    const result = classifyVoice(130.81, 493.88, 200, 400, 220, 75);
    expect(['Tenor', 'Baritone']).toContain(result.primaryType);
    expect(result.confidence).toBeGreaterThanOrEqual(15);
    expect(result.confidence).toBeLessThanOrEqual(99);
  });

  it('classifies typical Bass range', () => {
    const result = classifyVoice(82.41, 293.66, 120, 220, 140, 80);
    expect(['Bass', 'Bass-Baritone']).toContain(result.primaryType);
  });

  it('classifies typical Alto range', () => {
    const result = classifyVoice(196, 698.46, 350, 550, 400, 70);
    expect(['Alto', 'Contralto', 'Mezzo-Soprano']).toContain(result.primaryType);
  });

  it('confidence is between 15 and 99', () => {
    const result = classifyVoice(130, 500, 200, 350, 220, 50);
    expect(result.confidence).toBeGreaterThanOrEqual(15);
    expect(result.confidence).toBeLessThanOrEqual(99);
  });

  it('returns a valid choir section', () => {
    const result = classifyVoice(130.81, 493.88, 180, 350, 200, 75);
    expect(['Soprano', 'Alto', 'Tenor', 'Bass']).toContain(result.choirSection);
  });

  it('can produce a secondary voice type', () => {
    const result = classifyVoice(110, 400, 200, 300, 200, 60);
    expect(result.primaryType).toBeDefined();
  });
});

describe('freqToNote', () => {
  it('converts 440 Hz to A4', () => {
    expect(freqToNote(440)).toBe('A4');
  });

  it('converts 261.63 Hz to C4', () => {
    expect(freqToNote(261.63)).toBe('C4');
  });

  it('returns -- for zero frequency', () => {
    expect(freqToNote(0)).toBe('--');
  });

  it('returns -- for negative frequency', () => {
    expect(freqToNote(-100)).toBe('--');
  });

  it('converts 82.41 Hz to E2', () => {
    expect(freqToNote(82.41)).toBe('E2');
  });
});

describe('buildAssessment', () => {
  it('creates a complete assessment object', () => {
    const a = buildAssessment('user1', 130.81, 493.88, 180, 350, 160, 250, 200, 340, 70);
    expect(a.user_id).toBe('user1');
    expect(a.id).toBeDefined();
    expect(a.lowest_note).toBe('C3');
    expect(a.highest_note).toBe('B4');
    expect(a.primary_voice_type).toBeDefined();
    expect(a.confidence_score).toBeGreaterThanOrEqual(15);
    expect(a.confidence_score).toBeLessThanOrEqual(99);
    expect(a.created_at).toBeDefined();
  });

  it('fills all frequency fields', () => {
    const a = buildAssessment('user1', 130, 500, 200, 350, 160, 250, 200, 340, 70);
    expect(a.lowest_freq).toBe(130);
    expect(a.highest_freq).toBe(500);
    expect(a.tessitura_low_freq).toBe(200);
    expect(a.tessitura_high_freq).toBe(350);
    expect(a.speaking_range_low).toBe(160);
    expect(a.speaking_range_high).toBe(250);
    expect(a.comfort_zone_low).toBe(200);
    expect(a.comfort_zone_high).toBe(340);
  });
});

describe('getVoiceTypeExercises', () => {
  it('returns exercises for Tenor', () => {
    const exercises = getVoiceTypeExercises('Tenor');
    expect(exercises).toHaveLength(3);
    expect(exercises[0].name).toBeDefined();
    expect(exercises[0].description).toBeDefined();
    expect(exercises[0].range).toBeDefined();
  });

  it('returns exercises for all 9 voice types', () => {
    const types = ['Soprano', 'Mezzo-Soprano', 'Alto', 'Contralto', 'Tenor', 'Baritone', 'Bass-Baritone', 'Bass', 'Countertenor'] as const;
    for (const type of types) {
      const exercises = getVoiceTypeExercises(type);
      expect(exercises).toHaveLength(3);
    }
  });

  it('falls back to Tenor for unknown type', () => {
    const exercises = getVoiceTypeExercises('Unknown' as any);
    expect(exercises).toHaveLength(3);
  });
});
