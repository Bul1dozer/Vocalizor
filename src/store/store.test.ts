import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';

beforeEach(() => {
  useStore.setState({
    user: null,
    theme: 'dark',
    currentPitch: null,
    pitchHistory: [],
    calibrationData: null,
    assessments: [],
    practiceSessions: [],
    currentVoiceType: null,
    offlineQueue: [],
  });
});

describe('useStore', () => {
  it('initializes with default state', () => {
    const state = useStore.getState();
    expect(state.theme).toBe('dark');
    expect(state.user).toBeNull();
    expect(state.assessments).toEqual([]);
    expect(state.practiceSessions).toEqual([]);
  });

  it('toggles theme', () => {
    const { toggleTheme } = useStore.getState();
    toggleTheme();
    expect(useStore.getState().theme).toBe('light');
    toggleTheme();
    expect(useStore.getState().theme).toBe('dark');
  });

  it('sets user', () => {
    const user = { id: '1', email: 'test@test.com', display_name: 'Test', avatar_url: null, created_at: '', updated_at: '' };
    useStore.getState().setUser(user);
    expect(useStore.getState().user).toEqual(user);
  });

  it('adds assessment and sets current voice type', () => {
    const assessment = {
      id: 'a1', user_id: '1', lowest_note: 'C3', highest_note: 'B4',
      lowest_freq: 130.81, highest_freq: 493.88, tessitura_low: 'F3', tessitura_high: 'F4',
      tessitura_low_freq: 180, tessitura_high_freq: 350, speaking_range_low: 160,
      speaking_range_high: 250, comfort_zone_low: 200, comfort_zone_high: 340,
      average_pitch: 265, stability_score: 70, primary_voice_type: 'Tenor' as const,
      secondary_voice_type: null, confidence_score: 85, created_at: new Date().toISOString(),
    };
    useStore.getState().addAssessment(assessment);
    useStore.getState().setCurrentVoiceType(assessment.primary_voice_type);
    const state = useStore.getState();
    expect(state.assessments).toHaveLength(1);
    expect(state.currentVoiceType).toBe('Tenor');
  });

  it('adds practice session', () => {
    const session = {
      id: 's1', user_id: '1', exercise_type: 'Scales', voice_type: 'Tenor' as const,
      duration_seconds: 120, notes_hit: 50, notes_missed: 10,
      accuracy_percentage: 83.3, avg_stability: 75, created_at: new Date().toISOString(),
    };
    useStore.getState().addPracticeSession(session);
    expect(useStore.getState().practiceSessions).toHaveLength(1);
  });

  it('updates pitch history and limits to 200 entries', () => {
    const reading = { frequency: 440, note: 'A', octave: 4, accuracy: 95, timestamp: Date.now() };
    for (let i = 0; i < 250; i++) {
      useStore.getState().addPitchReading({ ...reading, timestamp: Date.now() + i });
    }
    expect(useStore.getState().pitchHistory.length).toBeLessThanOrEqual(200);
  });

  it('enqueues offline actions', () => {
    useStore.getState().addToOfflineQueue('save', { test: true });
    expect(useStore.getState().offlineQueue).toHaveLength(1);
  });

  it('clears offline queue', () => {
    useStore.getState().addToOfflineQueue('save', {});
    useStore.getState().clearOfflineQueue();
    expect(useStore.getState().offlineQueue).toHaveLength(0);
  });

  it('sets calibration data', () => {
    const data = { lowestFreq: 130, highestFreq: 500, tessituraLowFreq: 200, tessituraHighFreq: 350, speakingLow: 160, speakingHigh: 250, comfortLow: 200, comfortHigh: 340, stabilityScore: 70 };
    useStore.getState().setCalibrationData(data);
    expect(useStore.getState().calibrationData).toEqual(data);
  });
});
