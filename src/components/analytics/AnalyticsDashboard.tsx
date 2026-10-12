import { useMemo } from 'react';
import { BarChart3, TrendingUp, Clock, Target } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';

export default function AnalyticsDashboard() {
  const { theme, assessments, practiceSessions } = useStore();
  const isDark = theme === 'dark';
  const rangeData = useMemo(() => assessments.slice(0,10).reverse().map((a,i) => ({ name:`#${i+1}`, range:a.highest_freq-a.lowest_freq, confidence:a.confidence_score, date:format(new Date(a.created_at),'MMM d') })), [assessments]);
  const practiceData = useMemo(() => practiceSessions.slice(0,20).reverse().map((s,i) => ({ name:`#${i+1}`, accuracy:s.accuracy_percentage, stability:s.avg_stability, duration:s.duration_seconds/60 })), [practiceSessions]);
  const totalPractice = practiceSessions.reduce((sum,s) => sum+s.duration_seconds, 0);
  const avgAccuracy = practiceSessions.length > 0 ? practiceSessions.reduce((sum,s) => sum+s.accuracy_percentage,0)/practiceSessions.length : 0;
  const latestConfidence = assessments.length > 0 ? assessments[0].confidence_score : 0;
  const latestVoiceType = assessments.length > 0 ? assessments[0].primary_voice_type : 'Not assessed';
  const stats = [
    { icon:BarChart3, label:'Voice Type', value:latestVoiceType, color:'text-primary-500' },
    { icon:Target, label:'Confidence', value:`${latestConfidence}%`, color:'text-green-500' },
    { icon:TrendingUp, label:'Avg Accuracy', value:`${avgAccuracy.toFixed(0)}%`, color:'text-amber-500' },
    { icon:Clock, label:'Practice Time', value:`${Math.round(totalPractice/60)}m`, color:'text-primary-400' },
  ];
  const ts = { contentStyle:{ backgroundColor:isDark?'#1f2937':'#fff', border:`1px solid ${isDark?'#374151':'#e5e7eb'}`, borderRadius:'8px', color:isDark?'#f3f4f6':'#111827' } };

  return (
    <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
      <div className="text-center">
        <h1 className={`font-[family-name:var(--font-display)] text-2xl font-bold ${isDark?'text-white':'text-gray-900'}`}>Analytics</h1>
        <p className={`text-sm mt-1 ${isDark?'text-gray-400':'text-gray-500'}`}>Track your vocal progress over time</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({icon:Icon,label,value,color}) => (
          <div key={label} className={`rounded-xl p-4 transition-colors duration-300 ${isDark?'bg-gray-900 border border-gray-800':'bg-white border border-gray-200 shadow-sm'}`}>
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className={`text-xs font-medium ${isDark?'text-gray-500':'text-gray-400'}`}>{label}</div>
            <div className={`text-lg font-bold ${isDark?'text-white':'text-gray-900'}`}>{value}</div>
          </div>
        ))}
      </div>
      {rangeData.length > 0 && (
        <div className={`rounded-2xl p-4 transition-colors duration-300 ${isDark?'bg-gray-900 border border-gray-800':'bg-white border border-gray-200 shadow-lg'}`}>
          <h3 className={`text-sm font-medium mb-4 ${isDark?'text-gray-400':'text-gray-500'}`}>Vocal Range History (Hz)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={rangeData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark?'#1f2937':'#f3f4f6'} />
              <XAxis dataKey="date" tick={{fontSize:11,fill:isDark?'#6b7280':'#9ca3af'}} />
              <YAxis tick={{fontSize:11,fill:isDark?'#6b7280':'#9ca3af'}} />
              <Tooltip {...ts} />
              <Area type="monotone" dataKey="range" stroke="#3b82f6" fill="rgba(59,130,246,0.1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {practiceData.length > 0 && (
        <div className={`rounded-2xl p-4 transition-colors duration-300 ${isDark?'bg-gray-900 border border-gray-800':'bg-white border border-gray-200 shadow-lg'}`}>
          <h3 className={`text-sm font-medium mb-4 ${isDark?'text-gray-400':'text-gray-500'}`}>Practice Accuracy Trends</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={practiceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark?'#1f2937':'#f3f4f6'} />
              <XAxis dataKey="name" tick={{fontSize:11,fill:isDark?'#6b7280':'#9ca3af'}} />
              <YAxis tick={{fontSize:11,fill:isDark?'#6b7280':'#9ca3af'}} domain={[0,100]} />
              <Tooltip {...ts} />
              <Bar dataKey="accuracy" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {assessments.length > 0 && (
        <div className={`rounded-2xl p-4 transition-colors duration-300 ${isDark?'bg-gray-900 border border-gray-800':'bg-white border border-gray-200 shadow-lg'}`}>
          <h3 className={`text-sm font-medium mb-4 ${isDark?'text-gray-400':'text-gray-500'}`}>Assessment History</h3>
          <div className="space-y-3">
            {assessments.slice(0,5).map(a => (
              <div key={a.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors duration-300 ${isDark?'bg-gray-800':'bg-gray-50'}`}>
                <div>
                  <div className={`text-sm font-medium ${isDark?'text-white':'text-gray-900'}`}>{a.primary_voice_type}{a.secondary_voice_type && ` / ${a.secondary_voice_type}`}</div>
                  <div className={`text-xs ${isDark?'text-gray-500':'text-gray-400'}`}>{format(new Date(a.created_at),'MMM d, yyyy')}</div>
                </div>
                <div className={`text-sm font-bold ${a.confidence_score>=80?'text-green-500':a.confidence_score>=50?'text-yellow-500':'text-red-500'}`}>{a.confidence_score}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {assessments.length===0 && practiceSessions.length===0 && (
        <div className={`text-center py-16 ${isDark?'text-gray-500':'text-gray-400'}`}>
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No data yet. Complete a calibration or practice session to see analytics.</p>
        </div>
      )}
    </div>
  );
}
