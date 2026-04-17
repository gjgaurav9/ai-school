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
};

function loadProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultProgress, ...JSON.parse(stored) } : { ...defaultProgress };
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

  return { progress, completeGame, addBadge, addFlower, getGameCount, setChildName, addDiaryEntry, addWordToWall };
}
