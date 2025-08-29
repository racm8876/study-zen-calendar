import { Holiday } from '../types/study';

// Predefined holidays for 2024-2026
export const HOLIDAYS: Holiday[] = [
  // 2024
  { date: '2024-01-01', name: 'New Year\'s Day' },
  { date: '2024-01-26', name: 'Republic Day (India)' },
  { date: '2024-03-08', name: 'Holi' },
  { date: '2024-04-11', name: 'Eid al-Fitr' },
  { date: '2024-08-15', name: 'Independence Day (India)' },
  { date: '2024-10-02', name: 'Gandhi Jayanti' },
  { date: '2024-10-31', name: 'Diwali' },
  { date: '2024-12-25', name: 'Christmas' },

  // 2025
  { date: '2025-01-01', name: 'New Year\'s Day' },
  { date: '2025-01-26', name: 'Republic Day (India)' },
  { date: '2025-03-14', name: 'Holi' },
  { date: '2025-04-10', name: 'Eid al-Fitr' },
  { date: '2025-08-15', name: 'Independence Day (India)' },
  { date: '2025-10-02', name: 'Gandhi Jayanti' },
  { date: '2025-10-20', name: 'Diwali' },
  { date: '2025-12-25', name: 'Christmas' },

  // 2026
  { date: '2026-01-01', name: 'New Year\'s Day' },
  { date: '2026-01-26', name: 'Republic Day (India)' },
  { date: '2026-03-04', name: 'Holi' },
  { date: '2026-03-31', name: 'Eid al-Fitr' },
  { date: '2026-08-15', name: 'Independence Day (India)' },
  { date: '2026-10-02', name: 'Gandhi Jayanti' },
  { date: '2026-11-08', name: 'Diwali' },
  { date: '2026-12-25', name: 'Christmas' }
];

export const getHolidayMap = (): Record<string, string> => {
  return HOLIDAYS.reduce((map, holiday) => {
    map[holiday.date] = holiday.name;
    return map;
  }, {} as Record<string, string>);
};