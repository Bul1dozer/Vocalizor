import { useState } from 'react';
import { User, LogOut, Save } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile } from '../../lib/api';

export default function ProfilePage() {
  const { theme, user, currentVoiceType, assessments, practiceSessions } = useStore();
  const { signOut } = useAuth();
  const isDark = theme === 'dark';
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!user?.id) return;
    setSaving(true);
    const ok = await updateProfile(user.id, { display_name: displayName });
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  }

  const a = assessments[0];
  const totalPractice = practiceSessions.reduce((sum,s) => sum+s.duration_seconds, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-[fade-in_0.4s_ease-out]">
      <div className="text-center">
        <h1 className={`font-[family-name:var(--font-display)] text-2xl font-bold ${isDark?'text-white':'text-gray-900'}`}>Profile</h1>
        <p className={`text-sm mt-1 ${isDark?'text-gray-400':'text-gray-500'}`}>Manage your account and voice profile</p>
      </div>
      <div className={`rounded-2xl p-6 transition-colors duration-300 ${isDark?'bg-gray-900 border border-gray-800':'bg-white border border-gray-200 shadow-lg'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark?'bg-primary-600/20':'bg-primary-50'}`}><User className="w-8 h-8 text-primary-500" /></div>
          <div className="flex-1">
            <label className={`text-xs font-medium ${isDark?'text-gray-500':'text-gray-400'}`}>Display Name</label>
            <input type="text" value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Enter your name" className={`w-full rounded-lg px-3 py-1.5 text-sm border mt-0.5 transition-colors duration-200 ${isDark?'bg-gray-800 border-gray-700 text-white':'bg-white border-gray-300 text-gray-900'}`} />
            <div className={`text-xs mt-1 ${isDark?'text-gray-500':'text-gray-400'}`}>{user?.email||'No email'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-sm font-medium transition-colors duration-200 disabled:opacity-50"><Save className="w-3.5 h-3.5" />{saved?'Saved!':saving?'Saving...':'Save Changes'}</button>
        </div>
      </div>
      <div className={`rounded-2xl p-6 transition-colors duration-300 ${isDark?'bg-gray-900 border border-gray-800':'bg-white border border-gray-200 shadow-lg'}`}>
        <h2 className={`font-[family-name:var(--font-display)] text-lg font-bold mb-4 ${isDark?'text-white':'text-gray-900'}`}>Voice Profile</h2>
        {a ? (
          <div className="grid grid-cols-2 gap-3">
            {[['Voice Type', currentVoiceType||a.primary_voice_type], ['Confidence', `${a.confidence_score}%`], ['Range', `${a.lowest_note} - ${a.highest_note}`], ['Practice Time', `${Math.round(totalPractice/60)} min`]].map(([l,v]) => (
              <div key={l} className={`rounded-xl p-3 transition-colors duration-300 ${isDark?'bg-gray-800':'bg-gray-50'}`}>
                <div className={`text-xs ${isDark?'text-gray-500':'text-gray-400'}`}>{l}</div>
                <div className={`text-sm font-bold ${isDark?'text-white':'text-gray-900'}`}>{v}</div>
              </div>
            ))}
          </div>
        ) : <p className={`text-sm ${isDark?'text-gray-500':'text-gray-400'}`}>No voice profile yet. Complete the calibration wizard to get started.</p>}
      </div>
      <button onClick={signOut} className={`flex items-center gap-2 w-full rounded-xl p-3 text-sm font-medium transition-colors duration-200 ${isDark?'bg-gray-900 border border-gray-800 text-gray-400 hover:bg-gray-800':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'}`}><LogOut className="w-4 h-4" /> Sign Out</button>
    </div>
  );
}
