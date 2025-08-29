import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-primary">
            Study Session - {formattedDate}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Holiday indicator */}
          {dayData.holiday && (
            <div className="p-3 bg-holiday-light rounded-lg border border-holiday/20">
              <div className="text-holiday font-medium">🎉 {dayData.holiday}</div>
            </div>
          )}

          {/* Completion Status */}
          <div className="space-y-2">
            <Label>Study Completion</Label>
            <Button
              onClick={handleToggleCrossed}
              variant={dayData.crossed ? "default" : "outline"}
              className={cn(
                "w-full",
                dayData.crossed && "bg-success hover:bg-success/90 text-success-foreground"
              )}
            >
              {dayData.crossed ? "✓ Completed" : "Mark as Completed"}
            </Button>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="note">Study Notes</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you study today? Key concepts, topics, insights..."
              className="min-h-[100px] resize-none"
            />
            <Button 
              onClick={handleSaveNote}
              variant="outline"
              size="sm"
              className="bg-warning-light hover:bg-warning/20 text-warning-foreground border-warning/20"
            >
              💾 Save Note
            </Button>
          </div>

          {/* Time Tracking Section */}
          <div className="space-y-4">
            <Label>Time Tracking</Label>
            
            {/* Current Total */}
            <div className="p-3 bg-accent-light rounded-lg">
              <div className="text-sm text-accent-foreground/80">Total Study Time</div>
              <div className="text-2xl font-bold text-accent">
                {formatTime(dayData.minutes)}
              </div>
            </div>

            {/* Timer Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Live Timer</span>
                {dayData.isTimerRunning && (
                  <div className="text-xl font-mono text-accent font-bold">
                    {timerDisplay}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {!dayData.isTimerRunning ? (
                  <Button
                    onClick={onStartTimer}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    ▶️ Start Timer
                  </Button>
                ) : (
                  <Button
                    onClick={onStopTimer}
                    variant="outline"
                    className="flex-1 border-accent text-accent hover:bg-accent-light/20"
                  >
                    ⏹️ Stop Timer
                  </Button>
                )}
              </div>
            </div>

            {/* Manual Time Entry */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Manual Time Adjustment</div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="Minutes"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddMinutes}
                  variant="outline"
                  size="sm"
                  disabled={!manualMinutes}
                  className="text-success border-success hover:bg-success-light/20"
                >
                  + Add
                </Button>
                <Button
                  onClick={handleSubtractMinutes}
                  variant="outline"
                  size="sm"
                  disabled={!manualMinutes}
                  className="text-destructive border-destructive hover:bg-destructive/10"
                >
                  - Remove
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudyModal;