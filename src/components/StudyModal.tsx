import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Calendar } from 'lucide-react';
import { DayData } from '../types/study';
import { cn } from '../lib/utils';

interface StudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  dayData: DayData;
  onUpdateData: (updates: Partial<DayData>) => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
}

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const StudyModal = ({
  isOpen,
  onClose,
  date,
  dayData,
  onUpdateData,
  onStartTimer,
  onStopTimer
}: StudyModalProps) => {
  const [note, setNote] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');
  const [timerDisplay, setTimerDisplay] = useState('');

  useEffect(() => {
    if (isOpen && dayData) {
      setNote(dayData.note || '');
      setManualMinutes('');
    }
  }, [isOpen, dayData]);

  // Update timer display
  useEffect(() => {
    if (!dayData.isTimerRunning || !dayData.timerStart) {
      setTimerDisplay('');
      return;
    }

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - dayData.timerStart!) / 1000);
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;
      
      setTimerDisplay(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [dayData.isTimerRunning, dayData.timerStart]);

  const handleSaveNote = () => {
    onUpdateData({ note: note.trim() });
  };

  const handleAddMinutes = () => {
    const minutes = parseInt(manualMinutes);
    if (isNaN(minutes) || minutes < 0) return;
    
    onUpdateData({ minutes: dayData.minutes + minutes });
    setManualMinutes('');
  };

  const handleSubtractMinutes = () => {
    const minutes = parseInt(manualMinutes);
    if (isNaN(minutes) || minutes < 0) return;
    
    const newMinutes = Math.max(0, dayData.minutes - minutes);
    onUpdateData({ minutes: newMinutes });
    setManualMinutes('');
  };

  const handleToggleCrossed = () => {
    onUpdateData({ crossed: !dayData.crossed });
  };

  if (!date) return null;

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-card to-card/95 backdrop-blur-sm border-primary/20 animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Calendar size={24} className="text-primary" />
            Study Session - {formattedDate}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Holiday indicator */}
          {dayData.holiday && (
            <div className="p-4 bg-gradient-to-r from-holiday-light/60 to-holiday-glow/40 rounded-xl border border-holiday/30 animate-bounce-in">
              <div className="text-holiday font-semibold flex items-center gap-2">
                🎉 {dayData.holiday}
              </div>
            </div>
          )}

          {/* Completion Status */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Study Completion</Label>
            <Button
              onClick={handleToggleCrossed}
              variant={dayData.crossed ? "default" : "outline"}
              className={cn(
                "w-full h-12 text-base font-semibold transition-all duration-300 hover:scale-105 active:scale-95",
                dayData.crossed 
                  ? "bg-gradient-to-r from-success to-success-glow hover:from-success-glow hover:to-success text-success-foreground shadow-success-glow animate-bounce-in" 
                  : "bg-gradient-to-r from-muted/50 to-muted border-success/30 hover:from-success-light/20 hover:to-success-glow/20 hover:border-success hover:shadow-success-glow/50"
              )}
            >
              {dayData.crossed ? "✓ Completed Today!" : "Mark as Completed"}
            </Button>
          </div>

          {/* Notes Section */}
          <div className="space-y-3">
            <Label htmlFor="note" className="text-base font-semibold flex items-center gap-2">
              📝 Study Notes
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you study today? Key concepts, topics, insights..."
              className="min-h-[120px] resize-none bg-gradient-to-br from-warning-light/10 to-warning-glow/5 border-warning/20 focus:border-warning focus:shadow-warning-glow/30 transition-all duration-300"
            />
            <Button 
              onClick={handleSaveNote}
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-warning-light/30 to-warning-glow/20 hover:from-warning-light/50 hover:to-warning-glow/30 text-warning-foreground border-warning/30 hover:shadow-warning-glow/50 transition-all duration-300 hover:scale-105"
            >
              💾 Save Note
            </Button>
          </div>

          {/* Time Tracking Section */}
          <div className="space-y-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              ⏱️ Time Tracking
            </Label>
            
            {/* Current Total */}
            <div className="p-4 bg-gradient-to-br from-accent-light/40 to-accent-glow/20 rounded-xl border border-accent/30 animate-fade-in">
              <div className="text-sm text-accent-foreground/80 font-medium mb-1">Total Study Time</div>
              <div className="text-3xl font-bold text-accent">
                {formatTime(dayData.minutes)}
              </div>
            </div>

            {/* Timer Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold">Live Timer</span>
                {dayData.isTimerRunning && (
                  <div className="text-2xl font-mono text-accent font-bold bg-gradient-to-r from-accent-light/30 to-accent-glow/20 px-3 py-1 rounded-lg border border-accent/30 animate-pulse-glow">
                    {timerDisplay}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                {!dayData.isTimerRunning ? (
                  <Button
                    onClick={onStartTimer}
                    className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-accent to-accent-glow hover:from-accent-glow hover:to-accent text-accent-foreground shadow-accent-glow transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    ▶️ Start Timer
                  </Button>
                ) : (
                  <Button
                    onClick={onStopTimer}
                    variant="outline"
                    className="flex-1 h-12 text-base font-semibold border-accent/50 text-accent hover:bg-gradient-to-r hover:from-accent-light/20 hover:to-accent-glow/20 hover:shadow-accent-glow/50 transition-all duration-300 hover:scale-105"
                  >
                    ⏹️ Stop Timer
                  </Button>
                )}
              </div>
            </div>

            {/* Manual Time Entry */}
            <div className="space-y-3 p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-muted">
              <div className="text-base font-semibold">Manual Time Adjustment</div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="Minutes"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                  className="flex-1 bg-gradient-to-r from-card/50 to-card/30"
                />
                <Button
                  onClick={handleAddMinutes}
                  variant="outline"
                  size="sm"
                  disabled={!manualMinutes}
                  className="text-success border-success hover:bg-gradient-to-r hover:from-success-light/20 hover:to-success-glow/20 hover:shadow-success-glow/50 transition-all duration-300 hover:scale-105"
                >
                  + Add
                </Button>
                <Button
                  onClick={handleSubtractMinutes}
                  variant="outline"
                  size="sm"
                  disabled={!manualMinutes}
                  className="text-destructive border-destructive hover:bg-destructive/10 transition-all duration-300 hover:scale-105"
                >
                  - Remove
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="bg-gradient-to-r from-muted/20 to-muted/10 hover:from-muted/40 hover:to-muted/20 transition-all duration-300 hover:scale-105"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudyModal;