import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { LogIn, Activity } from 'lucide-react';

export function Auth() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-natural-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-14 rounded-[3rem] shadow-sm border border-[#E5E5DC] text-center"
      >
        <div className="w-20 h-20 bg-natural-morning rounded-3xl flex items-center justify-center mx-auto mb-10 overflow-hidden shadow-inner text-natural-accent">
           <Activity size={40} strokeWidth={2.5} />
        </div>
        
        <h1 className="text-4xl font-serif text-[#5C634D] mb-4">
          Willkommen
        </h1>
        <p className="text-natural-muted font-light mb-14 text-sm leading-relaxed italic">
          Tracke deine Energielevel und verstehe deine Müdigkeit besser.
        </p>

        <button
          onClick={signIn}
          className="w-full flex items-center justify-center gap-4 bg-[#5C634D] text-white py-5 px-8 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#4d5341] transition-all active:scale-[0.98] shadow-lg shadow-[#5C634D]/20"
        >
          <LogIn size={20} />
          Mit Google beginnen
        </button>
        
        <div className="mt-12 flex justify-center gap-2">
           {[1, 2, 3].map(i => (
             <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#E5E5DC]" />
           ))}
        </div>
      </motion.div>
    </div>
  );
}
