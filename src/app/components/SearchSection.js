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
  const [validationErrors, setValidationErrors] = useState({
    city: "",
    state: "",
    zip: "",
    searchWithin: ""
  });

  const cityRef = useRef(null);
  const stateRef = useRef(null);
  const zipRef = useRef(null);
  const searchWithinRef = useRef(null);
  const searchButtonRef = useRef(null);

  const [resetTrigger, setResetTrigger] = useState(false);

  const resetForm = () => {
    setSearchText("");
    setShowDropdown(false);
    setValidationErrors({
      city: "",
      state: "",
      zip: "",
      searchWithin: ""
    });
    if (onFieldChange) {
      onFieldChange({ target: { name: "city", value: "" } });
      onFieldChange({ target: { name: "state", value: "" } });
      onFieldChange({ target: { name: "zip", value: "" } });
    }
    if (onSearchWithinChange) {
      onSearchWithinChange(10);
    }
  };
  useEffect(() => {
    resetForm();
  }, [resetTrigger]);

  const handleBackToHome = () => {
    resetForm();
    if (onBackToHome) {
      onBackToHome();
    } else {
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
    setValidationErrors(prev => ({ ...prev, state: "" }));
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
  function getCaretIndexFromClick(input, clickX) {
    const style = window.getComputedStyle(input);
    const font = `${style.fontSize} ${style.fontFamily}`;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = font;

    const paddingLeft = parseFloat(style.paddingLeft);
    const x = clickX - paddingLeft;

    let width = 0;

    for (let i = 0; i < input.value.length; i++) {
      const charWidth = ctx.measureText(input.value[i]).width;

      if (width + charWidth / 2 > x) {
        return i;
      }

      width += charWidth;
    }

    return input.value.length;
  }

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

  const handleTabNavigation = (e, currentField, nextField) => {
    if (e.key === "Tab") {
      e.preventDefault();

      if (currentField === "searchWithin" && nextField === "city") {
        cityRef.current?.focus();
      } else if (nextField === "search") {
        cityRef.current?.focus();
      } else {
        nextField?.current?.focus();
      }

      if (currentField === "state") {
        setShowDropdown(false);
      }
    }
  };

  // Helper function to validate city name
  const validateCityName = (cityName) => {
    if (!cityName?.trim()) return "City is required";

    const name = cityName.trim();
    
    // Basic length check
    if (name.length < 2) return "Please enter a valid city name";
    
    // Check for invalid characters
    if (!/^[A-Za-z\s\-']+$/.test(name)) return "Please enter a valid city name";

    // Check for at least one vowel
    if (!/[aeiou]/i.test(name)) return "Please enter a valid city name";

    // Check for consecutive consonants (max 3)
    if (/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(name)) return "Please enter a valid city name";

    // Check for common invalid patterns
    const commonPatterns = [
      "qwerty", "asdfgh", "zxcvbn", "qazwsx", "123456",
      "abcdef", "qweasd", "yxcvbn", "poiuyt", "lkjhgf",
      "jib", "wjib", "bwivbf", "qihkfbwhef", "qyvcfefvgqbab", "bbeuadb"
    ];

    if (commonPatterns.some(p => name.toLowerCase().includes(p))) {
      return "Please enter a valid city name";
    }

    // Check vowel-to-consonant ratio
    if (name.length >= 4) {
      const vowels = (name.match(/[aeiou]/gi) || []).length;
      const consonants = (name.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;
      const totalLetters = vowels + consonants;
      
      if (totalLetters > 3 && vowels / totalLetters < 0.2) {
        return "Please enter a valid city name";
      }
    }

    return ""; // No error
  };

  const validateAllFields = () => {
    const errors = {
      city: "",
      state: "",
      zip: "",
      searchWithin: ""
    };

    let isValid = true;

    // Validate city (only when search button is clicked)
    const cityValidationError = validateCityName(address.city);
    if (cityValidationError) {
      errors.city = cityValidationError;
      isValid = false;
    }

    // Validate state
    if (!address.state || address.state.trim() === "") {
      errors.state = "State is required";
      isValid = false;
    } else if (!usStates.includes(address.state.toUpperCase())) {
      errors.state = "Please select a valid state";
      isValid = false;
    }

    // Validate ZIP code
    if (!address.zip || address.zip.trim() === "") {
      errors.zip = "ZIP code is required";
      isValid = false;
    } else if (!/^\d{5}(-\d{4})?$/.test(address.zip)) {
      errors.zip = "Please enter a valid 5-digit ZIP code";
      isValid = false;
    }

    // Validate search within
    if (!searchWithin || searchWithin <= 0) {
      errors.searchWithin = "Please enter a valid search radius";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSearchClick = () => {
    if (validateAllFields()) {
      onSearchClick();
    } else {
      // Focus on the first field with error
      if (validationErrors.city) cityRef.current?.focus();
      else if (validationErrors.state) stateRef.current?.focus();
      else if (validationErrors.zip) zipRef.current?.focus();
      else if (validationErrors.searchWithin) searchWithinRef.current?.focus();
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
                // Still restrict invalid characters in real-time
                if (!/^[A-Za-z\s\-']*$/.test(value)) return;
                
                // Update the value through onFieldChange
                if (onFieldChange) {
                  onFieldChange(e);
                }
                // Clear city error when user starts typing
                setValidationErrors(prev => ({ ...prev, city: "" }));
              }}
              onClick={(e) => {
                if (e.detail === 1) {
                  e.target.select();
                }
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                const input = e.target;
                const clickX = e.nativeEvent.offsetX;
                const caretIndex = getCaretIndexFromClick(input, clickX);
                input.setSelectionRange(caretIndex, caretIndex);
              }}
              onMouseDown={(e) => {
                if (e.detail > 1) {
                  e.preventDefault();
                }
              }}
              placeholder="City"
              maxLength={50}
              disabled={loadingAddress}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEnterNavigation("city", stateRef)(e);
                if (e.key === "Tab") handleTabNavigation(e, "city", stateRef);
              }}
              className={`w-full border rounded-xl px-4 py-3.5
    focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400
    bg-white/50 shadow-sm hover:shadow-md text-black placeholder-gray-400
    ${loadingAddress ? "opacity-50 cursor-not-allowed" : ""}
    ${validationErrors.city ? "border-red-500 focus:border-red-500 focus:ring-red-400" : "border-gray-200"}
  `}
            />
            {/* ERROR MESSAGE BELOW CITY INPUT */}
            {validationErrors.city && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
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
                  setValidationErrors(prev => ({ ...prev, state: "" }));

                  if (onFieldChange) {
                    onFieldChange({
                      target: { name: "state", value }
                    });
                  }
                }}
                onClick={(e) => {
                  if (e.detail === 1) {
                    e.target.select();
                  }
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  const input = e.target;
                  const clickX = e.nativeEvent.offsetX;
                  const caretIndex = getCaretIndexFromClick(input, clickX);
                  input.setSelectionRange(caretIndex, caretIndex);
                }}
                onMouseDown={(e) => {
                  if (e.detail > 1) {
                    e.preventDefault();
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setShowDropdown(false);
                    zipRef.current?.focus();
                  }
                  if (e.key === "Tab") {
                    handleTabNavigation(e, "state", zipRef);
                  }
                }}
                placeholder="State"
                disabled={loadingAddress}
                className={`w-full border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/50 shadow-sm hover:shadow-md text-black ${loadingAddress ? "opacity-50 cursor-not-allowed" : ""} ${validationErrors.state ? "border-red-500 focus:border-red-500 focus:ring-red-400" : "border-gray-200"}`}
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
                          setValidationErrors(prev => ({ ...prev, state: "" }));
                          if (onFieldChange) {
                            onFieldChange({ target: { name: "state", value: state.toUpperCase() } });
                          }
                          zipRef.current?.focus();
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
            {validationErrors.state && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.state}</p>
            )}
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
              onChange={(e) => {
                if (onFieldChange) {
                  onFieldChange(e);
                }
                setValidationErrors(prev => ({ ...prev, zip: "" }));
              }}
              onClick={(e) => {
                if (e.detail === 1) {
                  e.target.select();
                }
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                const input = e.target;
                const clickX = e.nativeEvent.offsetX;
                const caretIndex = getCaretIndexFromClick(input, clickX);
                input.setSelectionRange(caretIndex, caretIndex);
              }}
              onMouseDown={(e) => {
                if (e.detail > 1) {
                  e.preventDefault();
                }
              }}
              placeholder="ZIP code"
              disabled={loadingAddress}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEnterNavigation("zip", searchWithinRef)(e);
                }
                if (e.key === "Tab") {
                  handleTabNavigation(e, "zip", searchWithinRef);
                }
              }}
              className={`w-full border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/50 shadow-sm hover:shadow-md text-black placeholder-gray-400 ${loadingAddress ? "opacity-50 cursor-not-allowed" : ""
                } ${validationErrors.zip ? "border-red-500 focus:border-red-500 focus:ring-red-400" : "border-gray-200"}`}
            />
            {validationErrors.zip && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.zip}</p>
            )}
          </div>
        </div>

        {/* Search Area + Button */}
        <SearchWithinInput
          searchWithin={searchWithin}
          onChange={(value) => {
            if (onSearchWithinChange) {
              onSearchWithinChange(value);
            }
            setValidationErrors(prev => ({ ...prev, searchWithin: "" }));
          }}
          disabled={loadingAddress}
          searchWithinRef={searchWithinRef}
          error={validationErrors.searchWithin}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEnterNavigation("searchWithin", "search")(e);
            }
            if (e.key === "Tab") {
              handleTabNavigation(e, "searchWithin", "city");
            }
          }}
          getCaretIndexFromClick={getCaretIndexFromClick}
        />
        {validationErrors.searchWithin && (
          <p className="text-red-500 text-sm -mt-3">{validationErrors.searchWithin}</p>
        )}
        <button
          ref={searchButtonRef}
          onClick={handleSearchClick}
          id="searchButton"
          disabled={loadingAddress}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearchClick();
            }
            if (e.key === "Tab") {
              handleTabNavigation(e, "search", "city");
            }
          }}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingAddress ? "Searching..." : "Search Service Providers"}
        </button>
      </div>
    </div>
  );
}

