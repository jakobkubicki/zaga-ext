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
    apiKey: "AIzaSyCd7dgwMl9FfHsGHsav4RVfjKCIWwUR91A",
    authDomain: "zaga-2fcfe.firebaseapp.com",
    projectId: "zaga-2fcfe",
    storageBucket: "zaga-2fcfe.appspot.com",
    messagingSenderId: "408135409648",
    appId: "1:408135409648:web:4dfb74bba3a49c1be84735",
    measurementId: "G-V846TBDXJ7"
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
