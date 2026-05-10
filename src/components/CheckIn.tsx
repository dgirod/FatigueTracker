import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Sun, Coffee, Moon, Zap, Battery, Check, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface CheckInProps {
  onComplete: () => void;
}

export function CheckIn({ onComplete }: CheckInProps) {
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [activeStep, setActiveStep] = useState<'morning' | 'noon' | 'evening'>(() => {
    const hour = new Date().getHours();
    if (hour < 11) return 'morning';
    if (hour < 17) return 'noon';
    return 'evening';
  });

  const [morningData, setMorningData] = useState({ recovery: 5, energy: 5, mood: 3 });
  const [noonData, setNoonData] = useState({ tiredness: 5, mood: 3 });
  const [eveningData, setNoonEveningData] = useState({ tiredness: 5, strenuousness: 5, mood: 3 });
  const [submitting, setSubmitting] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const fetchToday = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'entries', today);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setExistingData(data);
          if (data.morning) setMorningData({ ...morningData, ...data.morning });
          if (data.noon) setNoonData({ ...noonData, ...data.noon });
          if (data.evening) setNoonEveningData({ ...eveningData, ...data.evening });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}/entries/${today}`);
      }
    };
    fetchToday();
  }, [user, today]);

  const saveMorning = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const docRef = doc(db, 'users', user.uid, 'entries', today);
      await setDoc(docRef, {
        userId: user.uid,
        date: today,
        morning: { ...morningData, updatedAt: serverTimestamp() }
      }, { merge: true });
      setExistingData((prev: any) => ({ ...prev, morning: morningData }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/entries/${today}`);
    } finally {
      setSubmitting(false);
    }
  };

  const saveNoon = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const docRef = doc(db, 'users', user.uid, 'entries', today);
      await setDoc(docRef, {
        userId: user.uid,
        date: today,
        noon: { ...noonData, updatedAt: serverTimestamp() }
      }, { merge: true });
      setExistingData((prev: any) => ({ ...prev, noon: noonData }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/entries/${today}`);
    } finally {
      setSubmitting(false);
    }
  };

  const saveEvening = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const docRef = doc(db, 'users', user.uid, 'entries', today);
      await setDoc(docRef, {
        userId: user.uid,
        date: today,
        evening: { ...eveningData, updatedAt: serverTimestamp() }
      }, { merge: true });
      setExistingData((prev: any) => ({ ...prev, evening: eveningData }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/entries/${today}`);
    } finally {
      setSubmitting(false);
    }
  };

  const MoodRating = ({ value, onChange, label, compact = false }: any) => {
    const smileys = ['😞', '🙁', '😐', '🙂', '😊'];
    return (
      <div className={`space-y-4 ${compact ? 'flex-1' : 'mb-10'}`}>
        <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-natural-muted text-center">{label}</span>
        <div className={`flex justify-between items-center bg-white rounded-[2.5rem] shadow-sm border border-[#E5E5DC] ${compact ? 'p-3 gap-1' : 'p-6'}`}>
          {smileys.map((smiley, index) => (
            <button
              key={index}
              onClick={() => onChange(index + 1)}
              className={`transition-all duration-300 ${compact ? 'text-xl' : 'text-3xl'} ${
                value === index + 1 ? 'scale-125 grayscale-0' : 'grayscale opacity-30 hover:opacity-100 hover:grayscale-0 scale-100'
              }`}
            >
              {smiley}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const Slider = ({ label, value, onChange, min = 1, max = 10, icon: Icon, accentColor = 'natural-accent' }: any) => (
    <div className="space-y-6 mb-10">
      <div className="flex justify-between items-center bg-white p-5 rounded-[2rem] shadow-sm border border-[#E5E5DC]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-natural-bg rounded-2xl text-natural-accent">
            <Icon size={22} />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest text-natural-muted">{label}</span>
        </div>
        <span className="text-4xl font-serif text-natural-text tabular-nums">{value}</span>
      </div>
      <div className="px-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-[#E5E5DC] rounded-lg appearance-none cursor-pointer accent-natural-accent"
        />
        <div className="flex justify-between mt-3 text-[10px] text-natural-muted uppercase tracking-widest font-extrabold">
          <span>Gering</span>
          <span>Sehr Hoch</span>
        </div>
      </div>
    </div>
  );

  const StepButton = ({ id, label, icon: Icon, active, bgColor, textColor, borderColor }: any) => (
    <button
      onClick={() => setActiveStep(id)}
      className={`flex-1 py-6 flex flex-col items-center gap-3 rounded-[2.5rem] transition-all duration-500 border-2 ${
        active 
          ? `${bgColor} ${borderColor} shadow-md scale-105 z-10` 
          : 'bg-white border-[#E5E5DC] text-natural-muted opacity-60 grayscale hover:grayscale-0'
      }`}
    >
      <div className={`p-3 rounded-2xl ${active ? 'bg-white text-natural-text' : 'bg-transparent text-natural-muted'}`}>
        <Icon size={24} />
      </div>
      <span className={`text-[10px] uppercase tracking-widest font-black ${active ? textColor : 'text-natural-muted'}`}>{label}</span>
      {existingData?.[id] && <div className="absolute top-4 right-4 w-2 h-2 bg-green-500 rounded-full" />}
    </button>
  );

  const isModified = () => {
    if (!existingData) return true;
    const currentStepData = activeStep === 'morning' ? morningData : activeStep === 'noon' ? noonData : eveningData;
    const savedStepData = existingData[activeStep];
    
    if (!savedStepData) return true;

    // Compare keys relevant to the current step
    return JSON.stringify(currentStepData) !== JSON.stringify(savedStepData);
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-14 text-center">
        <h2 className="text-4xl font-serif text-[#5C634D] mb-3">Tagebuch Eintrag</h2>
        <p className="text-natural-muted uppercase tracking-[0.2em] text-[10px] font-black">
          {format(new Date(), 'EEEE, d. MMMM yyyy')}
        </p>
      </div>

      <div className="flex gap-4 mb-16 p-2 bg-[#F2F2EB]/50 rounded-[3rem] border border-[#E5E5DC]">
        <StepButton 
          id="morning" 
          label="Morgen" 
          icon={Sun} 
          active={activeStep === 'morning'} 
          bgColor="bg-natural-morning" 
          textColor="text-[#5C634D]"
          borderColor="border-[#D8E0D1]"
        />
        <StepButton 
          id="noon" 
          label="Mittag" 
          icon={Coffee} 
          active={activeStep === 'noon'} 
          bgColor="bg-natural-noon" 
          textColor="text-[#7A8C69]"
          borderColor="border-[#C7D1BC]"
        />
        <StepButton 
          id="evening" 
          label="Abend" 
          icon={Moon} 
          active={activeStep === 'evening'} 
          bgColor="bg-natural-evening" 
          textColor="text-[#B37F5A]"
          borderColor="border-[#EBD6C5]"
        />
      </div>

      <div className="bg-white/40 p-6 rounded-[3rem] border border-[#E5E5DC]/50 backdrop-blur-sm mb-12">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-muted text-center mb-6">Deine Stimmung im Tagesverlauf</h3>
        <div className="flex flex-col md:flex-row gap-6">
          <MoodRating 
            label="Morgen" 
            value={morningData.mood} 
            onChange={(v: number) => setMorningData({ ...morningData, mood: v })} 
            compact
          />
          <MoodRating 
            label="Mittag" 
            value={noonData.mood} 
            onChange={(v: number) => setNoonData({ ...noonData, mood: v })} 
            compact
          />
          <MoodRating 
            label="Abend" 
            value={eveningData.mood} 
            onChange={(v: number) => setNoonEveningData({ ...eveningData, mood: v })} 
            compact
          />
        </div>
      </div>

      <motion.div
        key={activeStep}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-12 bg-white/40 p-10 rounded-[4rem] border border-[#E5E5DC]/50 backdrop-blur-sm"
      >
        {activeStep === 'morning' && (
          <>
            <Slider 
              label="Dein Erholungs-Status" 
              value={morningData.recovery} 
              onChange={(v: number) => setMorningData({ ...morningData, recovery: v })} 
              icon={Battery}
            />
            <Slider 
              label="Deine gefühlte Energie" 
              value={morningData.energy} 
              onChange={(v: number) => setMorningData({ ...morningData, energy: v })} 
              icon={Zap}
            />
          </>
        )}

        {activeStep === 'noon' && (
          <Slider 
            label="Aktuelle Müdigkeit" 
            value={noonData.tiredness} 
            onChange={(v: number) => setNoonData({ ...noonData, tiredness: v })} 
            icon={Coffee}
          />
        )}

        {activeStep === 'evening' && (
          <>
            <Slider 
              label="Deine Müdigkeit am Abend" 
              value={eveningData.tiredness} 
              onChange={(v: number) => setNoonEveningData({ ...eveningData, tiredness: v })} 
              icon={Moon}
            />
            <Slider 
              label="Anstrengung des Tages" 
              value={eveningData.strenuousness} 
              onChange={(v: number) => setNoonEveningData({ ...eveningData, strenuousness: v })} 
              icon={Zap}
            />
          </>
        )}

        <button
          onClick={activeStep === 'morning' ? saveMorning : activeStep === 'noon' ? saveNoon : saveEvening}
          disabled={submitting || !isModified()}
          className={`w-full py-6 rounded-[2rem] font-bold uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-3 ${
            isModified() ? 'bg-natural-accent text-white shadow-natural-accent/20 hover:bg-[#687a58]' : 'bg-[#E5E5DC] text-natural-muted shadow-none cursor-default'
          }`}
        >
          {submitting ? 'Wird gespeichert...' : (
            isModified() ? <><Check size={20}/> Eintrag Speichern</> : <><Check size={20}/> Eintrag gespeichert</>
          )}
        </button>
      </motion.div>

      <div className="mt-20 flex justify-center">
        <button
          onClick={onComplete}
          className="group flex flex-col items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-[#E5E5DC] flex items-center justify-center transition-transform group-hover:-translate-y-1 shadow-sm text-natural-muted">
             <LayoutDashboard size={18} />
          </div>
          <span className="text-[10px] text-natural-muted uppercase tracking-[0.3em] font-black">Dashboard</span>
        </button>
      </div>
    </div>
  );
}
