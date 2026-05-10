import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layout } from './Layout';
import { Auth } from './Auth';
import { Dashboard } from './Dashboard';
import { CheckIn } from './CheckIn';
import { Analysis } from './Analysis';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function MainContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<'dashboard' | 'checkin' | 'analysis'>('dashboard');

  // Test connection to Firestore as per integration guidelines
  useEffect(() => {
    if (user) {
      const testConnection = async () => {
        try {
          await getDocFromServer(doc(db, 'test', 'connection'));
        } catch (error) {
          if (error instanceof Error && error.message.includes('the client is offline')) {
            console.error("Please check your Firebase configuration.");
          }
        }
      };
      testConnection();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-gray-400 font-sans tracking-tight"
        >
          Lädt...
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Layout activeView={view} setView={setView}>
      <AnimatePresence mode="wait">
        {view === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard />
          </motion.div>
        ) : view === 'analysis' ? (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Analysis />
          </motion.div>
        ) : (
          <motion.div
            key="checkin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <CheckIn onComplete={() => setView('dashboard')} />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
