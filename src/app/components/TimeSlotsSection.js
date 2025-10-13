// components/TimeSlotsSection.jsx
import { Clock, Loader2, CheckCircle, X } from "lucide-react";

export default function TimeSlotsSection({
  selectedDate,
  selectedTime,
  slots,
  dayMap,
  onTimeSelect,
  loadingTimeSlots = false
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">5</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Select Time
          </h2>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {dayMap[selectedDate.getDay()]}, {selectedDate.toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loadingTimeSlots ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Time Slots</h3>
          <p className="text-gray-600">Calculating available appointment times...</p>
          <div className="mt-4 flex justify-center">
            <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      ) : (
        /* Time Slots Content */
        <div className="space-y-6">
          {/* Available Slots */}
          {slots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {slots.map((slot) => (
                <TimeSlotButton
                  key={slot}
                  slot={slot}
                  isSelected={selectedTime === slot}
                  onSelect={onTimeSelect}
                />
              ))}
            </div>
          ) : (
            /* No Slots Available State */
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Time Slots Available</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                There are no available time slots for this date. Please select a different date.
              </p>
            </div>
          )}

          {/* Selected Time Display */}
          {selectedTime && (
            <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Selected Time</p>
                    <p className="text-xl font-bold text-gray-800">{selectedTime}</p>
                    <p className="text-sm text-gray-500">
                      on {dayMap[selectedDate.getDay()]}, {selectedDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onTimeSelect("")}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-4 py-2 rounded-lg hover:bg-white"
                >
                  Change Time
                </button>
              </div>
            </div>
          )}

          {/* Quick Tips */}
          {slots.length > 0 && !selectedTime && (
            <div className="flex items-center gap-3 text-sm text-gray-500 bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p>Select your preferred time slot to proceed with booking</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TimeSlotButton({ slot, isSelected, onSelect }) {
  const isMorning = slot.includes("AM");
  const isAfternoon = slot.includes("PM") && parseInt(slot) < 5;
  const isEvening = slot.includes("PM") && parseInt(slot) >= 5;

  return (
    <button
      onClick={() => onSelect(slot)}
      className={`relative p-4 rounded-2xl border-2 text-center transition-all duration-300 group overflow-hidden
        ${isSelected
          ? "border-orange-500 bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg transform scale-105"
          : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-md hover:scale-105"
        }`}
    >
      {/* Time Period Indicator */}
      {!isSelected && (
        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full
          ${isMorning ? "bg-blue-400" : isAfternoon ? "bg-amber-400" : "bg-purple-400"}
        `} />
      )}
      
      {/* Slot Content */}
      <div className="space-y-1">
        <div className={`text-lg font-semibold transition-colors
          ${isSelected ? "text-white" : "text-gray-800"}
        `}>
          {slot}
        </div>
        <div className={`text-xs font-medium transition-colors
          ${isSelected ? "text-orange-100" : "text-gray-500"}
        `}>
          {isMorning ? "Morning" : isAfternoon ? "Afternoon" : "Evening"}
        </div>
      </div>

      {/* Hover Effect */}
      {!isSelected && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl" />
      )}
    </button>
  );
}