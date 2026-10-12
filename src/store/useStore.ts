import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, VoiceAssessment, PracticeSession, VoiceType, PitchReading } from '../types';

interface CalData { lowestFreq:number; highestFreq:number; tessituraLowFreq:number; tessituraHighFreq:number; speakingLow:number; speakingHigh:number; comfortLow:number; comfortHigh:number; stabilityScore:number; }

interface AppState {
  user: UserProfile | null; isAuthenticated: boolean; setUser: (user: UserProfile | null) => void;
  theme: 'dark' | 'light'; toggleTheme: () => void;
  currentPitch: PitchReading | null; isListening: boolean; pitchHistory: PitchReading[];
  setCurrentPitch: (r: PitchReading | null) => void; setIsListening: (l: boolean) => void;
  addPitchReading: (r: PitchReading) => void; clearPitchHistory: () => void;
  calibrationData: CalData | null; setCalibrationData: (d: CalData | null) => void;
  assessments: VoiceAssessment[]; addAssessment: (a: VoiceAssessment) => void; setAssessments: (a: VoiceAssessment[]) => void;
  practiceSessions: PracticeSession[]; addPracticeSession: (s: PracticeSession) => void; setPracticeSessions: (s: PracticeSession[]) => void;
  currentVoiceType: VoiceType | null; setCurrentVoiceType: (t: VoiceType | null) => void;
  offlineQueue: { action: string; data: unknown }[]; addToOfflineQueue: (a: string, d: unknown) => void; clearOfflineQueue: () => void;
}

export const useStore = create<AppState>()(persist((set) => ({
  user: null, isAuthenticated: false, setUser: (user) => set({ user, isAuthenticated: !!user }),
  theme: 'dark', toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  currentPitch: null, isListening: false, pitchHistory: [],
  setCurrentPitch: (r) => set({ currentPitch: r }), setIsListening: (l) => set({ isListening: l }),
  addPitchReading: (r) => set((s) => ({ pitchHistory: [...s.pitchHistory.slice(-199), r] })),
  clearPitchHistory: () => set({ pitchHistory: [] }),
  calibrationData: null, setCalibrationData: (d) => set({ calibrationData: d }),
  assessments: [], addAssessment: (a) => set((s) => ({ assessments: [a, ...s.assessments] })),
  setAssessments: (a) => set({ assessments: a }),
  practiceSessions: [], addPracticeSession: (s) => set((st) => ({ practiceSessions: [s, ...st.practiceSessions] })),
  setPracticeSessions: (s) => set({ practiceSessions: s }),
  currentVoiceType: null, setCurrentVoiceType: (t) => set({ currentVoiceType: t }),
  offlineQueue: [], addToOfflineQueue: (a, d) => set((s) => ({ offlineQueue: [...s.offlineQueue, { action: a, data: d }] })),
  clearOfflineQueue: () => set({ offlineQueue: [] }),
}), {
  name: 'voice-profile-storage',
  partialize: (s) => ({ theme:s.theme, user:s.user, assessments:s.assessments, practiceSessions:s.practiceSessions, calibrationData:s.calibrationData, currentVoiceType:s.currentVoiceType, offlineQueue:s.offlineQueue }),
}));
