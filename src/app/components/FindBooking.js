"use client";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { Loader2 } from "lucide-react";

import ProvidersMap from "./ProvidersMap";
const LOCATIONIQ_AUTOCOMPLETE =
  "https://us1.locationiq.com/v1/autocomplete.php";

const dayMap = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export default function FindBooking({ providers, events, locations, clients }) {
  const providerArray = Array.isArray(providers)
    ? providers
    : Object.values(providers || {});
  console.log(providerArray, "providerarray");
  const eventArray = Array.isArray(events)
    ? events
    : Object.values(events || {});

  const clientsArray = Array.isArray(clients)
    ? clients
    : Object.values(clients || {});

  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [workCalandar, setWorkCalandar] = useState(null);
  const [firstDay, setFirstDay] = useState(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [slots, setSlots] = useState([]);
  // const [userLocation, setUserLocation] = useState(null);
  const [clientLocation, setClientLocation] = useState(null);
  const [searchWithin, setSearchWithin] = useState(20);
  const [selectedClient, setSelectedClient] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchedAddress, setIsSearchedAddress] = useState(false);
  const [limitedLocations, setLimitedLocations] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    privacy: false,
  });

  const [address, setAddress] = useState({
    email: "",
    phone: "",
    street1: "",
    city: "",
    zip: "",
    state: "",
    country: "US",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const [services, setServices] = useState({
    manicure: false,
    manicureGel: false,
    pedicure: false,
    pedicureGel: false,
    eyelashFull: false,
    eyelashRefill: false,
    waxEyebrows: false,
    waxLips: false,
  });

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setServices((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.privacy) {
      alert("You must agree to the Privacy Policy before booking.");
      return;
    }

    const bookingData = {
      provider: selectedProvider,
      date: selectedDate,
      time: selectedTime,
      fullname: formData.name,
      email: formData.email,
      phonenumber: formData.phone,
      clientaddress: {
        streetaddress: address.street1,
        city: address.city,
        state: address.state,
        zip: address.zip,
      },
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!res.ok) {
        throw new Error("Failed to create booking");
      }

      const data = await res.json();
      console.log("✅ Booking created:", data);

      // Clear form or show success message
      setFormData({ name: "", email: "", phone: "", privacy: false });
      setAddress({ email: "", phone: "", street1: "", city: "", zip: "", state: "", country: "US" });

    } catch (err) {
      console.error("❌ Error creating booking:", err);
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `${LOCATIONIQ_AUTOCOMPLETE}?key=pk.6e77c85892d2eafd57fef22405d53630&q=${encodeURIComponent(
          value
        )}&limit=5&format=json`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Autocomplete error:", err);
    }
  };

  const handleSearchSelect = (place) => {
    setQuery(place.display_name);
    setSuggestions([]);
    // if (onSelect) {
    // onSelect({
    //   lat: parseFloat(place.lat),
    //   lng: parseFloat(place.lon),
    //   displayName: place.display_name,
    // });
    console.log("here it is", place);
    setClientLocation([place.lat, place.lon]);
    // }
  };

  useEffect(() => {
    if (!selectedProvider) return;
    const fetchData = async () => {
      try {
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const performerId = selectedProvider;

        const [calRes, dayRes] = await Promise.all([
          fetch(
            `/api/work-calendar?year=${year}&month=${month}&performerId=${performerId}`
          ),
          fetch(
            `/api/first-day?year=${year}&month=${month}&performerId=${performerId}`
          ),
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
    const R = 3958.8;
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

  const LOCATIONIQ_API = "https://us1.locationiq.com/v1/search";

  // async function getLatLngFromAddress(client) {
  //   const fullAddress = [
  //     client.address1,
  //     client.city,
  //     client.country_id,
  //   ].filter(Boolean).join(", ");

  //   const res = await fetch(
  //     `${LOCATIONIQ_API}?key=pk.6e77c85892d2eafd57fef22405d53630&q=${encodeURIComponent(fullAddress)}&format=json&limit=1`
  //   );

  //   const data = await res.json();
  //   if (!Array.isArray(data) || data.length === 0) {
  //     throw new Error("No location found");
  //   }

  //   return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  // }

  async function getLatLngFromAddress(client) {
    const fullAddress = [
      client.address1,
      client.address2,
      client.city,
      client.zip,
      client.state,
      client.country,
    ]
      .filter(Boolean)
      .join(", ");

    const res = await fetch(
      `${LOCATIONIQ_API}?key=pk.6e77c85892d2eafd57fef22405d53630&q=${encodeURIComponent(
        fullAddress
      )}&format=json&limit=1`
    );

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No location found");
    }

    setIsSearchedAddress(true);
    setClientLocation([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
  }

  useEffect(() => {
    if (!providerArray || providerArray.length === 0) {
      setFilteredProviders([]);
      return;
    }

    // If no client location → show all providers
    if (!clientLocation) {
      setFilteredProviders(providerArray);
      return;
    }

    const [userLat, userLng] = clientLocation;

    const locationArray = Array.isArray(locations)
      ? locations
      : Object.values(locations || {});

    const providersWithDistance = providerArray
      .map((p) => {
        const providerLocations = p.locations
          ?.map((locId) => locationArray.find((l) => l.id === locId))
          .filter(Boolean);

        if (!providerLocations || providerLocations.length === 0) {
          return null;
        }

        let minDist = Infinity;
        providerLocations.forEach((loc) => {
          const dist = getDistance(
            userLat,
            userLng,
            parseFloat(loc.lat),
            parseFloat(loc.lng)
          );
          if (dist < minDist) minDist = dist;
        });

        return {
          ...p,
          distance: minDist,
          nearestLocation: providerLocations[0], // use first location for display
        };
      })
      .filter(Boolean)
      .filter((p) => p.distance <= searchWithin);

    // Sort by nearest
    providersWithDistance.sort((a, b) => a.distance - b.distance);

    // Limit to 4 providers
    const limitedProviders =
      providersWithDistance.length > 4
        ? providersWithDistance.slice(0, 4)
        : providersWithDistance;

    setFilteredProviders(limitedProviders);
  }, [clientLocation, searchWithin, providerArray, locations]);

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 mb-20 p-6 space-y-8 bg-gradient-to-br from-indigo-50 to-white shadow-2xl rounded-3xl border border-gray-200">
      <h1 className="text-4xl font-extrabold text-center text-indigo-700">
        Book Your Appointment
      </h1>
      <div className="max-w-xl mx-auto bg-white shadow-xl rounded-2xl p-10 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-700">
          Find Door-to-Door Services
        </h2>
        <p className="text-center text-gray-500 text-base">
          Let's see what services are near you. Enter the details:
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={address.email}
              onChange={handleFieldChange}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={address.phone}
              onChange={handleFieldChange}
              placeholder="Enter your phone number"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Street Address</label>
            <input
              type="text"
              name="street1"
              value={address.street1}
              onChange={handleFieldChange}
              placeholder="123 Main St"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={address.city}
                onChange={handleFieldChange}
                placeholder="City"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={address.state}
                onChange={handleFieldChange}
                placeholder="State"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">ZIP Code</label>
            <input
              type="text"
              name="zip"
              value={address.zip}
              onChange={handleFieldChange}
              placeholder="123456"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          <button
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:opacity-90 transition"
            onClick={() => getLatLngFromAddress(address)}
          >
            🔍 Search Client Address
          </button>
        </div>
      </div>

      {isSearchedAddress && (
        <div className="my-10 max-w-xl mx-auto space-y-6">
          {/* Main heading */}
          <h2 className="text-3xl font-extrabold text-center text-indigo-700">
            {filteredProviders.length} Service Providers Found Near You
          </h2>

          {filteredProviders.length > 0 && (
            <>
              {/* Sub heading */}
              <h3 className="text-lg font-medium text-center text-gray-600">
                Adjust your search range
              </h3>

              {/* Range box */}
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Left label */}
                <span className="px-5 py-3 text-gray-600 font-medium bg-gray-50">
                  Within
                </span>

                {/* Input */}
                <input
                  value={searchWithin}
                  type="number"
                  onChange={(e) => setSearchWithin(e.target.value)}
                  className="flex-1 p-3 text-gray-900 placeholder-gray-400 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Enter number"
                />

                {/* Right label */}
                <span className="px-5 py-3 text-gray-600 font-medium bg-gray-50">
                  Miles
                </span>
              </div>
            </>)}
        </div>
      )}

      {filteredProviders.length === 0 && (
        <h3 className="text-lg font-medium text-center text-gray-600">
          Door-To-Door does not currently have service providers. If you provide an email, we will send a notification when services become available. 
        </h3>
      )}

      {/* Step 2: Provider */}
      {filteredProviders.length > 0 && clientLocation && (
        <>
          <ProvidersMap
            locations={locations}
            userLocation={clientLocation}
            searchWithin={searchWithin}
          />

          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Step 2: Provider
            </h2>

            <div className="space-y-4">
              {filteredProviders.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProvider(p.id);
                    setSelectedDate(null);
                    setSelectedTime("");
                  }}
                  className={`flex gap-4 p-4 rounded-lg border cursor-pointer transition-all
            ${selectedProvider === p.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white hover:shadow-md"
                    }`}
                >
                  {/* Image */}
                  <div className="w-28 h-24 flex-shrink-0">
                    <img
                      src={
                        p.picture_path
                          ? process.env.NEXT_PUBLIC_BASE_URL_IMAGE + p.picture_path
                          : "/images/placeholder.jpg"
                      }
                      alt={p.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-center">
                    <p className="text-base font-bold">{p.name}</p>
                    {p.nearestLocation && (
                      <p className="text-sm text-gray-600">{p.nearestLocation.address}</p>
                    )}
                    {p.distance && (
                      <p className="text-sm text-gray-600">
                        {p.distance.toFixed(1)} mi away
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {filteredProviders.length > 0 && selectedProvider && workCalandar && (
        <div className="my-6">
          <h2 className="text-lg font-semibold mb-4">Services Needed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="manicure"
                  checked={services.manicure}
                  onChange={handleCheckboxChange}
                  className="form-checkbox"
                />
                <span>Manicure</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="manicureGel"
                  checked={services.manicureGel}
                  onChange={handleCheckboxChange}
                  className="form-checkbox"
                />
                <span>Manicure-Gel</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="pedicure"
                  checked={services.pedicure}
                  onChange={handleCheckboxChange}
                  className="form-checkbox"
                />
                <span>Pedicure</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="pedicureGel"
                  checked={services.pedicureGel}
                  onChange={handleCheckboxChange}
                  className="form-checkbox"
                />
                <span>Pedicure-Gel</span>
              </label>
            </div>

            {/* Right Side */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="eyelashFull"
                  checked={services.eyelashFull}
                  onChange={handleCheckboxChange}
                  className="form-checkbox"
                />
                <span>EyeLash-Full set</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="eyelashRefill"
                  checked={services.eyelashRefill}
                  onChange={handleCheckboxChange}
                  className="form-checkbox"
                />
                <span>EyeLash-Refill</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="waxEyebrows"
                  checked={services.waxEyebrows}
                  onChange={handleCheckboxChange}
                  className="form-checkbox"
                />
                <span>Wax-Eye Brows</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="waxLips"
                  checked={services.waxLips}
                  onChange={handleCheckboxChange}
                  className="form-checkbox"
                />
                <span>Wax-Lips</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Date Picker */}
      {filteredProviders.length > 0 && selectedProvider && workCalandar && (
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            Step 3: Pick a Date
          </h2>
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
                return (
                  workCalandar?.[key] &&
                  parseInt(workCalandar[key].is_day_off) === 0
                );
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
      {filteredProviders.length > 0 && selectedDate && (
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            Step 4: Select Time ({dayMap[selectedDate.getDay()]},{" "}
            {selectedDate.toLocaleDateString()})
          </h2>
          <div className="flex flex-wrap gap-3">
            {slots.length > 0 ? (
              slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`px-5 py-2 rounded-2xl border text-sm font-medium transition-all duration-200 ${selectedTime === slot
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
      {filteredProviders.length > 0 && selectedTime && (
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
                    {eventArray.find((event) => selectedEvent == event.id)
                      ?.name || "N/A"}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-gray-700">Provider</td>
                  <td className="py-2 text-gray-900">
                    {providerArray.find(
                      (provider) => selectedProvider == provider.id
                    )?.name || "N/A"}
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
                <label htmlFor="privacy" className="ml-2 text-sm text-gray-600">
                  I agree to the{" "}
                  <a
                    href="/privacy-policy"
                    className="text-indigo-600 underline"
                  >
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
