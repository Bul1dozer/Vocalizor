import '@testing-library/jest-dom/vitest';

Object.defineProperty(globalThis, 'AudioContext', {
  writable: true,
  value: class AudioContext {
    state = 'running';
    sampleRate = 44100;
    createAnalyser() {
      return {
        fftSize: 0,
        smoothingTimeConstant: 0,
        frequencyBinCount: 1024,
        getFloatTimeDomainData() {},
        getFloatFrequencyData() {},
        connect() {},
        disconnect() {},
      } as unknown as AnalyserNode;
    }
    createMediaStreamSource() {
      return { connect() {}, disconnect() {} } as unknown as MediaStreamAudioSourceNode;
    }
    close() { this.state = 'closed'; }
  },
});

Object.defineProperty(globalThis.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: async () => ({
      getTracks: () => [{ stop() {} }],
    }),
  },
});

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  value: class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
});

Object.defineProperty(globalThis.window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return false; },
  }),
});

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });
