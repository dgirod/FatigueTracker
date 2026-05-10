import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { format, subDays, startOfToday } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'motion/react';
import { BarChart3, CloudMoon, TrendingUp, Zap, Moon } from 'lucide-react';

export function Dashboard() {
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

  const chartData = entries.map(e => ({
    date: format(new Date(e.date), 'EEE'),
    müdigkeit: ((e.noon?.tiredness || 0) + (e.evening?.tiredness || 0)) / (e.noon && e.evening ? 2 : 1) || e.noon?.tiredness || e.evening?.tiredness || 0,
    energie: e.morning?.energy || 0,
    erholung: e.morning?.recovery || 0,
    anstrengung: e.evening?.strenuousness || 0,
    morningMood: e.morning?.mood || 0,
    noonMood: e.noon?.mood || 0,
    eveningMood: e.evening?.mood || 0
  }));

  const smileys = ['', '😞', '🙁', '😐', '🙂', '😊'];

  if (loading) {
    return <div className="text-center py-24 text-natural-muted animate-pulse font-serif italic">Deine Übersicht wird vorbereitet...</div>;
  }

  const lastEntry = entries[entries.length - 1];
  const hasData = entries.length > 0;
  const streak = entries.length;

  return (
    <div className="space-y-12">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex gap-3">
             <div className="px-4 py-1.5 bg-natural-accent/10 border border-natural-accent/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-natural-accent">
               {streak} Tage Achtsamkeit
             </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-[#5C634D] lowercase leading-tight">deine woche.</h1>
          <p className="text-natural-muted font-light max-w-sm">Beobachte die Rhythmen deines Körpers und finde deine Balance.</p>
        </div>
        
        {hasData && (
          <div className="flex gap-4">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-natural-morning p-6 rounded-[2.5rem] border border-[#D8E0D1] shadow-sm flex flex-col items-center min-w-[140px]"
            >
              <span className="text-[10px] text-natural-muted font-black uppercase tracking-widest mb-3">Energie</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-serif text-natural-accent">{lastEntry.morning?.energy || '-'}</span>
                <span className="text-xs text-natural-muted">/ 10</span>
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-[2.5rem] border border-[#E5E5DC] shadow-sm flex flex-col items-center min-w-[140px]"
            >
              <span className="text-[10px] text-natural-muted font-black uppercase tracking-widest mb-3">Stimmung</span>
              <span className="text-4xl scale-125">{smileys[lastEntry.evening?.mood || lastEntry.morning?.mood || 0] || '—'}</span>
            </motion.div>
          </div>
        )}
      </header>

      {!hasData ? (
        <div className="bg-natural-morning/50 p-20 rounded-[3rem] border-2 border-dashed border-[#E5E5DC] text-center space-y-6">
           <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto text-natural-accent shadow-sm">
              <BarChart3 size={32} />
           </div>
           <div>
             <p className="text-xl font-serif text-[#5C634D] mb-1">Beginne deine Reise.</p>
             <p className="text-sm text-natural-muted font-light italic">Dein erster Eintrag fehlt noch für die Übersicht.</p>
           </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Main Visual Bar Chart Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 md:p-14 rounded-[4rem] border border-[#E5E5DC] shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-natural-muted mb-2">Energieverlauf</h3>
                <p className="text-xs text-natural-muted italic font-light">Vergleich zwischen Morgen-Energie und Tages-Müdigkeit</p>
              </div>
              <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2 text-natural-accent">
                  <div className="w-3 h-3 rounded-full bg-natural-accent"/> Morgen-Energie
                </span>
                <span className="flex items-center gap-2 text-natural-muted">
                  <div className="w-3 h-3 rounded-full bg-[#E5E5DC]"/> Tages-Müdigkeit
                </span>
              </div>
            </div>

            <div className="h-[400px] -ml-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={12}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#A8A89A', fontWeight: 700 }} 
                    dy={20}
                  />
                  <YAxis hide domain={[0, 10]} />
                  <Tooltip 
                    cursor={{ fill: '#FDFCF9', opacity: 0.5 }}
                    contentStyle={{ borderRadius: '24px', border: '1px solid #E5E5DC', background: '#FFF', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: '800' }}
                  />
                  <Bar 
                    dataKey="energie" 
                    fill="#7A8C69" 
                    radius={[12, 12, 0, 0]} 
                    barSize={40}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-e-${index}`} fill={entry.energie > 7 ? '#7A8C69' : '#8A9B79'} />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="müdigkeit" 
                    fill="#E5E5DC" 
                    radius={[12, 12, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-natural-evening/80 p-10 rounded-[3rem] border border-[#EBD6C5] flex flex-col justify-between"
            >
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B37F5A] mb-8">Wochen-Insights</h4>
                <p className="text-2xl font-serif text-[#6B4F3B] leading-snug italic mb-10">
                  "Deine Energie ist am Morgen tendenziell {chartData.reduce((acc, curr) => acc + curr.energie, 0) / chartData.length > 6 ? 'stabil' : 'schwankend'}. Achte auf deinen Schlaf-Rhythmus."
                </p>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/40 rounded-2xl flex items-center justify-center text-[#B37F5A]">
                    <TrendingUp size={20} />
                 </div>
                 <span className="text-[10px] uppercase font-black tracking-widest text-[#B37F5A]">Trend Erkennung</span>
              </div>
            </motion.div>

            <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-[#E5E5DC] shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-muted mb-10 text-center">Stimmungsverlauf vom Tag anzeigen</h3>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                {chartData.map((d, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <span className="text-[10px] font-bold text-natural-muted uppercase">
                      {i === chartData.length - 1 ? 'Heute' : d.date}
                    </span>
                    <div className="flex flex-col gap-2 w-full p-2 bg-natural-bg/30 rounded-[2rem] border border-[#E5E5DC]/50 shadow-inner">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[8px] font-black text-natural-muted/60 uppercase tracking-tighter">Morg</span>
                        <span className="text-xl">{d.morningMood ? smileys[d.morningMood] : '—'}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 border-y border-[#E5E5DC]/50 py-1">
                        <span className="text-[8px] font-black text-natural-muted/60 uppercase tracking-tighter">Mitt</span>
                        <span className="text-xl">{d.noonMood ? smileys[d.noonMood] : '—'}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[8px] font-black text-natural-muted/60 uppercase tracking-tighter">Abnd</span>
                        <span className="text-xl">{d.eveningMood ? smileys[d.eveningMood] : '—'}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

