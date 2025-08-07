import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const TargetLangContext = createContext();

export const TargetLangProvider = ({ children }) => {
  const [targetLang, setTargetLang] = useState('japanese');

  useEffect(() => {
    AsyncStorage.getItem('targetLang').then((lang) => {
      if (lang) setTargetLang(lang);
    });
  }, []);

  const updateLang = (lang) => {
    setTargetLang(lang);
    AsyncStorage.setItem('targetLang', lang);
  };

  return (
    <TargetLangContext.Provider value={{ targetLang, setTargetLang: updateLang }}>
      {children}
    </TargetLangContext.Provider>
  );
};

export const useTargetLang = () => useContext(TargetLangContext);
