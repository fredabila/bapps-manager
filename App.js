import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { getApps, initializeApp } from '@react-native-firebase/app';
import { firebaseConfig } from './firebaseConfig'; // Make sure to import the correct variable name

const App = () => {
  useEffect(() => {
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
  }, []);

  return <AppNavigator />;
};

export default App;
