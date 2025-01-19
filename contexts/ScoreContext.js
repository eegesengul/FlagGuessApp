import React, { createContext, useContext, useState } from 'react';

const ScoreContext = createContext();

export const useScore = () => useContext(ScoreContext);

export const ScoreProvider = ({ children }) => {
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });

  return (
    <ScoreContext.Provider value={{ score, setScore }}>
      {children}
    </ScoreContext.Provider>
  );
};
