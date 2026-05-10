import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { format, subDays, startOfToday } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'motion/react';
import { Activity, Brain, Moon, Zap, Sparkles } from 'lucide-react';

export function Analysis() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const sevenDaysAgo = format(subDays(startOfToday(), 7), 'yyyy-MM-dd');
    const q = query(
      collection(db, 'users', user.uid, 'entries'),
      where('date', '>=', sevenDaysAgo),
      orderBy('date', 'asc'),
      limit(7)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEntries(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const analysisData = entries.map(e => ({
    name: format(new Date(e.date), 'EEE'),
    müdigkeit: ((e.noon?.tiredness || 0) + (e.evening?.tiredness || 0)) / (e.noon && e.evening ? 2 : 1) || 0,
    energie: e.morning?.energy || 0,
    anstrengung: e.evening?.strenuousness || 0,
    erholung: e.morning?.recovery || 0,
    mood: e.evening?.mood || e.morning?.mood || 0,
  }));

  const smileys = ['', '😞', '🙁', '😐', '🙂', '😊'];
  const avgEnergy = entries.reduce((acc, curr) => acc + (curr.morning?.energy || 0), 0) / (entries.filter(e => e.morning?.energy).length || 1);
  const avgTiredness = entries.reduce((acc, curr) => acc + (curr.noon?.tiredness || 0) + (curr.evening?.tiredness || 0), 0) / (entries.filter(e => e.noon?.tiredness || e.evening?.tiredness).length || 1);

  if (loading) return <div className="text-center py-24 text-natural-muted animate-pulse font-serif italic">Analyse wird erstellt...</div>;

  return (
    <div className="space-y-12 pb-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1 bg-natural-evening/20 border border-[#EBD6C5] rounded-full text-[10px] font-black uppercase tracking-widest text-[#B37F5A]">
          <Sparkles size={12} />
          Wöchentlicher Report
        </div>
        <h1 className="text-5xl md:text-6xl font-serif text-[#5C634D] lowercase">deine erkenntnisse.</h1>
        <p className="text-natural-muted font-light max-w-lg italic">Verstehe die Zusammenhänge deines Wohlbefindens durch Datenvisualisierung.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Ø Energie" value={avgEnergy.toFixed(1)} icon={Zap} color="bg-natural-morning text-natural-accent" />
        <StatCard label="Ø Müdigkeit" value={avgTiredness.toFixed(1)} icon={Moon} color="bg-natural-noon text-natural-accent" />
        <StatCard label="Aktivität" value={entries.length.toString()} icon={Activity} color="bg-natural-evening text-[#B37F5A]" />
        <StatCard label="Fokus-Zustand" value={avgEnergy > 6 ? 'Klar' : 'Ruhig'} icon={Brain} color="bg-white text-natural-muted border border-[#E5E5DC]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white p-10 md:p-14 rounded-[4rem] border border-[#E5E5DC] shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-natural-muted">Wochen-Rhythmus</h3>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-2 text-natural-accent"><div className="w-2.5 h-2.5 rounded-full bg-natural-accent"/> Vitalität</span>
              <span className="flex items-center gap-2 text-[#EBD6C5]"><div className="w-2.5 h-2.5 rounded-full bg-[#EBD6C5]"/> Intensität</span>
            </div>
          </div>

          <div className="h-[400px] -ml-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysisData} barGap={14}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8F8F4" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#A8A89A', fontWeight: 700 }} 
                  dy={20}
                />
                <YAxis hide domain={[0, 10]} />
                <Tooltip 
                  cursor={{ fill: '#FDFCF9', opacity: 0.5 }}
                  contentStyle={{ borderRadius: '24px', border: '1px solid #E5E5DC', background: '#FFF', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="energie" fill="#7A8C69" radius={[12, 12, 0, 0]} barSize={36}>
                   {analysisData.map((d, index) => (
                      <Cell key={`cell-${index}`} fill={d.energie > 7 ? '#7A8C69' : '#8A9B79'} />
                   ))}
                </Bar>
                <Bar dataKey="anstrengung" fill="#EBD6C5" radius={[12, 12, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-natural-morning p-10 rounded-[3.5rem] border border-[#D8E0D1]"
          >
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-accent mb-8 text-center text-opacity-60">Stimmungstrend</h4>
            <div className="space-y-6">
              {analysisData.map((d, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <span className="text-[10px] font-bold text-natural-muted uppercase w-8">{d.name}</span>
                  <div className="flex-1 h-px bg-natural-accent/10 mx-4" />
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all group-hover:scale-125 ${d.mood ? 'bg-white shadow-sm' : 'bg-white/30 opacity-50'}`}>
                    {d.mood ? smileys[d.mood] : '—'}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="bg-white p-10 rounded-[3.5rem] border border-[#E5E5DC] shadow-sm flex flex-col items-center text-center">
            <span className="text-[10px] uppercase font-black tracking-widest text-natural-muted mb-6">Wochen-Status</span>
            <div className="w-16 h-16 rounded-3xl bg-natural-bg border border-[#E5E5DC] flex items-center justify-center text-2xl mb-4">
              ✨
            </div>
            <p className="text-xs font-serif text-natural-accent leading-relaxed">
              Deine Energie-Balance war diese Woche {avgEnergy > avgTiredness ? 'positiv' : 'ausgeglichen'}. Ein guter Zeitpunkt für Reflexion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`p-10 rounded-[3rem] ${color} shadow-sm border border-black/5 flex flex-col items-center text-center gap-4 transition-all`}
    >
      <div className="p-4 bg-white/30 rounded-[1.5rem] shadow-inner">
        <Icon size={24} />
      </div>
      <div>
        <span className="block text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">{label}</span>
        <span className="text-4xl font-serif">{value}</span>
      </div>
    </motion.div>
  );
}

