import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed detailed error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert(`Domain nicht autorisiert! 
        
Aktuelle Domain: ${window.location.hostname}
        
Bitte füge diese Domain in der Firebase Console unter Authentifizierung -> Einstellungen -> Autorisierte Domains hinzu.`);
      } else if (error.code === 'auth/popup-closed-by-user') {
        // Normal if user closes it, but if it happens instantly, it's a config issue
        alert("Das Login-Fenster wurde geschlossen. Wenn dies sofort passiert ist, prüfe bitte, ob deine Domain in Firebase autorisiert ist.");
      } else {
        alert("Anmeldung fehlgeschlagen: " + error.message);
      }
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
