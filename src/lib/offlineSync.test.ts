import { describe, it, expect, beforeEach, vi } from 'vitest';
import { queueOrSave, syncOfflineData } from './offlineSync';
import { useStore } from '../store/useStore';

beforeEach(() => {
  useStore.setState({ offlineQueue: [], user: { id: 'test-user', email: 'test@test.com', display_name: 'Test', avatar_url: null, created_at: '', updated_at: '' } });
  vi.restoreAllMocks();
});

describe('queueOrSave', () => {
  it('queues action when offline', () => {
    const onlineSpy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    queueOrSave('saveAssessment', { id: '1' });
    expect(useStore.getState().offlineQueue).toHaveLength(1);
    expect(useStore.getState().offlineQueue[0].action).toBe('saveAssessment');
    onlineSpy.mockRestore();
  });

  it('does not queue when online', () => {
    const onlineSpy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    queueOrSave('saveAssessment', { id: '1' });
    expect(useStore.getState().offlineQueue).toHaveLength(0);
    onlineSpy.mockRestore();
  });
});

describe('syncOfflineData', () => {
  it('clears queue after sync', async () => {
    useStore.getState().addToOfflineQueue('saveAssessment', { id: '1', user_id: 'test-user' });
    expect(useStore.getState().offlineQueue).toHaveLength(1);
    await syncOfflineData();
    expect(useStore.getState().offlineQueue).toHaveLength(0);
  });
});
