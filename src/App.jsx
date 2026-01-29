import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

function App() {
  // 1. MODIFICARE: Inițializăm starea verificând direct LocalStorage
  // Această funcție rulează o singură dată, când se deschide site-ul sau dai refresh
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('asistent_user');
    if (savedUser) {
      return JSON.parse(savedUser); // Dacă avem user salvat, îl încărcăm direct
    }
    return null; // Dacă nu, începem ca neautentificat
  });

  // 2. LOGIN: Salvăm userul și în memoria browserului
  const handleLogin = (userData) => {
    console.log("User logat:", userData);
    localStorage.setItem('asistent_user', JSON.stringify(userData)); // Salvare persistentă
    setUser(userData);
  };

  // 3. LOGOUT: Ștergem userul din memorie
  const handleLogout = () => {
    localStorage.removeItem('asistent_user'); // Curățăm memoria
    setUser(null);
  };

  // 4. RENDERIZARE
  // Dacă nu avem user, arătăm pagina de Login
  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  // Dacă avem user, îi trimitem datele către Dashboard
  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;