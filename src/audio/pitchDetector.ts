import { NOTE_NAMES, type PitchReading } from '../types';

const A4_FREQ = 440.0;
const NOTES_PER_OCTAVE = 12;
const C0_FREQ = A4_FREQ * Math.pow(2, -4.75);

export function frequencyToNote(freq: number): { note: string; octave: number; accuracy: number } {
  if (freq <= 0) return { note: '--', octave: 0, accuracy: 0 };
  const noteNum = NOTES_PER_OCTAVE * Math.log2(freq / C0_FREQ);
  const roundedNote = Math.round(noteNum);
  const octave = Math.floor(roundedNote / NOTES_PER_OCTAVE);
  const noteIndex = ((roundedNote % NOTES_PER_OCTAVE) + NOTES_PER_OCTAVE) % NOTES_PER_OCTAVE;
  const noteName = NOTE_NAMES[noteIndex] || '--';
  const accuracy = Math.round((1 - Math.abs(noteNum - roundedNote)) * 100);
  return { note: noteName, octave, accuracy };
}

export function noteToFrequency(note: string, octave: number): number {
  const noteIndex = NOTE_NAMES.indexOf(note as typeof NOTE_NAMES[number]);
  if (noteIndex === -1) return 0;
  return C0_FREQ * Math.pow(2, (octave * NOTES_PER_OCTAVE + noteIndex) / NOTES_PER_OCTAVE);
}

export class YinPitchDetector {
  private sampleRate: number;
  private bufferSize: number;
  private threshold: number;
  private probabilityThreshold: number;

  constructor(sampleRate = 44100, bufferSize = 2048, threshold = 0.15, probabilityThreshold = 0.1) {
    this.sampleRate = sampleRate;
    this.bufferSize = bufferSize;
    this.threshold = threshold;
    this.probabilityThreshold = probabilityThreshold;
  }

  detect(float32Array: Float32Array<ArrayBuffer>): PitchReading | null {
    const bufferSize = this.bufferSize;
    if (float32Array.length < bufferSize) return null;
    const halfBuffer = Math.floor(bufferSize / 2);
    const yinBuffer = new Float32Array(halfBuffer);
    for (let i = 0; i < halfBuffer; i++) yinBuffer[i] = 0;

    for (let tau = 0; tau < halfBuffer; tau++) {
      for (let i = 0; i < halfBuffer; i++) {
        const delta = float32Array[i] - float32Array[i + tau];
        yinBuffer[tau] += delta * delta;
      }
    }

    yinBuffer[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau < halfBuffer; tau++) {
      runningSum += yinBuffer[tau];
      yinBuffer[tau] = yinBuffer[tau] * tau / runningSum;
    }

    let tau = 2;
    while (tau < halfBuffer) {
      if (yinBuffer[tau] < this.threshold) {
        while (tau + 1 < halfBuffer && yinBuffer[tau + 1] < yinBuffer[tau]) tau++;
        break;
      }
      tau++;
    }
    if (tau >= halfBuffer) return null;

    let betterTau: number;
    const x0 = tau < 1 ? tau : tau - 1;
    const x2 = tau + 1 < halfBuffer ? tau + 1 : tau;
    if (x0 === tau) betterTau = yinBuffer[tau] <= yinBuffer[x2] ? tau : x2;
    else if (x2 === tau) betterTau = yinBuffer[tau] <= yinBuffer[x0] ? tau : x0;
    else {
      const s0 = yinBuffer[x0], s1 = yinBuffer[tau], s2 = yinBuffer[x2];
      betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
    }

    const probability = 1 - yinBuffer[tau];
    if (probability < this.probabilityThreshold) return null;
    const frequency = this.sampleRate / betterTau;
    if (frequency < 50 || frequency > 1500) return null;

    const { note, octave, accuracy } = frequencyToNote(frequency);
    return { frequency: Math.round(frequency * 100) / 100, note, octave, accuracy, timestamp: Date.now() };
  }
}

export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private detector: YinPitchDetector;
  private animFrameId: number | null = null;
  private dataArray: Float32Array<ArrayBuffer> = new Float32Array(0);
  private onPitchCallback: ((reading: PitchReading | null) => void) | null = null;
  private stabilityBuffer: PitchReading[] = [];
  private readonly STABILITY_WINDOW = 10;

  constructor() { this.detector = new YinPitchDetector(); }

  async start(onPitch: (reading: PitchReading | null) => void): Promise<void> {
    this.onPitchCallback = onPitch;
    this.audioContext = new AudioContext();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1, sampleRate: 44100 },
    });
    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 4096;
    this.analyser.smoothingTimeConstant = 0;
    this.source.connect(this.analyser);
    this.dataArray = new Float32Array(this.analyser.fftSize);
    this.detector = new YinPitchDetector(this.audioContext.sampleRate);
    this.stabilityBuffer = [];
    this.analyze();
  }

  private analyze = () => {
    if (!this.analyser || !this.dataArray) return;
    this.analyser.getFloatTimeDomainData(this.dataArray);
    const reading = this.detector.detect(this.dataArray);
    if (reading) {
      this.stabilityBuffer.push(reading);
      if (this.stabilityBuffer.length > this.STABILITY_WINDOW) this.stabilityBuffer.shift();
      reading.accuracy = this.calculateStability();
    }
    this.onPitchCallback?.(reading);
    this.animFrameId = requestAnimationFrame(this.analyze);
  };

  private calculateStability(): number {
    if (this.stabilityBuffer.length < 3) return 50;
    const freqs = this.stabilityBuffer.map(r => r.frequency);
    const mean = freqs.reduce((a, b) => a + b, 0) / freqs.length;
    const variance = freqs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / freqs.length;
    const cv = Math.sqrt(variance) / mean;
    return Math.max(0, Math.min(100, Math.round((1 - cv * 5) * 100)));
  }

  stop(): void {
    if (this.animFrameId) { cancelAnimationFrame(this.animFrameId); this.animFrameId = null; }
    if (this.source) { this.source.disconnect(); this.source = null; }
    if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); this.stream = null; }
    if (this.audioContext) { this.audioContext.close(); this.audioContext = null; }
    this.analyser = null; this.onPitchCallback = null; this.stabilityBuffer = [];
  }

  isActive(): boolean { return this.audioContext !== null && this.audioContext.state === 'running'; }
  getFrequencyData(): Float32Array {
    if (!this.analyser) return new Float32Array(0);
    const data = new Float32Array(this.analyser.frequencyBinCount);
    this.analyser.getFloatFrequencyData(data);
    return data;
  }
}
