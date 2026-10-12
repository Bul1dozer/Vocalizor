import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { createChoir, fetchChoirs, fetchChoirMembers, addChoirMember } from '../../lib/api';
import type { ChoirSection, VoiceType } from '../../types';

interface ChoirData { id:string; name:string; admin_user_id:string; created_at:string; }
interface MemberData { id:string; section:ChoirSection; voice_type:string; confidence_score:number; user_id:string; profiles?:{ display_name:string|null; email:string }|null; }

export default function ChoirMode() {
  const { theme, user } = useStore();
  const isDark = theme === 'dark';
  const [choirs, setChoirs] = useState<ChoirData[]>([]);
  const [selectedChoir, setSelectedChoir] = useState<ChoirData|null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberSection, setMemberSection] = useState<ChoirSection>('Tenor');
  const [memberVoiceType, setMemberVoiceType] = useState<VoiceType>('Tenor');
  const [memberConfidence, setMemberConfidence] = useState(75);

  const loadChoirs = useCallback(async () => { if (!user?.id) return; const d = await fetchChoirs(user.id); setChoirs(d as ChoirData[]); }, [user?.id]);
  const loadMembers = useCallback(async (id:string) => { const d = await fetchChoirMembers(id); setMembers(d as MemberData[]); }, []);
  useEffect(() => { loadChoirs(); }, [loadChoirs]);
  useEffect(() => { if (selectedChoir) loadMembers(selectedChoir.id); }, [selectedChoir, loadMembers]);

  async function handleCreateChoir() { if (!user?.id||!newName.trim()) return; const c = await createChoir(newName.trim(),user.id); if (c) { setShowCreate(false); setNewName(''); await loadChoirs(); setSelectedChoir(c as ChoirData); } }
  async function handleAddMember() { if (!selectedChoir||!memberEmail.trim()) return; await addChoirMember(selectedChoir.id,crypto.randomUUID(),memberSection,memberVoiceType,memberConfidence); setShowAddMember(false); setMemberEmail(''); await loadMembers(selectedChoir.id); }
  const sectionCounts = members.reduce<Record<string,number>>((acc,m) => { acc[m.section]=(acc[m.section]||0)+1; return acc; }, {});

  return (
    <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
      <div className="text-center">
        <h1 className={`font-[family-name:var(--font-display)] text-2xl font-bold ${isDark?'text-white':'text-gray-900'}`}>Choir Mode</h1>
        <p className={`text-sm mt-1 ${isDark?'text-gray-400':'text-gray-500'}`}>Manage singers, run assessments, and group sections</p>
      </div>
      <div className="flex justify-center">
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors duration-200"><Plus className="w-4 h-4" /> Create Choir</button>
      </div>
      {showCreate && (
        <div className={`rounded-2xl p-4 transition-colors duration-300 ${isDark?'bg-gray-900 border border-gray-800':'bg-white border border-gray-200 shadow-lg'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-medium ${isDark?'text-white':'text-gray-900'}`}>New Choir</h3>
            <button onClick={() => setShowCreate(false)} className={isDark?'text-gray-500 hover:text-gray-300':'text-gray-400 hover:text-gray-600'}><X className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-2">
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Choir name" className={`flex-1 rounded-lg px-3 py-2 text-sm border transition-colors duration-200 ${isDark?'bg-gray-800 border-gray-700 text-white':'bg-white border-gray-300 text-gray-900'}`} />
            <button onClick={handleCreateChoir} className="rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-sm font-medium transition-colors duration-200">Create</button>
          </div>
        </div>
      )}
      {choirs.length > 0 && !selectedChoir && (
        <div className="space-y-3">
          {choirs.map(c => (
            <button key={c.id} onClick={() => setSelectedChoir(c)} className={`w-full text-left rounded-xl p-4 transition-colors duration-200 ${isDark?'bg-gray-900 border border-gray-800 hover:border-gray-700':'bg-white border border-gray-200 hover:border-gray-300 shadow-sm'}`}>
              <div className={`font-medium ${isDark?'text-white':'text-gray-900'}`}>{c.name}</div>
              <div className={`text-xs mt-1 ${isDark?'text-gray-500':'text-gray-400'}`}>Created {new Date(c.created_at).toLocaleDateString()}</div>
            </button>
          ))}
        </div>
      )}
      {selectedChoir && (
        <div className="space-y-4">
          <button onClick={() => setSelectedChoir(null)} className={`text-sm transition-colors duration-200 ${isDark?'text-primary-400 hover:text-primary-300':'text-primary-600 hover:text-primary-700'}`}>&larr; Back to choirs</button>
          <h2 className={`font-[family-name:var(--font-display)] text-xl font-bold ${isDark?'text-white':'text-gray-900'}`}>{selectedChoir.name}</h2>
          <div className="grid grid-cols-4 gap-3">
            {(['Soprano','Alto','Tenor','Bass'] as ChoirSection[]).map(section => (
              <div key={section} className={`rounded-xl p-3 text-center transition-colors duration-300 ${isDark?'bg-gray-900 border border-gray-800':'bg-white border border-gray-200 shadow-sm'}`}>
                <div className={`text-xs font-medium ${isDark?'text-gray-500':'text-gray-400'}`}>{section}</div>
                <div className={`text-xl font-bold ${isDark?'text-white':'text-gray-900'}`}>{sectionCounts[section]||0}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setShowAddMember(true)} className="flex items-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-sm font-medium transition-colors duration-200"><Plus className="w-4 h-4" /> Add Singer</button>
          {showAddMember && (
            <div className={`rounded-2xl p-4 space-y-3 transition-colors duration-300 ${isDark?'bg-gray-900 border border-gray-800':'bg-white border border-gray-200 shadow-lg'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-medium ${isDark?'text-white':'text-gray-900'}`}>Add Singer</h3>
                <button onClick={() => setShowAddMember(false)} className={isDark?'text-gray-500 hover:text-gray-300':'text-gray-400 hover:text-gray-600'}><X className="w-4 h-4" /></button>
              </div>
              <input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} placeholder="Singer email" className={`w-full rounded-lg px-3 py-2 text-sm border transition-colors duration-200 ${isDark?'bg-gray-800 border-gray-700 text-white':'bg-white border-gray-300 text-gray-900'}`} />
              <div className="grid grid-cols-2 gap-3">
                <select value={memberSection} onChange={e => setMemberSection(e.target.value as ChoirSection)} className={`rounded-lg px-3 py-2 text-sm border transition-colors duration-200 ${isDark?'bg-gray-800 border-gray-700 text-white':'bg-white border-gray-300 text-gray-900'}`}>
                  {(['Soprano','Alto','Tenor','Bass'] as ChoirSection[]).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={memberVoiceType} onChange={e => setMemberVoiceType(e.target.value as VoiceType)} className={`rounded-lg px-3 py-2 text-sm border transition-colors duration-200 ${isDark?'bg-gray-800 border-gray-700 text-white':'bg-white border-gray-300 text-gray-900'}`}>
                  {['Soprano','Mezzo-Soprano','Alto','Contralto','Countertenor','Tenor','Baritone','Bass-Baritone','Bass'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div><label className={`text-xs font-medium ${isDark?'text-gray-400':'text-gray-500'}`}>Confidence: {memberConfidence}%</label><input type="range" min={0} max={100} value={memberConfidence} onChange={e => setMemberConfidence(Number(e.target.value))} className="w-full mt-1" /></div>
              <button onClick={handleAddMember} className="w-full rounded-lg bg-primary-600 hover:bg-primary-700 text-white py-2 text-sm font-medium transition-colors duration-200">Add to Choir</button>
            </div>
          )}
          {members.length > 0 && <div className="space-y-2">{members.map(m => (
            <div key={m.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors duration-300 ${isDark?'bg-gray-900 border border-gray-800':'bg-white border border-gray-200 shadow-sm'}`}>
              <div><div className={`text-sm font-medium ${isDark?'text-white':'text-gray-900'}`}>{m.profiles?.display_name||m.profiles?.email||'Unknown Singer'}</div><div className={`text-xs ${isDark?'text-gray-500':'text-gray-400'}`}>{m.voice_type} - {m.section}</div></div>
              <div className={`text-sm font-bold ${m.confidence_score>=80?'text-green-500':m.confidence_score>=50?'text-yellow-500':'text-red-500'}`}>{m.confidence_score}%</div>
            </div>
          ))}</div>}
          {members.length === 0 && <div className={`text-center py-8 ${isDark?'text-gray-500':'text-gray-400'}`}><Users className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No singers yet. Add your first singer above.</p></div>}
        </div>
      )}
      {choirs.length===0 && !showCreate && <div className={`text-center py-16 ${isDark?'text-gray-500':'text-gray-400'}`}><Users className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="text-sm">No choirs created yet. Create your first choir to get started.</p></div>}
    </div>
  );
}
