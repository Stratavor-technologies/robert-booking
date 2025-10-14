import DatePicker from "react-datepicker";
import { Loader2, Calendar, CheckCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function DatePickerSection({
  selectedDate,
  workCalandar,
  loadingCalendar,
  onDateSelect,
  onTimeReset,
  onMonthChange
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDatesCount, setAvailableDatesCount] = useState(0);

  // Calculate available dates for current month
  useEffect(() => {
    if (!workCalandar) return;
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    let count = 0;
    
    // Count available dates in the current month
    Object.keys(workCalandar).forEach(key => {
      const [y, m, d] = key.split('-').map(Number);
      if (y === year && m === month && parseInt(workCalandar[key].is_day_off) === 0) {
        count++;
      }
    });
    
    setAvailableDatesCount(count);
  }, [workCalandar, currentMonth]);

  const handleMonthChange = (date) => {
    setCurrentMonth(date);
    onMonthChange(date);
  };

  // const getDayAvailability = (date) => {
  //   const y = date.getFullYear();
  //   const m = String(date.getMonth() + 1).padStart(2, "0");
  //   const d = String(date.getDate()).padStart(2, "0");
  //   const key = `${y}-${m}-${d}`;
    
  //   // Check if the date exists in workCalendar and is not a day off
  //   return workCalandar?.[key] && parseInt(workCalandar[key].is_day_off) === 0;
  // };

  const getDayAvailability = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const key = `${y}-${m}-${d}`;

  // Disable all past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = date < today;

  if (isPast) return false; // ❌ past days disabled

  // Check if the date exists in workCalendar and is not a day off
  return workCalandar?.[key] && parseInt(workCalandar[key].is_day_off) === 0;
};


  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-gray-100">
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
          <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-200">
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

        <div className={`border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white ${
          loadingCalendar ? 'opacity-50' : ''
        }`}>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              onDateSelect(date);
              onTimeReset();
            }}
            inline
            calendarClassName="max-w-full !border-0 !shadow-none bg-transparent"
            wrapperClassName="w-full"
            filterDate={getDayAvailability}
            onMonthChange={handleMonthChange}
            disabled={loadingCalendar}
            renderCustomHeader={({
              date,
              decreaseMonth,
              increaseMonth,
              prevMonthButtonDisabled,
              nextMonthButtonDisabled,
            }) => (
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-50 to-teal-50 border-b border-gray-200">
                <button
                  onClick={decreaseMonth}
                  disabled={prevMonthButtonDisabled || loadingCalendar}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
                >
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-lg font-semibold text-gray-800">
                    {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
                  </span>
                </div>
                
                <button
                  onClick={increaseMonth}
                  disabled={nextMonthButtonDisabled || loadingCalendar}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
                >
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            dayClassName={(date) => {
              const isAvailable = getDayAvailability(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              const baseClasses = "!w-12 !h-12 rounded-xl border-2 font-medium transition-all duration-200 relative";
              
              if (date.getTime() === selectedDate?.getTime()) {
                return `${baseClasses} bg-gradient-to-br from-green-500 to-teal-600 !text-white border-green-500 shadow-lg transform scale-105`;
              }
              
              if (!isAvailable) {
                return `${baseClasses} bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed`;
              }
              
              if (isToday) {
                return `${baseClasses} bg-blue-50 text-blue-700 border-blue-300 hover:border-green-400 hover:bg-green-50 hover:text-green-700 hover:shadow-md`;
              }
              
              return `${baseClasses} bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50 hover:text-green-700 hover:shadow-md`;
            }}
            renderDayContents={(day, date) => {
              const isAvailable = getDayAvailability(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                  <span className="text-sm font-medium">{day}</span>
                  {isToday && !selectedDate && (
                    <div className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full"></div>
                  )}
                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <X className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-4 flex-wrap text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-green-500 to-teal-600"></div>
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-white border-2 border-gray-300"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-50 border-2 border-blue-300"></div>
          <span className="text-gray-600">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-100 border-2 border-gray-200 relative">
            <X className="w-2 h-2 text-gray-400 absolute inset-0 m-auto" />
          </div>
          <span className="text-gray-600">Unavailable</span>
        </div>
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