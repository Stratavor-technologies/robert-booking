"use client";
import { useState } from "react";

export default function FindBooking({ providers, events }) {
  // Convert object → array for providers
  const providerArray = Array.isArray(providers)
    ? providers
    : Object.values(providers || {});

  // Convert object → array for events
  const eventArray = Array.isArray(events)
    ? events
    : Object.values(events || {});

  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");

  return (
    <div className="max-w-md mx-auto mt-10 mb-10 p-6 space-y-6 bg-gradient-to-br from-indigo-50 to-white shadow-xl rounded-2xl border border-gray-200">
      <h1 className="text-2xl font-bold text-center text-indigo-700 mb-6">
        Book Your Appointment
      </h1>

      {/* Step 1: Select Event */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Step 1: Choose Event</h2>
        <select
          value={selectedEvent}
          onChange={(e) => {
            setSelectedEvent(e.target.value);
            setSelectedProvider(""); // reset provider when event changes
          }}
          className="w-full p-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700"
        >
          <option value="">-- Select an event --</option>
          {eventArray.map((e) => (
            <option key={e.id} value={e.name}>
              {e.name}
            </option>
          ))}
        </select>

        {selectedEvent && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700">
            Selected Event: <strong>{selectedEvent}</strong>
          </div>
        )}
      </div>

      {/* Step 2: Select Provider (only visible after event is selected) */}
      {selectedEvent && (
        <div className="animate-fadeIn">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Step 2: Choose Provider</h2>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
          >
            <option value="">-- Select a provider --</option>
            {providerArray.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          {selectedProvider && (
            <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700">
              Selected Provider: <strong>{selectedProvider}</strong>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
