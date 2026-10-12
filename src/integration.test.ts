import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './store/useStore';
import { buildAssessment } from './audio/classifier';

beforeEach(() => {
  useStore.setState({
    user: { id: 'test-user', email: 'test@test.com', display_name: 'Test', avatar_url: null, created_at: '', updated_at: '' },
    assessments: [],
    practiceSessions: [],
    currentVoiceType: null,
    calibrationData: null,
    offlineQueue: [],
  });
});

describe('Calibration flow integration', () => {
  it('builds assessment and updates store', () => {
    const assessment = buildAssessment('test-user', 130.81, 493.88, 180, 350, 160, 250, 200, 340, 70);
    useStore.getState().addAssessment(assessment);
    useStore.getState().setCurrentVoiceType(assessment.primary_voice_type);
    useStore.getState().setCalibrationData({
      lowestFreq: 130.81, highestFreq: 493.88, tessituraLowFreq: 180, tessituraHighFreq: 350,
      speakingLow: 160, speakingHigh: 250, comfortLow: 200, comfortHigh: 340, stabilityScore: 70,
    });

    const state = useStore.getState();
    expect(state.assessments).toHaveLength(1);
    expect(state.currentVoiceType).toBe(assessment.primary_voice_type);
    expect(state.calibrationData).not.toBeNull();
  });

  it('multiple assessments accumulate and latest is first', () => {
    const a1 = buildAssessment('test-user', 130, 500, 200, 350, 160, 250, 200, 340, 70);
    const a2 = buildAssessment('test-user', 82, 400, 150, 300, 120, 200, 160, 280, 80);
    useStore.getState().addAssessment(a1);
    useStore.getState().addAssessment(a2);

    const state = useStore.getState();
    expect(state.assessments).toHaveLength(2);
    expect(state.assessments[0].id).toBe(a2.id);
  });

  it('practice session is added and persisted in store', () => {
    const session = {
      id: 'ps1', user_id: 'test-user', exercise_type: 'Scales', voice_type: 'Tenor' as const,
      duration_seconds: 180, notes_hit: 80, notes_missed: 15,
      accuracy_percentage: 84.2, avg_stability: 78, created_at: new Date().toISOString(),
    };
    useStore.getState().addPracticeSession(session);
    expect(useStore.getState().practiceSessions).toHaveLength(1);
    expect(useStore.getState().practiceSessions[0].id).toBe('ps1');
  });
});
