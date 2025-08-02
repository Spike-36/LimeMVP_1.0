// context/TargetLangContext.js

import { createContext, useContext, useState } from 'react';

// 1. Create context
const TargetLangContext = createContext();

// 2. Hook to use the context
export const useTargetLang = () => useContext(TargetLangContext);

// 3. Provider to wrap app
export const TargetLangProvider = ({ children }) => {
  const [targetLang, setTargetLang] = useState('japanese'); // default to Japanese

  return (
    <TargetLangContext.Provider value={{ targetLang, setTargetLang }}>
      {children}
    </TargetLangContext.Provider>
  );
};