function SearchWithinInput({ searchWithin, onChange, disabled = false, searchWithinRef, onKeyDown, error, getCaretIndexFromClick }) {
  const handleChange = (e) => {
    const value = e.target.value;

    // Allow only digits
    if (!/^\d*$/.test(value)) return;

    // If value is empty, set to 0
    if (value === "") {
      onChange(0);
      return;
    }

    // Handle the case where user types "0" followed by another digit
    // Remove the "0" and keep only the new digit
    if (value.startsWith('0') && value.length > 1) {
      // Remove all leading zeros
      const withoutLeadingZeros = value.replace(/^0+/, '');
      // If after removing zeros we have something, use it
      if (withoutLeadingZeros !== "") {
        const numericValue = Number(withoutLeadingZeros);
        // Validate range
        if (numericValue <= 40 && numericValue >= 0) {
          onChange(numericValue);
        }
      } else {
        // If after removing zeros we have nothing, set to 0
        onChange(0);
      }
      return;
    }

    // Convert to number
    const numericValue = Number(value);

    // Validate range (0-40)
    if (numericValue <= 40 && numericValue >= 0) {
      onChange(numericValue);
    }
  };

  // Handle arrow key up/down
  const handleKeyDown = (e) => {
    // Call the parent's onKeyDown handler first
    if (onKeyDown) {
      onKeyDown(e);
    }

    // If Enter or Tab was handled by parent, don't process arrow keys
    if (e.key === 'Enter' || e.key === 'Tab') {
      return;
    }

    // Handle arrow up/down
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newValue = Math.min(40, searchWithin + 1);
      if (newValue !== searchWithin) {
        onChange(newValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = Math.max(0, searchWithin - 1);
      if (newValue !== searchWithin) {
        onChange(newValue);
      }
    }
  };

  // Handle arrow button clicks
  const handleArrowUpClick = () => {
    if (disabled) return;
    const newValue = Math.min(40, searchWithin + 1);
    if (newValue !== searchWithin) {
      onChange(newValue);
    }
  };

  const handleArrowDownClick = () => {
    if (disabled) return;
    const newValue = Math.max(0, searchWithin - 1);
    if (newValue !== searchWithin) {
      onChange(newValue);
    }
  };

  return (
    <div
      className={`flex items-center border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 ${disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${error ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-400" : "border-gray-200"}`}
    >
      <span className="px-5 py-3.5 text-gray-600 font-semibold bg-gray-50 border-r border-gray-200 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        Within
      </span>

      <div className="flex-1 relative">
        <input
          ref={searchWithinRef}
          type="text"
          value={searchWithin.toString()}
          onChange={handleChange}
          disabled={disabled}
          onClick={(e) => {
            if (e.detail === 1) {
              e.target.select();
            }
          }}
          onDoubleClick={(e) => {
            e.preventDefault();
            const input = e.target;
            const clickX = e.nativeEvent.offsetX;
            const caretIndex = getCaretIndexFromClick(input, clickX);
            input.setSelectionRange(caretIndex, caretIndex);
          }}
          onMouseDown={(e) => {
            if (e.detail > 1) {
              e.preventDefault();
            }
          }}
          onKeyDown={handleKeyDown}
          inputMode="numeric"
          pattern="[0-9]*"
          className={`w-full p-3.5 text-black placeholder-black text-center font-semibold focus:outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed pr-10`}
          placeholder="0"
        />

        {/* Arrow buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col space-y-0.5">
          <button
            type="button"
            onClick={handleArrowUpClick}
            disabled={disabled || searchWithin >= 40}
            className="w-6 h-5 flex items-center justify-center rounded-t-md bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase value"
          >
            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleArrowDownClick}
            disabled={disabled || searchWithin <= 0}
            className="w-6 h-5 flex items-center justify-center rounded-b-md bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease value"
          >
            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <span className="px-5 py-3.5 text-gray-600 font-semibold bg-gray-50 border-l border-gray-200">
        Miles
      </span>
    </div>
  );
}