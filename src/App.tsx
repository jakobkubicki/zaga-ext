import React, { useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import AppPage from './AppPage'
import LoginPage from './LoginPage'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { FirebaseAppContext } from './FirebaseAppContext';
import { onAuthStateChanged } from 'firebase/auth';
import { User } from "firebase/auth";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('login')

  const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // user is signed in
        setUser(user);
        setCurrentPage('app');
        // stored in user.uid
      } else {
        // not signed in
        setUser(null);
        setCurrentPage('login');
      }
    });
  }, []); // only run once
  
  return (
    <FirebaseAppContext.Provider value={app}>
      <Container maxWidth='sm'>
        {currentPage === 'login' && <LoginPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'app' && <AppPage />}
      </Container>
    </FirebaseAppContext.Provider>
  );
}

export default App;
