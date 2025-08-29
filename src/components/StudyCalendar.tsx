import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, Download, Upload, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import CalendarDay from './CalendarDay';
import StudyModal from './StudyModal';
import { useStudyData } from '../hooks/useStudyData';
import { cn } from '../lib/utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

const StudyCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
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
  } = useStudyData();

  const today = new Date();
  const { weeklyMinutes, monthlyMinutes } = getTotals();

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      if (currentDay.getMonth() === month || days.length < 7 || currentDay.getDate() <= 7) {
        days.push(new Date(currentDay));
      }
      currentDay.setDate(currentDay.getDate() + 1);
      
      if (currentDay > lastDay && currentDay.getDay() === 0) break;
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Filter days based on search and filters
  const shouldShowDay = (date: Date, dayData: any) => {
    if (date.getMonth() !== currentDate.getMonth()) return false;
    
    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (!dayData.note.toLowerCase().includes(query) && 
          !dayData.holiday?.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Other filters
    if (filters.showNotesOnly && !dayData.note) return false;
    if (filters.showCrossedOnly && !dayData.crossed) return false;
    if (filters.showTimeLoggedOnly && dayData.minutes === 0) return false;

    return true;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleUpdateDayData = (updates: any) => {
    if (!selectedDate) return;
    const dateKey = selectedDate.toISOString().split('T')[0];
    updateDayData(dateKey, updates);
  };

  const handleStartTimer = () => {
    if (!selectedDate) return;
    const dateKey = selectedDate.toISOString().split('T')[0];
    startTimer(dateKey);
  };

  const handleStopTimer = () => {
    if (!selectedDate) return;
    const dateKey = selectedDate.toISOString().split('T')[0];
    stopTimer(dateKey);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (importData(content)) {
            alert('Data imported successfully!');
          } else {
            alert('Failed to import data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const isPastDate = (date: Date) => {
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-5xl font-bold gradient-text animate-float">
          Study Zen Calendar
        </h1>
        <p className="text-muted-foreground text-lg">Track your learning journey with notes, time, and progress</p>
      </div>

      {/* Enhanced Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover bg-gradient-to-br from-primary/5 to-primary-light/10 border-primary/20">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground font-medium mb-2">This Week</div>
            <div className="text-3xl font-bold gradient-text">{formatTime(weeklyMinutes)}</div>
            <div className="w-full h-2 bg-muted rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full animate-scale-in" style={{ width: `${Math.min(100, (weeklyMinutes / 2800) * 100)}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover bg-gradient-to-br from-accent/5 to-accent-light/10 border-accent/20">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground font-medium mb-2">This Month</div>
            <div className="text-3xl font-bold text-accent">{formatTime(monthlyMinutes)}</div>
            <div className="w-full h-2 bg-muted rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent to-accent-glow rounded-full animate-scale-in" style={{ width: `${Math.min(100, (monthlyMinutes / 12000) * 100)}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover bg-gradient-to-br from-success/5 to-success-light/10 border-success/20">
          <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
            <Button onClick={exportData} variant="outline" size="sm" className="w-full bg-gradient-to-r from-success-light/20 to-success-glow/10 border-success/30 hover:shadow-success-glow/50">
              <Download size={16} className="mr-2" />
              Export Data
            </Button>
            <Button onClick={handleImport} variant="outline" size="sm" className="w-full bg-gradient-to-r from-warning-light/20 to-warning-glow/10 border-warning/30 hover:shadow-warning-glow/50">
              <Upload size={16} className="mr-2" />
              Import Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft size={16} />
              </Button>
              <CardTitle className="text-2xl font-bold">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight size={16} />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                <Calendar size={16} className="mr-1" />
                Today
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} className="mr-1" />
                Filters
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search notes or holidays..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={filters.showNotesOnly ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilters(prev => ({ ...prev, showNotesOnly: !prev.showNotesOnly }))}
                >
                  📝 Notes Only
                </Badge>
                <Badge
                  variant={filters.showCrossedOnly ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilters(prev => ({ ...prev, showCrossedOnly: !prev.showCrossedOnly }))}
                >
                  ✅ Completed Only
                </Badge>
                <Badge
                  variant={filters.showTimeLoggedOnly ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilters(prev => ({ ...prev, showTimeLoggedOnly: !prev.showTimeLoggedOnly }))}
                >
                  ⏱️ Time Logged Only
                </Badge>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-muted/50 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <span>Notes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span>Time Logged</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-holiday rounded-full"></div>
              <span>Holidays</span>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              const dateKey = date.toISOString().split('T')[0];
              const dayData = getDayData(dateKey);
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const showDay = shouldShowDay(date, dayData);
              
              return (
                <div key={index} className={cn(
                  !isCurrentMonth && "opacity-30",
                  !showDay && filters.searchQuery && "opacity-20"
                )}>
                  <CalendarDay
                    date={date}
                    dayData={dayData}
                    isToday={isToday(date)}
                    isPast={isPastDate(date)}
                    isSelected={selectedDate?.toDateString() === date.toDateString()}
                    onClick={handleDayClick}
                    onToggleCross={toggleCrossed}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Study Modal */}
      <StudyModal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        date={selectedDate}
        dayData={selectedDate ? getDayData(selectedDate.toISOString().split('T')[0]) : {} as any}
        onUpdateData={handleUpdateDayData}
        onStartTimer={handleStartTimer}
        onStopTimer={handleStopTimer}
      />
    </div>
  );
};

export default StudyCalendar;
