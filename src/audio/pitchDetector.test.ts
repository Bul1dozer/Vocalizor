import { describe, it, expect } from 'vitest';
import { frequencyToNote, noteToFrequency, YinPitchDetector } from './pitchDetector';

describe('frequencyToNote', () => {
  it('identifies A4 (440 Hz)', () => {
    const result = frequencyToNote(440);
    expect(result.note).toBe('A');
    expect(result.octave).toBe(4);
    expect(result.accuracy).toBeGreaterThanOrEqual(95);
  });

  it('identifies C4 (261.63 Hz)', () => {
    const result = frequencyToNote(261.63);
    expect(result.note).toBe('C');
    expect(result.octave).toBe(4);
  });

  it('identifies middle C roughly', () => {
    const result = frequencyToNote(261.63);
    expect(result.octave).toBe(4);
  });

  it('returns default for zero frequency', () => {
    const result = frequencyToNote(0);
    expect(result.note).toBe('--');
    expect(result.accuracy).toBe(0);
  });

  it('returns default for negative frequency', () => {
    const result = frequencyToNote(-100);
    expect(result.note).toBe('--');
  });

  it('handles E2 (82.41 Hz)', () => {
    const result = frequencyToNote(82.41);
    expect(result.note).toBe('E');
    expect(result.octave).toBe(2);
  });

  it('accuracy decreases for off-pitch frequencies', () => {
    const exact = frequencyToNote(440);
    const off = frequencyToNote(445);
    expect(exact.accuracy).toBeGreaterThanOrEqual(off.accuracy);
  });
});

describe('noteToFrequency', () => {
  it('returns 440 for A4', () => {
    expect(noteToFrequency('A', 4)).toBeCloseTo(440, 1);
  });

  it('returns 0 for invalid note', () => {
    expect(noteToFrequency('Z', 4)).toBe(0);
  });

  it('round-trips with frequencyToNote for A4', () => {
    const { note, octave } = frequencyToNote(440);
    const freq = noteToFrequency(note, octave);
    expect(freq).toBeCloseTo(440, 1);
  });
});

function generateSineWave(frequency: number, sampleRate = 44100, bufferSize = 2048): Float32Array<ArrayBuffer> {
  const buffer = new Float32Array(bufferSize);
  for (let i = 0; i < bufferSize; i++) {
    buffer[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.5;
  }
  return buffer;
}

describe('YinPitchDetector', () => {
  it('detects A4 (440 Hz) from sine wave', () => {
    const detector = new YinPitchDetector(44100, 2048, 0.15, 0.1);
    const buffer = generateSineWave(440);
    const result = detector.detect(buffer);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.frequency).toBeCloseTo(440, -0.5);
      expect(result.note).toBe('A');
      expect(result.octave).toBe(4);
    }
  });

  it('detects C4 (261.63 Hz) from sine wave', () => {
    const detector = new YinPitchDetector(44100, 2048, 0.15, 0.1);
    const buffer = generateSineWave(261.63);
    const result = detector.detect(buffer);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.frequency).toBeCloseTo(261.63, -0.5);
    }
  });

  it('returns null for silence', () => {
    const detector = new YinPitchDetector(44100, 2048, 0.15, 0.1);
    const buffer = new Float32Array(2048);
    const result = detector.detect(buffer);
    expect(result).toBeNull();
  });

  it('returns null for buffer too small', () => {
    const detector = new YinPitchDetector(44100, 2048, 0.15, 0.1);
    const buffer = new Float32Array(100);
    const result = detector.detect(buffer);
    expect(result).toBeNull();
  });

  it('detects low bass frequencies', () => {
    const detector = new YinPitchDetector(44100, 4096, 0.15, 0.1);
    const buffer = generateSineWave(100, 44100, 4096);
    const result = detector.detect(buffer);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.frequency).toBeCloseTo(100, -0.5);
    }
  });
});
