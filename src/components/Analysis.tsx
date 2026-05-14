import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { format, subDays, startOfToday } from 'date-fns';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { Activity, Brain, Moon, Zap, Sparkles, TrendingUp, Clock } from 'lucide-react';

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

  // Transform data for the 7-day terrain
  const terrainData = entries.map(e => ({
    name: format(new Date(e.date), 'EEE'),
    date: e.date,
    morning: e.morning?.energy || 0,
    noon: 10 - (e.noon?.tiredness || 5), // Convert tiredness to an "energy" scalar for the chart
    evening: 10 - (e.evening?.tiredness || 5),
    avg: ((e.morning?.energy || 0) + (10 - (e.noon?.tiredness || 5)) + (10 - (e.evening?.tiredness || 5))) / 3
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
        <StatCard label="Trend" value={entries.length > 1 ? (terrainData[entries.length-1].avg > terrainData[0].avg ? '↑' : '↓') : '—'} icon={TrendingUp} color="bg-white text-natural-muted border border-[#E5E5DC]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white p-10 md:p-14 rounded-[4rem] border border-[#E5E5DC] shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-natural-muted">7-Tage Energie-Gelände</h3>
              <p className="text-[10px] text-natural-muted italic">Die Bandbreite deiner Energie über den Tag hinweg</p>
            </div>
            <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-2 text-natural-accent"><div className="w-2 h-2 rounded-full bg-natural-morning"/> Morgen</span>
              <span className="flex items-center gap-2 text-[#7A8C69]"><div className="w-2 h-2 rounded-full bg-natural-noon"/> Mittag</span>
              <span className="flex items-center gap-2 text-[#B37F5A]"><div className="w-2 h-2 rounded-full bg-natural-evening"/> Abend</span>
            </div>
          </div>

          <div className="h-[400px] -ml-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={terrainData}>
                <defs>
                  <linearGradient id="colorMorning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DDE6D5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#DDE6D5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                  contentStyle={{ borderRadius: '24px', border: '1px solid #E5E5DC', background: '#FFF', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="morning" stroke="#7A8C69" fillOpacity={1} fill="url(#colorMorning)" strokeWidth={3} />
                <Area type="monotone" dataKey="noon" stroke="#5C634D" fillOpacity={0.1} fill="#5C634D" strokeWidth={2} strokeDasharray="5 5" />
                <Area type="monotone" dataKey="evening" stroke="#B37F5A" fillOpacity={0.1} fill="#B37F5A" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-natural-bg p-8 rounded-[3.5rem] border border-[#E5E5DC]"
          >
            <div className="flex items-center gap-3 mb-8">
              <Clock size={16} className="text-natural-accent" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-accent">Intra-Day Verlauf</h4>
            </div>
            
            <div className="space-y-6">
              {[...entries].reverse().slice(0, 3).map((e, i) => {
                const dayData = [
                  { time: 'Morg', energy: e.morning?.energy || 5 },
                  { time: 'Mitt', energy: 10 - (e.noon?.tiredness || 5) },
                  { time: 'Abend', energy: 10 - (e.evening?.tiredness || 5) }
                ];
                
                return (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-[#E5E5DC] shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-bold text-natural-muted uppercase">
                        {i === 0 ? 'Heute' : format(new Date(e.date), 'EEEE')}
                      </span>
                      <div className="flex gap-1">
                        {smileys[e.evening?.mood || e.noon?.mood || e.morning?.mood || 0]}
                      </div>
                    </div>
                    <div className="h-20 -mx-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dayData}>
                          <Line 
                            type="monotone" 
                            dataKey="energy" 
                            stroke="#7A8C69" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: '#7A8C69', strokeWidth: 0 }} 
                          />
                          <YAxis domain={[0, 10]} hide />
                          <XAxis dataKey="time" hide />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <div className="bg-white p-10 rounded-[3.5rem] border border-[#E5E5DC] shadow-sm flex flex-col items-center text-center">
            <span className="text-[10px] uppercase font-black tracking-widest text-natural-muted mb-6">Erkenntnis der Woche</span>
            <div className="w-16 h-16 rounded-3xl bg-natural-bg border border-[#E5E5DC] flex items-center justify-center text-2xl mb-4">
              ✨
            </div>
            <p className="text-xs font-serif text-natural-accent leading-relaxed">
              Deine Energie-Kurve verläuft meist {avgEnergy > 6 ? 'ruhig und stabil' : 'dynamisch'}. Beobachte, wie Pausen deinen Mittag beeinflussen.
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
