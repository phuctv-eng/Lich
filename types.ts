
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO format YYYY-MM-DD
  type: 'work' | 'personal' | 'holiday' | 'other';
}

export interface MonthInsight {
  vibe: string;
  suggestion: string;
  quote: string;
}

export enum EventType {
  WORK = 'work',
  PERSONAL = 'personal',
  HOLIDAY = 'holiday',
  OTHER = 'other'
}
