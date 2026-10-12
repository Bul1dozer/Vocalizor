import { useStore } from '../store/useStore';
import { saveAssessment, savePracticeSession } from './api';

export async function syncOfflineData() {
  const { offlineQueue, clearOfflineQueue } = useStore.getState();
  if (offlineQueue.length === 0) return;
  const failed: { action: string; data: unknown }[] = [];
  for (const item of offlineQueue) {
    try {
      if (item.action === 'saveAssessment') await saveAssessment(item.data as Parameters<typeof saveAssessment>[0]);
      else if (item.action === 'savePracticeSession') await savePracticeSession(item.data as Parameters<typeof savePracticeSession>[0]);
    } catch { failed.push(item); }
  }
  if (failed.length === 0) clearOfflineQueue();
  else useStore.setState({ offlineQueue: failed });
}

export function queueOrSave(action: string, data: unknown) {
  if (!navigator.onLine) useStore.getState().addToOfflineQueue(action, data);
}

if (typeof window !== 'undefined') { window.addEventListener('online', () => { syncOfflineData(); }); }
