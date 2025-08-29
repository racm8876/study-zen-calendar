// Study Calendar Types

export interface StudyData {
  [dateKey: string]: DayData;
}

export interface DayData {
  holiday?: string;
  crossed: boolean;
  note: string;
  minutes: number;
  timerStart?: number; // Timestamp when timer started
  isTimerRunning?: boolean;
}

export interface Holiday {
  date: string;
  name: string;
}

export interface WeeklyStats {
  weekStart: string;
  totalMinutes: number;
  studyDays: number;
}

export interface MonthlyStats {
  month: string;
  totalMinutes: number;
  studyDays: number;
  crossedDays: number;
}

export interface CalendarFilters {
  showNotesOnly: boolean;
  showCrossedOnly: boolean;
  showTimeLoggedOnly: boolean;
  searchQuery: string;
}