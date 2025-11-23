"use client";
import { useState, useEffect, useRef } from "react";

export default function SearchSection({
  address,
  searchWithin,
  userEmail,
  onFieldChange,
  onSearchWithinChange,
  onUserEmailChange,
  onSearchClick,
  loadingAddress = false,
  currentEmail,
  onBackToHome,
}) {

  const usStates = [
    "AL", "AK", "AZ", "AR", "CA",
    "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS",
    "KY", "LA", "ME", "MD", "MA",
    "MI", "MN", "MS", "MO", "MT",
    "NE", "NV", "NH", "NJ", "NM",
    "NY", "NC", "ND", "OH", "OK",
    "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT",
    "VA", "WA", "WV", "WI", "WY",
  ];

  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState(address.state || "");
  const dropdownRef = useRef(null);
  const [cityError, setCityError] = useState("");


  const cityRef = useRef(null);
  const stateRef = useRef(null);
  const zipRef = useRef(null);
  const searchWithinRef = useRef(null);
  const searchButtonRef = useRef(null);

   const handleBackToHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      // Fallback if prop not provided
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const filteredStates = usStates.filter((st) =>
    st.startsWith(searchText)
  );

  const handleSelect = (state) => {
    const abbr = state.match(/\((.*?)\)/)?.[1] || state;
    setSearchText(abbr);
    setShowDropdown(false);
    onFieldChange({ target: { name: "state", value: abbr } });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle Enter key navigation
  const handleEnterNavigation = (currentField, nextField) => {
    return (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (nextField === "search") {
          searchButtonRef.current?.click();
        } else {
          nextField?.current?.focus();
        }
      }
    };
  };

  // Handle Tab key to close dropdown and navigate
  const handleTabNavigation = (e) => {
    if (e.key === "Tab") {
      setShowDropdown(false);
      // Let the default Tab behavior happen
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 space-y-8 border border-white/20 relative overflow-hidden">
      {/* Gradient header bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

      {/* Home Button - Top Right */}
      <button
        onClick={onBackToHome}
        className="absolute top-4 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl z-10 flex items-center gap-2"
      >
        Home
      </button>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-2">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Find Door-to-Door Services
        </h2>
        <p className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto">
          Discover local service providers ready to come to you
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* City, State, ZIP Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* City */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Enter Your City
            </label>
            <input
              ref={cityRef}
              type="text"
              name="city"
              value={address.city}
              onChange={(e) => {
                const value = e.target.value;

                // Allow only letters, spaces, hyphens, and apostrophes
                if (!/^[A-Za-z\s\-']*$/.test(value)) return;

                onFieldChange(e);

                if (value.trim() === "") {
                  setCityError("");
                  return;
                }

                const isValidCityName = (cityName) => {
                  if (!cityName || cityName.trim() === "") return true;
                  const name = cityName.trim();

                  // For 1 letter - always valid (no error)
                  if (name.length === 1) return true;

                  // For 2-3 letters - check if it looks like a real city name
                  if (name.length >= 2 && name.length <= 3) {
                    // Must contain at least one vowel
                    const hasVowel = /[aeiou]/i.test(name);
                    // Must not be all consonants
                    const allConsonants = /^[bcdfghjklmnpqrstvwxyz]+$/i.test(name);

                    if (!hasVowel || allConsonants) {
                      return false;
                    }
                  }

                  // For longer names, use your existing validation
                  if (name.length >= 4) {
                    // Must contain at least one vowel
                    const vowels = (name.match(/[aeiou]/gi) || []).length;
                    const consonants = (name.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;
                    if (vowels === 0) return false;

                    const totalLetters = vowels + consonants;
                    // Vowel-to-consonant ratio check
                    if (totalLetters > 3 && vowels / totalLetters < 0.2) return false;

                    // No triple consecutive identical letters
                    if (/([a-z])\1\1/i.test(name)) return false;

                    // No more than 3 consecutive consonants
                    if (/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(name)) return false;

                    // Common keyboard patterns and gibberish detection
                    const commonPatterns = [
                      'qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', '123456',
                      'abcdef', 'qweasd', 'yxcvbn', 'poiuyt', 'lkjhgf',
                      'jib', 'wjib', 'bwivbf', 'qihkfbwhef', 'qyvcfefvgqbab', 'bbeuadb'
                    ];

                    if (commonPatterns.some(pattern => name.toLowerCase().includes(pattern))) {
                      return false;
                    }
                  }

                  return true;
                };

                if (!isValidCityName(value)) {
                  setCityError("Please enter a valid city name");
                } else {
                  setCityError("");
                }
              }}
              placeholder="City"
              maxLength={50}
              disabled={loadingAddress}
              onKeyDown={handleEnterNavigation("city", stateRef)}
              className={`w-full border border-gray-200 rounded-xl px-4 py-3.5
      focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400
      bg-white/50 shadow-sm hover:shadow-md text-black placeholder-gray-400
      ${loadingAddress ? "opacity-50 cursor-not-allowed" : ""}
      ${cityError ? "border-red-500 focus:border-red-500 focus:ring-red-400" : ""}
    `}
            />

            {/* ERROR MESSAGE BELOW CITY INPUT */}
            {cityError && (
              <p className="text-red-500 text-sm mt-1">{cityError}</p>
            )}
          </div>

          {/* State (Custom Combo Box) */}
          <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Enter Your State
            </label>

            <div className="relative">
              <input
                ref={stateRef}
                type="text"
                name="state"
                value={searchText}
                onChange={(e) => {
                  let value = e.target.value.toUpperCase();
                  if (!/^[A-Za-z]*$/.test(value)) return;
                  if (value.length > 2) return;
                  const matches = usStates.filter((st) => st.startsWith(value));
                  if (value !== "" && matches.length === 0) return;
                  setSearchText(value);
                  setShowDropdown(true);

                  onFieldChange({
                    target: { name: "state", value }
                  });
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    zipRef.current?.focus();
                  }
                  handleTabNavigation(e);
                }}
                placeholder="State"
                disabled={loadingAddress}
                className={`w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/50 shadow-sm hover:shadow-md text-black ${loadingAddress ? "opacity-50 cursor-not-allowed" : ""}`}
              />

              <svg
                onClick={() => setShowDropdown(!showDropdown)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 cursor-pointer"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>

              {showDropdown && (
                <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
                  {filteredStates.length > 0 ? (
                    filteredStates.map((state) => (
                      <li
                        key={state}
                        onClick={() => {
                          setSearchText(state.toUpperCase());
                          setShowDropdown(false);
                          onFieldChange({ target: { name: "state", value: state.toUpperCase() } });
                          zipRef.current?.focus(); // Auto-focus next field after selection
                        }}
                        className="px-4 py-2 hover:bg-indigo-100 cursor-pointer text-gray-700"
                      >
                        {state}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-gray-400">No results found</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* ZIP */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l9 6 9-6M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" />
              </svg>
              Enter Your ZIP
            </label>
            <input
              ref={zipRef}
              type="text"
              name="zip"
              value={address.zip}
              onChange={onFieldChange}
              placeholder="ZIP code"
              disabled={loadingAddress}
              onKeyDown={handleEnterNavigation("zip", searchWithinRef)}
              className={`w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/50 shadow-sm hover:shadow-md text-black placeholder-gray-400 ${loadingAddress ? "opacity-50 cursor-not-allowed" : ""
                }`}
            />
          </div>
        </div>

        {/* Search Area + Button */}
        <SearchWithinInput
          searchWithin={searchWithin}
          onChange={onSearchWithinChange}
          disabled={loadingAddress}
          searchWithinRef={searchWithinRef}
          onKeyDown={handleEnterNavigation("searchWithin", "search")}
        />
        <button
          ref={searchButtonRef}
          onClick={onSearchClick}
          id="searchButton"
          disabled={loadingAddress}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Tab") {
              e.preventDefault();
              onSearchClick();
            }
          }}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:scale-[1.02] transition-all duration-200"
        >
          {loadingAddress ? "Searching..." : "Search Service Providers"}
        </button>
      </div>
    </div>
  );
}

function SearchWithinInput({ searchWithin, onChange, disabled = false, searchWithinRef, onKeyDown }) {
  return (
    <div
      className={`flex items-center bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 ${disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
    >
      <span className="px-5 py-3.5 text-gray-600 font-semibold bg-gray-50 border-r border-gray-200 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        Within
      </span>
      <input
        ref={searchWithinRef}
        type="number"
        value={searchWithin}
        min={1}
        max={40}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (value <= 40 && value >= 1) {
            onChange(value);
          }
        }}
        disabled={disabled}
        onKeyDown={onKeyDown}
        className="flex-1 p-3.5 text-black placeholder-black text-center font-semibold focus:outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
        placeholder="1–20"
      />
      <span className="px-5 py-3.5 text-gray-600 font-semibold bg-gray-50 border-l border-gray-200">
        Miles
      </span>
    </div>
  );
}