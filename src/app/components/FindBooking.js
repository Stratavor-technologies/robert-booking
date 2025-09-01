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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    privacy: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.privacy) {
      alert("You must agree to the Privacy Policy before booking.");
      return;
    }

    console.log("Booking Data:", {
      ...formData,
      selectedEvent,
      selectedProvider,
      selectedDate,
      selectedTime,
    });

    // 👉 Call API here (replace with actual booking request)
    alert("Booking submitted successfully!");
  };

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

  const requestLocation = () => {
    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      if (result.state === "granted" || result.state === "prompt") {
        // Try to get location again
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          },
          (err) => {
            console.error("Location error:", err);
          }
        );
      } else if (result.state === "denied") {
        alert("Location access is blocked. Please enable it to find the nearest providers.");
      }
    });
  };


  useEffect(() => {
    async function getIpLocation() {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        return [data.latitude, data.longitude];
      } catch (err) {
        console.error("IP location error:", err);
        return null;
      }
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        async (err) => {
          console.warn("Geolocation failed, falling back to IP:", err);
          const ipLoc = await getIpLocation();
          if (ipLoc) setUserLocation(ipLoc);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      // geolocation not supported → fallback
      getIpLocation().then((ipLoc) => {
        if (ipLoc) setUserLocation(ipLoc);
      });
    }
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

                if(!userLocation){
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  );
                }

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
      {selectedTime && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Booking Summary */}
          <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-md">
            <h3 className="text-lg font-semibold text-indigo-700 mb-4">
              Booking Summary
            </h3>
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium text-gray-700">Event</td>
                  <td className="py-2 text-gray-900">
                    {eventArray.find((event) => selectedEvent == event.id)?.name || "N/A"}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-gray-700">Provider</td>
                  <td className="py-2 text-gray-900">
                    {providerArray.find((provider) => selectedProvider == provider.id)?.name || "N/A"}
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="py-2 font-medium text-gray-700">Date</td>
                  <td className="py-2 text-gray-900">
                    {dayMap[selectedDate.getDay()]},{" "}
                    {selectedDate.toLocaleDateString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-gray-700">Time</td>
                  <td className="py-2 text-gray-900">{selectedTime}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right: Booking Form */}
          <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-md">
            <h3 className="text-lg font-semibold text-indigo-700 mb-4">
              Confirm Your Booking
            </h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex items-start">
                <input
                  id="privacy"
                  name="privacy"
                  type="checkbox"
                  checked={formData.privacy}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="privacy"
                  className="ml-2 text-sm text-gray-600"
                >
                  I agree to the{" "}
                  <a href="/privacy-policy" className="text-indigo-600 underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
