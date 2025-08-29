import { memo } from 'react';
import { DayData } from '../types/study';
import { cn } from '../lib/utils';

interface CalendarDayProps {
  date: Date;
  dayData: DayData;
  isToday: boolean;
  isPast: boolean;
  isSelected: boolean;
  onClick: (date: Date) => void;
  onToggleCross: (dateKey: string) => void;
}

const formatTime = (minutes: number): string => {
  if (minutes === 0) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

const CalendarDay = memo(({ 
  date, 
  dayData, 
  isToday, 
  isPast, 
  isSelected, 
  onClick, 
  onToggleCross 
}: CalendarDayProps) => {
  const dateKey = date.toISOString().split('T')[0];
  const dayNumber = date.getDate();
  
  const handleClick = () => {
    if (isPast) return;
    onClick(date);
  };

  const handleCrossClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPast) return;
    onToggleCross(dateKey);
  };

  const notePreview = dayData.note.length > 25 
    ? `${dayData.note.substring(0, 25)}...` 
    : dayData.note;

  return (
    <div
      className={cn(
        "relative min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all duration-200",
        "hover:shadow-md",
        isPast && "bg-past text-past-foreground cursor-not-allowed opacity-60",
        !isPast && "bg-card hover:bg-primary-light/20",
        isToday && "ring-2 ring-primary ring-offset-2",
        isSelected && "bg-primary-light/30",
        dayData.holiday && "bg-holiday-light/30 border-holiday/20"
      )}
      onClick={handleClick}
      title={isPast ? "Past dates cannot be edited" : undefined}
    >
      {/* Day number */}
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          "text-sm font-medium",
          isToday && "text-primary font-bold",
          isPast && "text-past-foreground"
        )}>
          {dayNumber}
        </span>
        
        {/* Cross button */}
        {!isPast && (
          <button
            onClick={handleCrossClick}
            className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all",
              dayData.crossed 
                ? "bg-success text-success-foreground border-success" 
                : "border-muted-foreground/30 hover:border-success hover:bg-success-light/20"
            )}
            title={dayData.crossed ? "Mark as not completed" : "Mark as completed"}
          >
            {dayData.crossed && "✓"}
          </button>
        )}
      </div>

      {/* Holiday */}
      {dayData.holiday && (
        <div className="text-xs text-holiday font-medium italic mb-1 leading-tight">
          {dayData.holiday}
        </div>
      )}

      {/* Note preview */}
      {dayData.note && (
        <div className="text-xs text-warning mb-1 leading-tight">
          📝 {notePreview}
        </div>
      )}

      {/* Time logged */}
      {dayData.minutes > 0 && (
        <div className="text-xs text-accent font-medium">
          ⏱️ {formatTime(dayData.minutes)}
        </div>
      )}

      {/* Timer running indicator */}
      {dayData.isTimerRunning && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
      )}

      {/* Status indicators */}
      <div className="absolute bottom-1 right-1 flex gap-1">
        {dayData.crossed && (
          <div className="w-2 h-2 bg-success rounded-full" title="Completed" />
        )}
        {dayData.note && (
          <div className="w-2 h-2 bg-warning rounded-full" title="Has note" />
        )}
        {dayData.minutes > 0 && (
          <div className="w-2 h-2 bg-accent rounded-full" title="Time logged" />
        )}
      </div>
    </div>
  );
});

CalendarDay.displayName = 'CalendarDay';

export default CalendarDay;