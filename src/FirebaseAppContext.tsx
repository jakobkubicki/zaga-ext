// FirebaseAppContext.tsx
import React from 'react';
import { FirebaseApp } from 'firebase/app';

// Create a context for the Firebase app instance.
export const FirebaseAppContext = React.createContext<FirebaseApp | null>(null);
