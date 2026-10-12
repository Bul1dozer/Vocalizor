import { describe, it, expect } from 'vitest';
import { VOICE_TYPES, VOICE_TYPE_RANGES, CHOIR_SECTIONS, NOTE_NAMES } from './index';

describe('VOICE_TYPES', () => {
  it('contains all 9 voice types', () => {
    expect(VOICE_TYPES).toHaveLength(9);
    expect(VOICE_TYPES).toContain('Soprano');
    expect(VOICE_TYPES).toContain('Mezzo-Soprano');
    expect(VOICE_TYPES).toContain('Alto');
    expect(VOICE_TYPES).toContain('Contralto');
    expect(VOICE_TYPES).toContain('Tenor');
    expect(VOICE_TYPES).toContain('Baritone');
    expect(VOICE_TYPES).toContain('Bass-Baritone');
    expect(VOICE_TYPES).toContain('Bass');
    expect(VOICE_TYPES).toContain('Countertenor');
  });
});

describe('VOICE_TYPE_RANGES', () => {
  it('has entries for all 9 voice types', () => {
    const types = VOICE_TYPE_RANGES.map(r => r.type);
    expect(types).toHaveLength(9);
    for (const vt of VOICE_TYPES) {
      expect(types).toContain(vt);
    }
  });

  it('each range has valid frequency bounds', () => {
    for (const range of VOICE_TYPE_RANGES) {
      expect(range.lowFreq).toBeGreaterThan(0);
      expect(range.highFreq).toBeGreaterThan(range.lowFreq);
      expect(range.lowNote).toBeTruthy();
      expect(range.highNote).toBeTruthy();
    }
  });

  it('each range has a valid choir section', () => {
    for (const range of VOICE_TYPE_RANGES) {
      expect(CHOIR_SECTIONS).toContain(range.choirSection);
    }
  });
});

describe('CHOIR_SECTIONS', () => {
  it('contains SATB sections', () => {
    expect(CHOIR_SECTIONS).toEqual(['Soprano', 'Alto', 'Tenor', 'Bass']);
  });
});

describe('NOTE_NAMES', () => {
  it('contains 12 notes', () => {
    expect(NOTE_NAMES).toHaveLength(12);
  });

  it('starts with C', () => {
    expect(NOTE_NAMES[0]).toBe('C');
  });
});
