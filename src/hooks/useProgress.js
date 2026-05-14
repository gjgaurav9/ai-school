import { useState, useCallback } from 'react';

const STORAGE_KEY = 'aischool_progress';

const defaultProgress = {
  childName: '',
  gamesPlayed: [],
  stars: 0,
  badges: [],
  gardenFlowers: [],
  streak: 0,
  lastPlayed: null,
  diaryEntries: [],
  wordWall: [],
  bhavanaPath: { gamesPlayed: [], lotusLevel: 0, reflections: [] },
};

// Lotus levels: 0 (bud) → 1 (first petal) → 2 (half) → 3 (full) → 4 (golden)
function computeLotusLevel(count) {
  if (count >= 20) return 4;
  if (count >= 12) return 3;
  if (count >= 7) return 2;
  if (count >= 3) return 1;
  return 0;
}

function loadProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...defaultProgress };
    const parsed = JSON.parse(stored);
    return {
      ...defaultProgress,
      ...parsed,
      bhavanaPath: { ...defaultProgress.bhavanaPath, ...(parsed.bhavanaPath || {}) },
    };
  } catch {
    return { ...defaultProgress };
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage unavailable
  }
}

export function useProgress() {
  const [progress, setProgress] = useState(loadProgress);

  const completeGame = useCallback((gameId, data = {}) => {
    setProgress(prev => {
      const updated = {
        ...prev,
        gamesPlayed: [...prev.gamesPlayed, { gameId, date: new Date().toISOString(), ...data }],
        stars: prev.stars + 1,
        lastPlayed: new Date().toISOString(),
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const addBadge = useCallback((badge) => {
    setProgress(prev => {
      if (prev.badges.includes(badge)) return prev;
      const updated = { ...prev, badges: [...prev.badges, badge] };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const addFlower = useCallback((flower) => {
    setProgress(prev => {
      const updated = { ...prev, gardenFlowers: [...prev.gardenFlowers, flower] };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const getGameCount = useCallback((gameId) => {
    return progress.gamesPlayed.filter(g => g.gameId === gameId).length;
  }, [progress]);

  const setChildName = useCallback((name) => {
    setProgress(prev => {
      const updated = { ...prev, childName: name };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const addDiaryEntry = useCallback((entry) => {
    setProgress(prev => {
      const updated = { ...prev, diaryEntries: [...(prev.diaryEntries || []), entry] };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const addWordToWall = useCallback((word) => {
    setProgress(prev => {
      const wall = prev.wordWall || [];
      if (wall.includes(word)) return prev;
      const updated = { ...prev, wordWall: [...wall, word] };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const completeBhavanaGame = useCallback((gameId, data = {}) => {
    setProgress(prev => {
      const bhavana = prev.bhavanaPath || defaultProgress.bhavanaPath;
      const nextPlayed = [...bhavana.gamesPlayed, { gameId, date: new Date().toISOString(), ...data }];
      const updated = {
        ...prev,
        gamesPlayed: [...prev.gamesPlayed, { gameId, date: new Date().toISOString(), ...data }],
        stars: prev.stars + 1,
        lastPlayed: new Date().toISOString(),
        bhavanaPath: {
          ...bhavana,
          gamesPlayed: nextPlayed,
          lotusLevel: computeLotusLevel(nextPlayed.length),
        },
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const addReflection = useCallback((gameId, text) => {
    if (!text) return;
    setProgress(prev => {
      const bhavana = prev.bhavanaPath || defaultProgress.bhavanaPath;
      const updated = {
        ...prev,
        bhavanaPath: {
          ...bhavana,
          reflections: [...bhavana.reflections, { gameId, text, date: new Date().toISOString() }],
        },
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  return {
    progress,
    completeGame,
    addBadge,
    addFlower,
    getGameCount,
    setChildName,
    addDiaryEntry,
    addWordToWall,
    completeBhavanaGame,
    addReflection,
  };
}
