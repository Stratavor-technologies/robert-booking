import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

export default function AvailabilitySection({
    workCalandar,
    selectedDate,
    selectedTime,
    slots,
    onDateSelect,
    onTimeSelect,
    loadingCalendar,
    loadingTimeSlots,
}) {
    const [weeks, setWeeks] = useState([]);
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [expandedDateKey, setExpandedDateKey] = useState(null);
    const [dayTimeRanges, setDayTimeRanges] = useState({});
    const today = new Date();
    today.setHours(0, 0, 0, 0);


    const getLocalDateKey = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const formatTime = (time) => {
        if (!time) return "";

        const [hourStr, minuteStr] = time.split(":");
        let hour = parseInt(hourStr, 10);
        const minutes = minuteStr || "00";

        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12; // convert 0 → 12

        return minutes === "00"
            ? `${hour} ${ampm}`
            : `${hour}:${minutes} ${ampm}`;
    };

    const resolveTimeRange = (dayInfo) => {
        if (!dayInfo) return "OFF";

        const isDayOff =
            dayInfo.is_day_off === 1 ||
            dayInfo.is_day_off === "1" ||
            dayInfo.is_day_off === true;

        if (isDayOff) return "OFF";

        if (dayInfo.from && dayInfo.to) {
            return `${formatTime(dayInfo.from)} – ${formatTime(dayInfo.to)}`;
        }

        return "Available";
    };


    useEffect(() => {
        if (!selectedDate || !Array.isArray(slots) || slots.length === 0) return;

        const key = selectedDate.toISOString().split("T")[0];

        setDayTimeRanges(prev => ({
            ...prev,
            [key]: `${slots[0]} – ${slots[slots.length - 1]}`
        }));
    }, [selectedDate, slots]);


    /* =========================
       BUILD WEEKS (MONTH BASED)
       ========================= */
    useEffect(() => {
        if (!workCalandar) return;

        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const startDate = new Date(firstDay);
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        const endDate = new Date(lastDay);
        const endDay = endDate.getDay();
        endDate.setDate(endDate.getDate() + (endDay === 0 ? 0 : 7 - endDay));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tempWeeks = [];
        let currentWeek = [];
        const cursor = new Date(startDate);

        while (cursor <= endDate) {
            const date = new Date(cursor);
            date.setHours(0, 0, 0, 0);

            const key = getLocalDateKey(date);
            const dayInfo = workCalandar[key];

            const isDayOff =
                !dayInfo ||
                dayInfo.is_day_off === 1 ||
                dayInfo.is_day_off === "1" ||
                dayInfo.is_day_off === true;

            const isPast = date < today;
            const isAvailable = !isDayOff && !isPast;

            currentWeek.push({
                key,
                date,
                dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
                label: date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                }),
                isAvailable,
                isDayOff,
                isPast,
                timeLabel: resolveTimeRange(dayInfo),
            });

            if (currentWeek.length === 7) {
                tempWeeks.push(currentWeek);
                currentWeek = [];
            }

            cursor.setDate(cursor.getDate() + 1);
        }


        if (currentWeek.length) tempWeeks.push(currentWeek);

        setWeeks(tempWeeks);

        // Auto jump to first available week
        const firstAvailableWeek = tempWeeks.findIndex(week =>
            week.some(day => day.isAvailable)
        );
        setCurrentWeekIndex(firstAvailableWeek !== -1 ? firstAvailableWeek : 0);
    }, [workCalandar, currentMonth]);

    /* =========================
       HANDLERS
       ========================= */
    const handleMonthChange = (dir) => {
        const next = new Date(currentMonth);

        if (dir === "prev") {
            const prevMonth = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() - 1,
                1
            );

            // ❌ BLOCK going to months before current month
            const firstAllowedMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            if (prevMonth < firstAllowedMonth) return;

            next.setMonth(next.getMonth() - 1);
        } else {
            next.setMonth(next.getMonth() + 1);
        }

        setCurrentMonth(next);
        setExpandedDateKey(null);
    };


    const handleWeekChange = (dir) => {
        if (dir === "prev") {
            const prevWeek = weeks[currentWeekIndex - 1];
            if (!prevWeek) return;

            const hasFutureDay = prevWeek.some(day => !day.isPast);
            if (!hasFutureDay) return;

            setCurrentWeekIndex(currentWeekIndex - 1);
        } else {
            setCurrentWeekIndex(Math.min(currentWeekIndex + 1, weeks.length - 1));
        }
    };


    const handleDayClick = (day) => {
        if (!day.isAvailable) return;

        setExpandedDateKey((prevKey) => {
            // If clicking the same day → close it
            if (prevKey === day.key) {
                return null;
            }

            // Otherwise open the clicked day
            onDateSelect(day.date);
            return day.key;
        });
    };


    const currentWeek = weeks[currentWeekIndex] || [];

    /* =========================
       RENDER
       ========================= */
    return (
        <div className="space-y-3">
            {/* MONTH NAV */}
            <div className="flex items-center justify-between">
                <button disabled={
                    currentMonth.getFullYear() === today.getFullYear() &&
                    currentMonth.getMonth() === today.getMonth()
                }
                onClick={() => handleMonthChange("prev")}>
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-sm font-bold">
                    {currentMonth.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                    })}
                </div>
                <button onClick={() => handleMonthChange("next")}>
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* WEEK NAV */}
            <div className="flex items-center justify-between text-xs text-gray-500">
                <button  disabled={
                    currentWeekIndex === 0 ||
                    !weeks[currentWeekIndex - 1]?.some(day => !day.isPast)
                } 
                onClick={() => handleWeekChange("prev")}>
                    <ChevronLeft className="w-4 h-4" />
                </button>
                Week {currentWeekIndex + 1} of {weeks.length}
                <button
                    disabled={currentWeekIndex === weeks.length - 1}
                    onClick={() => handleWeekChange("next")}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* DAYS */}
            {loadingCalendar ? (
                <div className="text-center py-6">
                    <div className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            ) : (
                currentWeek.map((day) => {
                    const expanded =
                        expandedDateKey === day.key &&
                        selectedDate?.toDateString() === day.date.toDateString();

                    return (
                        <div key={day.key} className="border rounded-xl overflow-hidden">
                            <button
                                onClick={() => handleDayClick(day)}
                                disabled={!day.isAvailable}
                                className={`w-full p-3 flex justify-between ${day.isAvailable ? "hover:bg-green-50" : "bg-gray-100 text-gray-400"
                                    }`}
                            >
                                <div>
                                    <div className="font-semibold">{day.dayName}</div>
                                    <div className="text-xs text-gray-500">{day.label}</div>
                                </div>
                                <div className="font-semibold">
                                    {day.isDayOff ? "OFF" : day.timeLabel}
                                </div>
                            </button>

                            {expanded && (
                                <div className="p-3 bg-gray-50 border-t">
                                    {loadingTimeSlots ? (
                                        <div className="text-center py-2">
                                            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                        </div>
                                    ) : slots.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            {slots.map((slot) => (
                                                <button
                                                    key={slot}
                                                    onClick={() => onTimeSelect(slot)}
                                                    className={`p-2 text-xs rounded-lg ${selectedTime === slot
                                                        ? "bg-orange-500 text-white"
                                                        : "bg-white border"
                                                        }`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Clock className="w-4 h-4" />
                                            No slots available
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
