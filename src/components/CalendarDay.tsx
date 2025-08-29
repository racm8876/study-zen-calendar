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
        "relative min-h-[120px] p-3 border rounded-xl cursor-pointer transition-all duration-300 group",
        "hover:shadow-lg hover:-translate-y-1 animate-scale-in",
        "bg-gradient-to-br from-card to-card/80 backdrop-blur-sm",
        isPast && "bg-gradient-to-br from-past/50 to-past/30 text-past-foreground cursor-not-allowed opacity-70",
        !isPast && "hover:shadow-glow-md hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary-light/10",
        isToday && "ring-2 ring-primary shadow-glow-sm animate-pulse-glow",
        isSelected && "bg-gradient-to-br from-primary-light/40 to-primary/10 shadow-glow-md",
        dayData.holiday && "bg-gradient-to-br from-holiday-light/60 to-holiday-glow/30 border-holiday/30"
      )}
      onClick={handleClick}
      title={isPast ? "Past dates cannot be edited" : undefined}
    >
      {/* Decorative glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Day number */}
      <div className="relative flex items-center justify-between mb-3">
        <span className={cn(
          "text-sm font-semibold transition-all duration-200",
          isToday && "text-primary font-bold text-lg gradient-text animate-bounce-in",
          isPast && "text-past-foreground",
          !isPast && !isToday && "group-hover:text-primary"
        )}>
          {dayNumber}
        </span>
        
        {/* Cross button */}
        {!isPast && (
          <button
            onClick={handleCrossClick}
            className={cn(
              "w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300",
              "hover:scale-110 active:scale-95",
              dayData.crossed 
                ? "bg-gradient-to-r from-success to-success-glow text-success-foreground border-success shadow-success-glow animate-bounce-in" 
                : "border-muted-foreground/40 hover:border-success hover:bg-gradient-to-r hover:from-success-light/20 hover:to-success-glow/20 hover:shadow-success-glow/50"
            )}
            title={dayData.crossed ? "Mark as not completed" : "Mark as completed"}
          >
            {dayData.crossed && "✓"}
          </button>
        )}
      </div>

      {/* Holiday */}
      {dayData.holiday && (
        <div className="relative text-xs text-holiday font-semibold mb-2 p-2 bg-holiday-light/50 rounded-lg border border-holiday/20 animate-fade-in">
          🎉 {dayData.holiday}
        </div>
      )}

      {/* Note preview */}
      {dayData.note && (
        <div className="relative text-xs text-warning-foreground mb-2 p-2 bg-gradient-to-r from-warning-light/50 to-warning-glow/30 rounded-lg border border-warning/20 animate-slide-up">
          📝 <span className="font-medium">{notePreview}</span>
        </div>
      )}

      {/* Time logged */}
      {dayData.minutes > 0 && (
        <div className="relative text-xs text-accent-foreground font-semibold p-2 bg-gradient-to-r from-accent-light/50 to-accent-glow/30 rounded-lg border border-accent/20 animate-slide-up">
          ⏱️ {formatTime(dayData.minutes)}
        </div>
      )}

      {/* Timer running indicator */}
      {dayData.isTimerRunning && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-r from-accent to-accent-glow rounded-full animate-pulse-glow shadow-accent-glow" />
      )}

      {/* Enhanced status indicators */}
      <div className="absolute bottom-2 right-2 flex gap-1">
        {dayData.crossed && (
          <div className="w-3 h-3 bg-gradient-to-r from-success to-success-glow rounded-full shadow-success-glow animate-bounce-in" title="Completed" />
        )}
        {dayData.note && (
          <div className="w-3 h-3 bg-gradient-to-r from-warning to-warning-glow rounded-full shadow-warning-glow animate-bounce-in" title="Has note" />
        )}
        {dayData.minutes > 0 && (
          <div className="w-3 h-3 bg-gradient-to-r from-accent to-accent-glow rounded-full shadow-accent-glow animate-bounce-in" title="Time logged" />
        )}
      </div>
    </div>
  );
});

CalendarDay.displayName = 'CalendarDay';

export default CalendarDay;