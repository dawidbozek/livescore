'use client';

import { ChevronLeft, ChevronRight, Calendar, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toDateString, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const today = new Date();

  const goToPreviousDay = () => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() - 1);
      onDateChange(newDate);
    } else {
      // If "all active" is selected, go to today
      onDateChange(today);
    }
  };

  const goToNextDay = () => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + 1);
      onDateChange(newDate);
    } else {
      // If "all active" is selected, go to today
      onDateChange(today);
    }
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      onDateChange(new Date(value + 'T00:00:00'));
    }
  };

  const selectAllActive = () => {
    onDateChange(null);
  };

  const selectToday = () => {
    onDateChange(today);
  };

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4 bg-card rounded-lg border">
      {/* Quick buttons */}
      <div className="flex gap-2">
        <Button
          variant={selectedDate === null ? 'default' : 'outline'}
          size="icon"
          onClick={selectAllActive}
          className={cn(
            'min-h-[44px] min-w-[44px]',
            selectedDate === null && 'bg-darts-green hover:bg-darts-green/90'
          )}
          aria-label="Wszystkie aktywne"
          title="Wszystkie aktywne"
        >
          <Zap className="w-5 h-5" />
        </Button>
        <Button
          variant={selectedDate && toDateString(selectedDate) === toDateString(today) ? 'default' : 'outline'}
          size="sm"
          onClick={selectToday}
          className="min-h-[44px] px-3"
        >
          Dziś
        </Button>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPreviousDay}
          aria-label="Poprzedni dzień"
          className="min-h-[44px] min-w-[44px]"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="relative flex-1">
          <input
            type="date"
            value={selectedDate ? toDateString(selectedDate) : ''}
            onChange={handleDateInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 bg-background border rounded-md justify-center min-h-[44px]',
            !selectedDate && 'text-muted-foreground'
          )}>
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base truncate">
              {selectedDate ? formatDate(selectedDate) : 'Wybierz datę'}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={goToNextDay}
          aria-label="Następny dzień"
          className="min-h-[44px] min-w-[44px]"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
