"use client";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { Loader2 } from "lucide-react";

import ProvidersMap from "./ProvidersMap";

const dayMap = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export default function FindBooking({ providers, events, locations }) {
  const providerArray = Array.isArray(providers)
    ? providers
    : Object.values(providers || {});
  const eventArray = Array.isArray(events)
    ? events
    : Object.values(events || {});

  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [workCalandar, setWorkCalandar] = useState(null);
  const [firstDay, setFirstDay] = useState(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [slots, setSlots] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  console.log("userLocation: ", userLocation);

  useEffect(() => {
    if (!selectedProvider) return;
    const fetchData = async () => {
      try {
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const performerId = selectedProvider;

        const [calRes, dayRes] = await Promise.all([
          fetch(`/api/work-calendar?year=${year}&month=${month}&performerId=${performerId}`),
          fetch(`/api/first-day?year=${year}&month=${month}&performerId=${performerId}`),
        ]);

        const calData = await calRes.json();
        const dayData = await dayRes.json();

        setWorkCalandar(calData);
        setFirstDay(dayData);
      } catch (err) {
        console.error("Error fetching calendar:", err);
      }
    };
    fetchData();
  }, [selectedProvider]);

  useEffect(() => {
    if (!selectedDate || !workCalandar) {
      setSlots([]);
      return;
    }

    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${d}`;

    const dayInfo = workCalandar[key];
    if (!dayInfo || parseInt(dayInfo.is_day_off) === 1) {
      setSlots([]);
      return;
    }

    let [startHour, startMin] = dayInfo.from.split(":").map(Number);
    let [endHour, endMin] = dayInfo.to.split(":").map(Number);

    const slotsArr = [];
    const start = new Date(selectedDate);
    start.setHours(startHour, startMin, 0, 0);

    const end = new Date(selectedDate);
    end.setHours(endHour, endMin, 0, 0);

    let current = new Date(start);
    while (current < end) {
      const hh = String(current.getHours()).padStart(2, "0");
      const mm = String(current.getMinutes()).padStart(2, "0");
      slotsArr.push(`${hh}:${mm}`);
      current.setMinutes(current.getMinutes() + 30);
    }

    setSlots(slotsArr);
  }, [selectedDate, workCalandar]);

  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const currentStep = selectedTime
    ? 4
    : selectedDate
    ? 3
    : selectedProvider
    ? 2
    : selectedEvent
    ? 1
    : 0;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Location error:", err)
    );
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 mb-20 p-6 space-y-8 bg-gradient-to-br from-indigo-50 to-white shadow-2xl rounded-3xl border border-gray-200">
      <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
        Book Your Appointment
      </h1>

      {/* Step Progress Bar */}
      <div className="flex justify-between items-center mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex-1 relative">
            <div
              className={`w-10 h-10 relative z-[999999] mx-auto rounded-full flex items-center justify-center text-white font-bold ${
                currentStep >= step ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={`absolute top-5 left-1/2 w-full h-1 -translate-x-1/2 ${
                  currentStep > step ? "bg-indigo-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Event */}
      <div>
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Step 1: Event</h2>
        <select
          value={selectedEvent}
          onChange={(e) => {
            setSelectedEvent(e.target.value);
            setSelectedProvider("");
            setSelectedDate(null);
            setSelectedTime("");
          }}
          className="w-full p-4 border border-gray-300 rounded-2xl bg-white shadow-md focus:ring-2 focus:ring-indigo-500 transition-all duration-200 hover:shadow-lg"
        >
          <option value="">-- Select an event --</option>
          {eventArray.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: Provider */}
      {selectedEvent && (
        <>
          <ProvidersMap locations={locations} userLocation={userLocation} />
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Step 2: Provider</h2>
            <select
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                setSelectedDate(null);
                setSelectedTime("");
              }}
              className="w-full p-4 border border-gray-300 rounded-2xl bg-white shadow-md focus:ring-2 focus:ring-indigo-500 transition-all duration-200 hover:shadow-lg"
            >
              <option value="">-- Select a provider --</option>
              {providerArray.map((p) => {
                const locationArray = Array.isArray(locations)
                  ? locations
                  : Object.values(locations || {});

                const providerLocations = p.locations
                  ?.map((locId) => {
                    const loc = locationArray.find((l) => l.id === locId);
                    return loc ? loc : null;
                  })
                  .filter(Boolean);

                const [userLat, userLng] = userLocation;

                if(providerLocations.length < 1){
                  return;
                }

                const dist = getDistance(userLat, userLng, parseFloat(providerLocations[0].lat), parseFloat(providerLocations[0].lng));

                if(dist > 20){
                  return;
                }

                return (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                );
              })}
            </select>
          </div>
        </>
      )}

      {/* Step 3: Date Picker */}
      {selectedProvider && workCalandar && (
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Step 3: Pick a Date</h2>
          <div className="relative border rounded-2xl overflow-hidden shadow-md">
            {loadingCalendar && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            )}
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setSelectedTime("");
              }}
              inline
              calendarClassName="max-w-full"
              wrapperClassName="w-full"
              filterDate={(date) => {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, "0");
                const d = String(date.getDate()).padStart(2, "0");
                const key = `${y}-${m}-${d}`;
                return workCalandar?.[key] && parseInt(workCalandar[key].is_day_off) === 0;
              }}
              onMonthChange={async (date) => {
                setLoadingCalendar(true);
                try {
                  const year = date.getFullYear();
                  const month = date.getMonth() + 1;
                  const performerId = selectedProvider;

                  const res = await fetch(
                    `/api/work-calendar?year=${year}&month=${month}&performerId=${performerId}`
                  );
                  const data = await res.json();
                  setWorkCalandar(data);
                } catch (err) {
                  console.error(err);
                } finally {
                  setLoadingCalendar(false);
                }
              }}
              disabled={loadingCalendar}
            />
          </div>
        </div>
      )}

      {/* Step 4: Times */}
      {selectedDate && (
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            Step 4: Select Time ({dayMap[selectedDate.getDay()]}, {selectedDate.toLocaleDateString()})
          </h2>
          <div className="flex flex-wrap gap-3">
            {slots.length > 0 ? (
              slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`px-5 py-2 rounded-2xl border text-sm font-medium transition-all duration-200 ${
                    selectedTime === slot
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50"
                  }`}
                >
                  {slot}
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500">No slots available</p>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {/* {selectedTime && (
        <div className="mt-6 p-5 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-700 shadow-inner">
          ✅ You selected: <br />
          <strong>{selectedEvent}</strong> with <strong>{selectedProvider}</strong> on{" "}
          <strong>
            {dayMap[selectedDate.getDay()]}, {selectedDate.toLocaleDateString()}
          </strong>{" "}
          at <strong>{selectedTime}</strong>
        </div>
      )} */}
    </div>
  );
}
