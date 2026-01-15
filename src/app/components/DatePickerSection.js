import { useState, useEffect } from "react";
import { Loader2, Calendar, CheckCircle, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function DatePickerSection({
  selectedDate,
  workCalandar,
  loadingCalendar,
  onDateSelect,
  onTimeReset,
  onMonthChange,
  onClose
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDatesCount, setAvailableDatesCount] = useState(0);
  const [weeks, setWeeks] = useState([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  // Calculate available dates and generate weeks
  useEffect(() => {
    if (!workCalandar) return;
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    let count = 0;
    
    // Generate all dates for current month
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    // Start from Monday of the week containing the 1st
    const startDate = new Date(firstDay);
    const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    startDate.setDate(startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    // Go to Sunday of the week containing the last day
    const endDate = new Date(lastDay);
    const endDayOfWeek = endDate.getDay();
    endDate.setDate(endDate.getDate() + (endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek));
    
    // Generate all dates in the calendar view
    const currentDate = new Date(startDate);
    const tempWeeks = [];
    let currentWeek = [];
    let dayCount = 0;
    
    while (currentDate <= endDate) {
      const date = new Date(currentDate);
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const d = date.getDate();
      const key = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      
      const isCurrentMonth = y === year && m === month;
      const isAvailable = isCurrentMonth && 
                         workCalandar?.[key] && 
                         parseInt(workCalandar[key].is_day_off) === 0;
      
      if (isAvailable) count++;
      
      // Check if date is in past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isPast = date < today;
      
      currentWeek.push({
        date,
        day: date.getDate(),
        month: m,
        year: y,
        isCurrentMonth,
        isAvailable: isAvailable && !isPast,
        isPast,
        isToday: date.toDateString() === new Date().toDateString(),
        isSelected: selectedDate && date.toDateString() === selectedDate.toDateString(),
        monthName: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
      });
      
      dayCount++;
      
      if (dayCount % 7 === 0) {
        tempWeeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (currentWeek.length > 0) {
      tempWeeks.push(currentWeek);
    }
    
    setWeeks(tempWeeks);
    setAvailableDatesCount(count);
    
    // Find current week index
    if (selectedDate) {
      const selectedWeekIndex = tempWeeks.findIndex(week => 
        week.some(day => 
          day.date.toDateString() === selectedDate.toDateString()
        )
      );
      if (selectedWeekIndex !== -1) {
        setCurrentWeekIndex(selectedWeekIndex);
      }
    } else if (tempWeeks.length > 0) {
      // Find week containing today
      const todayWeekIndex = tempWeeks.findIndex(week => 
        week.some(day => day.isToday)
      );
      if (todayWeekIndex !== -1) {
        setCurrentWeekIndex(todayWeekIndex);
      }
    }
  }, [workCalandar, currentMonth, selectedDate]);

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentMonth(newDate);
    setCurrentWeekIndex(0);
    onMonthChange(newDate);
  };

  const handleWeekChange = (direction) => {
    if (direction === 'prev' && currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    } else if (direction === 'next' && currentWeekIndex < weeks.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    }
  };

  const handleDateSelect = (date) => {
    // Don't allow selection of past dates or unavailable dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;
    
    onDateSelect(date);
    onTimeReset();
  };

  const getWeekRange = (week) => {
    if (!week || week.length === 0) return '';
    const first = week[0].date;
    const last = week[6].date;
    
    const firstMonth = first.toLocaleDateString('en-US', { month: 'short' });
    const lastMonth = last.toLocaleDateString('en-US', { month: 'short' });
    
    if (firstMonth === lastMonth) {
      return `${firstMonth} ${first.getDate()} - ${last.getDate()}`;
    } else {
      return `${firstMonth} ${first.getDate()} - ${lastMonth} ${last.getDate()}`;
    }
  };

  const getDayAbbreviation = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-gray-100 relative">
      {/* Cross Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 group"
          aria-label="Close date picker section"
        >
          <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      )}
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">4</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Select Date
          </h2>
          <p className="text-gray-600 mt-1">Choose your preferred appointment date</p>
        </div>
      </div>

      {/* Date Picker Container */}
      <div className="relative">
        {loadingCalendar && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl z-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
              <div>
                <p className="text-gray-800 font-semibold text-lg mb-1">Loading Calendar</p>
                <p className="text-gray-600 text-sm">Fetching available dates...</p>
              </div>
              <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
                <div className="h-full bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Calendar Stats */}
        {!loadingCalendar && workCalandar && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available this month</p>
                  <p className="font-semibold text-gray-800">
                    {availableDatesCount} day{availableDatesCount !== 1 ? 's' : ''} available
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Current Month</div>
                <div className="text-sm font-semibold text-green-600">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Month and Week Navigation */}
        <div className="space-y-4 mb-6">
          {/* Month Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => handleMonthChange('prev')}
              disabled={loadingCalendar}
              className="text-gray-700 px-4 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Month</span>
            </button>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            
            <button
              onClick={() => handleMonthChange('next')}
              disabled={loadingCalendar}
              className="text-gray-700 px-4 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <span>Next Month</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Week Range Display */}
          {weeks[currentWeekIndex] && (
            <div className="text-center">
              <div className="text-lg font-medium text-gray-700">
                {getWeekRange(weeks[currentWeekIndex])}
              </div>
            </div>
          )}

          {/* Week Navigation */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleWeekChange('prev')}
              disabled={currentWeekIndex === 0 || loadingCalendar}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700">
                Week {currentWeekIndex + 1} of {weeks.length}
              </div>
            </div>
            
            <button
              onClick={() => handleWeekChange('next')}
              disabled={currentWeekIndex === weeks.length - 1 || loadingCalendar}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Vertical Week Calendar - Full Width Design */}
        <div className="space-y-2 mb-6">
          {weeks[currentWeekIndex]?.map((day, index) => {
            const dayAbbr = getDayAbbreviation(day.date);
            const dayName = day.date.toLocaleDateString('en-US', { weekday: 'long' });
            const isToday = day.isToday;
            
            // Base classes for the day container - ALWAYS FULL WIDTH
            const baseContainerClasses = "flex items-center justify-between p-4 rounded-2xl transition-all duration-200 w-full";
            
            if (day.isSelected) {
              return (
                <div
                  key={index}
                  className={`${baseContainerClasses} bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center min-w-[60px]">
                      <div className="text-sm font-medium opacity-90">{dayAbbr}</div>
                      <div className="text-2xl font-bold">{day.day}</div>
                      {!day.isCurrentMonth && (
                        <div className="text-xs opacity-80">{day.monthName}</div>
                      )}
                    </div>
                    <div className="text-lg font-semibold">{dayName}</div>
                  </div>
                  <CheckCircle className="w-6 h-6" />
                </div>
              );
            }
            
            if (!day.isAvailable || day.isPast) {
              return (
                <div
                  key={index}
                  className={`${baseContainerClasses} bg-gray-100 text-gray-400`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center min-w-[60px]">
                      <div className="text-sm font-medium">{dayAbbr}</div>
                      <div className="text-2xl font-medium">{day.day}</div>
                      {!day.isCurrentMonth && (
                        <div className="text-xs">{day.monthName}</div>
                      )}
                    </div>
                    <div className="text-lg font-medium">{dayName}</div>
                  </div>
                  <X className="w-5 h-5" />
                </div>
              );
            }
            
            // For today's date
            if (isToday) {
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(day.date)}
                  className={`${baseContainerClasses} bg-blue-50 hover:bg-blue-100 cursor-pointer border-2 border-blue-200`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center min-w-[60px]">
                      <div className="text-sm font-bold text-blue-700">{dayAbbr}</div>
                      <div className="text-2xl font-bold text-blue-700">{day.day}</div>
                      {!day.isCurrentMonth && (
                        <div className="text-xs text-blue-600">{day.monthName}</div>
                      )}
                    </div>
                    <div className="text-lg font-semibold text-blue-700">{dayName}</div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-blue-400 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </button>
              );
            }
            
            // Regular available dates - MAKE THEM BUTTONS AND FULL WIDTH
            return (
              <button
                key={index}
                onClick={() => handleDateSelect(day.date)}
                className={`${baseContainerClasses} ${day.isCurrentMonth ? 'bg-white text-gray-800' : 'bg-gray-50 text-gray-500'} hover:bg-green-50 hover:border-green-200 cursor-pointer border-2 border-transparent hover:border-green-300 hover:shadow-sm`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center min-w-[60px]">
                    <div className="text-sm font-medium group-hover:font-semibold group-hover:text-green-700">{dayAbbr}</div>
                    <div className="text-2xl font-medium group-hover:font-bold group-hover:text-green-700">{day.day}</div>
                    {!day.isCurrentMonth && (
                      <div className="text-xs group-hover:text-green-600">{day.monthName}</div>
                    )}
                  </div>
                  <div className="text-lg font-medium group-hover:font-semibold group-hover:text-green-700">{dayName}</div>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-green-400 group-hover:bg-green-100 flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full group-hover:bg-green-500"></div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend - More Descriptive */}
       {/*  <div className="mt-6 mb-4">
          <div className="text-sm font-semibold text-gray-700 mb-3">Legend</div>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-600">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Selected Date</p>
                <p className="text-xs text-gray-500">Currently chosen appointment date</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border-2 border-gray-300">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Available Date</p>
                <p className="text-xs text-gray-500">Click to select this date</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 border-2 border-blue-300">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Today</p>
                <p className="text-xs text-gray-500">Current date</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 border-2 border-gray-300">
                <X className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Unavailable</p>
                <p className="text-xs text-gray-500">Booked or past date</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Selected Date Display */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Selected Date</p>
                <p className="font-semibold text-gray-800">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onDateSelect(null);
                onTimeReset();
              }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-2 rounded-lg hover:bg-white"
            >
              <X className="w-4 h-4" />
              Change
            </button>
          </div>
        </div>
      )}

      {/* No Available Dates State */}
      {!loadingCalendar && workCalandar && availableDatesCount === 0 && (
        <div className="mt-6 p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-amber-800 mb-2">No Available Dates</h3>
          <p className="text-amber-700 text-sm">
            There are no available dates this month. Please try another month or contact for special arrangements.
          </p>
        </div>
      )}
    </div>
  );
}