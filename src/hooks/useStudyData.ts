import { useState, useEffect, useCallback } from 'react';
import { StudyData, DayData, CalendarFilters } from '../types/study';
import { getHolidayMap } from '../data/holidays';

const STORAGE_KEY = 'study-calendar-data';

// Sample seed data to demonstrate features
const getSeedData = (): StudyData => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayKey = today.toISOString().split('T')[0];
  const yesterdayKey = yesterday.toISOString().split('T')[0];
  const twoDaysAgoKey = twoDaysAgo.toISOString().split('T')[0];
  const tomorrowKey = tomorrow.toISOString().split('T')[0];

  return {
    [todayKey]: {
      crossed: true,
      note: "Data Structures: Arrays and Linked Lists. Implemented basic operations and analyzed time complexity.",
      minutes: 120
    },
    [yesterdayKey]: {
      crossed: false,
      note: "Operating Systems: Process management and scheduling algorithms",
      minutes: 45
    },
    [twoDaysAgoKey]: {
      crossed: true,
      note: "Algorithms: Binary search and sorting techniques",
      minutes: 90
    },
    [tomorrowKey]: {
      crossed: false,
      note: "Database Systems: SQL queries and normalization",
      minutes: 0
    }
  };
};

export const useStudyData = () => {
  const [studyData, setStudyData] = useState<StudyData>({});
  const [filters, setFilters] = useState<CalendarFilters>({
    showNotesOnly: false,
    showCrossedOnly: false,
    showTimeLoggedOnly: false,
    searchQuery: ''
  });

  const holidays = getHolidayMap();

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setStudyData(parsed);
      } catch (error) {
        console.error('Failed to parse study data from localStorage:', error);
      }
    } else {
      // First time user - load seed data
      const seedData = getSeedData();
      setStudyData(seedData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    }
  }, []);

  // Save data to localStorage
  const saveData = useCallback((data: StudyData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setStudyData(data);
    } catch (error) {
      console.error('Failed to save study data to localStorage:', error);
    }
  }, []);

  // Get data for a specific date
  const getDayData = useCallback((dateKey: string): DayData => {
    const existing = studyData[dateKey];
    const holiday = holidays[dateKey];
    
    return {
      holiday,
      crossed: false,
      note: '',
      minutes: 0,
      timerStart: undefined,
      isTimerRunning: false,
      ...existing
    };
  }, [studyData, holidays]);

  // Update data for a specific date
  const updateDayData = useCallback((dateKey: string, updates: Partial<DayData>) => {
    const currentData = getDayData(dateKey);
    const newData = { ...currentData, ...updates };
    
    const updatedStudyData = {
      ...studyData,
      [dateKey]: newData
    };
    
    saveData(updatedStudyData);
  }, [studyData, getDayData, saveData]);

  // Toggle crossed status
  const toggleCrossed = useCallback((dateKey: string) => {
    const currentData = getDayData(dateKey);
    updateDayData(dateKey, { crossed: !currentData.crossed });
  }, [getDayData, updateDayData]);

  // Start timer
  const startTimer = useCallback((dateKey: string) => {
    updateDayData(dateKey, { 
      timerStart: Date.now(),
      isTimerRunning: true 
    });
  }, [updateDayData]);

  // Stop timer and add minutes
  const stopTimer = useCallback((dateKey: string) => {
    const currentData = getDayData(dateKey);
    if (currentData.timerStart) {
      const additionalMinutes = Math.round((Date.now() - currentData.timerStart) / 60000);
      updateDayData(dateKey, {
        minutes: currentData.minutes + additionalMinutes,
        timerStart: undefined,
        isTimerRunning: false
      });
    }
  }, [getDayData, updateDayData]);

  // Export data as JSON
  const exportData = useCallback(() => {
    const dataBlob = new Blob([JSON.stringify(studyData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `study-calendar-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [studyData]);

  // Import data from JSON
  const importData = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      saveData(parsed);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }, [saveData]);

  // Calculate totals
  const getTotals = useCallback(() => {
    const today = new Date();
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    let weeklyMinutes = 0;
    let monthlyMinutes = 0;
    let totalMinutes = 0;

    Object.entries(studyData).forEach(([dateKey, data]) => {
      const date = new Date(dateKey);
      totalMinutes += data.minutes;

      // Weekly total
      if (date >= thisWeekStart) {
        weeklyMinutes += data.minutes;
      }

      // Monthly total
      if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
        monthlyMinutes += data.minutes;
      }
    });

    return { weeklyMinutes, monthlyMinutes, totalMinutes };
  }, [studyData]);

  return {
    studyData,
    filters,
    setFilters,
    getDayData,
    updateDayData,
    toggleCrossed,
    startTimer,
    stopTimer,
    exportData,
    importData,
    getTotals
  };
};