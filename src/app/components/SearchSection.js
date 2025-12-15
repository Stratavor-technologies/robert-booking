"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import debounce from "lodash/debounce";

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
  const LOCATIONIQ_KEY = "pk.6e77c85892d2eafd57fef22405d53630";
  const LOCATIONIQ_SEARCH_URL = "https://us1.locationiq.com/v1/search";
  const LOCATIONIQ_REVERSE_URL = "https://us1.locationiq.com/v1/reverse";

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

  // State declarations
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState(address.state || "");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [zipSuggestions, setZipSuggestions] = useState([]);
  const [showZipDropdown, setShowZipDropdown] = useState(false);
  const [loadingZip, setLoadingZip] = useState(false);
  const [loadingCity, setLoadingCity] = useState(false);
  const [loadingState, setLoadingState] = useState(false);

  const dropdownRef = useRef(null);
  const zipDropdownRef = useRef(null);
  const dropdownListRef = useRef(null);

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

  // Track if dropdown should stay open (when user clicks dropdown arrow)
  const keepDropdownOpenRef = useRef(false);

  // Filter states based on search text
  const filteredStates = usStates.filter((st) =>
    st.toLowerCase().startsWith(searchText.toLowerCase())
  );

  // Enhanced helper function to normalize state name to code
  const stateNameToCode = (stateName) => {
    const stateMap = {
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
      'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'district of columbia': 'DC', 'florida': 'FL',
      'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
      'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
      'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
      'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
      'oklahota': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
      'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
    };

    if (!stateName) return '';

    // If it's already a 2-letter code, just uppercase it
    if (stateName.length === 2 && /^[A-Za-z]{2}$/.test(stateName)) {
      return stateName.toUpperCase();
    }

    // Try to extract state from display_name or other formats
    const normalizedName = stateName.toLowerCase().trim();

    // Direct mapping
    if (stateMap[normalizedName]) {
      return stateMap[normalizedName];
    }

    // Try to match partial names
    for (const [key, code] of Object.entries(stateMap)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return code;
      }
    }

    return '';
  };

  // Function to extract state from LocationIQ response
  const extractStateFromLocationData = (data) => {
    if (!data || !data.length) return '';

    const item = data[0];

    // First try to get state from address object
    if (item.address && item.address.state) {
      return stateNameToCode(item.address.state);
    }

    // If not in address, try to extract from display_name
    if (item.display_name) {
      const parts = item.display_name.split(',');

      // Look for state in the parts (usually 2nd or 3rd from end)
      for (let i = parts.length - 1; i >= Math.max(0, parts.length - 4); i--) {
        const part = parts[i].trim();
        const stateCode = stateNameToCode(part);
        if (stateCode && usStates.includes(stateCode)) {
          return stateCode;
        }
      }
    }

    return '';
  };

  // Function to extract city from LocationIQ response
  const extractCityFromLocationData = (data) => {
    if (!data || !data.length) return '';

    const item = data[0];
    let cityName = '';

    console.log('Extracting city from:', item);

    // First try to get city from address object
    if (item.address) {
      // Check multiple possible city fields
      if (item.address.city) {
        cityName = item.address.city;
        console.log('Found city in address.city:', cityName);
      } else if (item.address.town) {
        cityName = item.address.town;
        console.log('Found city in address.town:', cityName);
      } else if (item.address.village) {
        cityName = item.address.village;
        console.log('Found city in address.village:', cityName);
      } else if (item.address.municipality) {
        cityName = item.address.municipality;
        console.log('Found city in address.municipality:', cityName);
      } else if (item.address.county) {
        // Sometimes the city is in county field for small towns
        cityName = item.address.county.replace(' County', '').replace(' County', '');
        console.log('Found city in address.county (adjusted):', cityName);
      }
    }

    // If no city found in address, try to extract from display_name
    if (!cityName && item.display_name) {
      console.log('Trying to extract from display_name:', item.display_name);
      const parts = item.display_name.split(',');

      // For display_name like: "Haddonfield, Camden County, New Jersey, 08033, USA"
      // The first part is usually the city
      if (parts.length > 0) {
        cityName = parts[0].trim();
        console.log('Extracted city from first part of display_name:', cityName);

        // If the first part contains numbers (like ZIP code), try the second part
        if (/\d/.test(cityName) && parts.length > 1) {
          cityName = parts[1].trim();
          console.log('First part contained numbers, trying second part:', cityName);
        }
      }
    }

    // Clean up the city name
    if (cityName) {
      // Remove "County" suffix if present
      cityName = cityName.replace(/\s+County$/i, '');

      // Remove any trailing numbers or ZIP codes
      cityName = cityName.replace(/\s+\d{5}(-\d{4})?$/, '');

      // Remove "USA" or country names
      cityName = cityName.replace(/\s+(USA|United States)$/i, '');

      // Capitalize properly
      cityName = cityName
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase())
        .replace(/[^a-zA-Z\s\-']/g, '')
        .trim();

      console.log('Cleaned city name:', cityName);
    }

    return cityName;
  };

  // Fetch ZIP codes based on city and state
  const fetchZipCodes = async (city, state) => {
    if (!city || !state || city.length < 2) {
      setZipSuggestions([]);
      return;
    }

    setLoadingZip(true);
    try {
      const query = `${city}, ${state}, USA`;
      const response = await fetch(
        `${LOCATIONIQ_SEARCH_URL}?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&format=json&limit=5&type=postcode`
      );

      if (!response.ok) throw new Error('Failed to fetch ZIP codes');

      const data = await response.json();

      // Extract unique ZIP codes from results
      const zipCodes = [];
      data.forEach(item => {
        if (item.address && item.address.postcode) {
          const zip = item.address.postcode.split('-')[0]; // Get only first part of ZIP
          if (zip && !zipCodes.includes(zip) && /^\d{5}$/.test(zip)) {
            zipCodes.push(zip);
          }
        }
      });

      // If no ZIP codes from address, try display_name
      if (zipCodes.length === 0) {
        data.forEach(item => {
          const displayName = item.display_name || '';
          const zipMatch = displayName.match(/\b\d{5}\b/);
          if (zipMatch && !zipCodes.includes(zipMatch[0])) {
            zipCodes.push(zipMatch[0]);
          }
        });
      }

      setZipSuggestions(zipCodes);
      setShowZipDropdown(zipCodes.length > 0 && (!address.zip || address.zip.length !== 5));
    } catch (error) {
      console.error('Error fetching ZIP codes:', error);
      setZipSuggestions([]);
    } finally {
      setLoadingZip(false);
    }
  };

  // Fetch state based on city and ZIP
  const fetchStateFromCityZip = async (city, zip) => {
    if (!city || !zip || city.length < 2 || zip.length < 5) {
      return;
    }

    setLoadingState(true);
    try {
      const query = `${city}, ${zip}, USA`;
      console.log('Fetching state for:', query);

      const response = await fetch(
        `${LOCATIONIQ_SEARCH_URL}?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&format=json&limit=1`
      );

      if (!response.ok) throw new Error('Failed to fetch state');

      const data = await response.json();
      console.log('State data received:', data);

      if (data.length > 0) {
        const stateCode = extractStateFromLocationData(data);
        console.log('Extracted state code:', stateCode);

        if (stateCode && usStates.includes(stateCode)) {
          // Update the state field
          onFieldChange({ target: { name: "state", value: stateCode } });
          setSearchText(stateCode);
          setValidationErrors(prev => ({ ...prev, state: "" }));
          console.log('State updated to:', stateCode);
        } else {
          console.log('No valid state code found in:', data[0]);

          // Try alternative method - look in display_name
          if (data[0].display_name) {
            console.log('Display name:', data[0].display_name);
            const parts = data[0].display_name.split(',');
            for (const part of parts) {
              const trimmed = part.trim();
              const possibleState = stateNameToCode(trimmed);
              if (possibleState && usStates.includes(possibleState)) {
                console.log('Found state in display_name:', trimmed, '->', possibleState);
                onFieldChange({ target: { name: "state", value: possibleState } });
                setSearchText(possibleState);
                setValidationErrors(prev => ({ ...prev, state: "" }));
                break;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching state:', error);
    } finally {
      setLoadingState(false);
    }
  };

  // Function to fetch both city and state from ZIP code
  const fetchCityStateFromZip = async (zip) => {
    if (!zip || zip.length !== 5) {
      return { city: null, state: null };
    }

    setLoadingCity(true);
    setLoadingState(true);

    try {
      const query = `${zip}, USA`;
      console.log('Fetching city and state for ZIP:', zip);

      const response = await fetch(
        `${LOCATIONIQ_SEARCH_URL}?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&format=json&limit=3`
      );

      if (!response.ok) throw new Error('Failed to fetch location data');

      const data = await response.json();
      console.log('City/State data for ZIP:', data);

      if (data.length > 0) {
        // Extract city from first result
        const cityName = extractCityFromLocationData([data[0]]);

        // Extract state from first result
        const stateCode = extractStateFromLocationData([data[0]]);

        console.log('Extracted from ZIP:', { city: cityName, state: stateCode });

        return {
          city: cityName || null,
          state: stateCode || null
        };
      }

      return { city: null, state: null };

    } catch (error) {
      console.error('Error fetching city/state from ZIP:', error);
      return { city: null, state: null };
    } finally {
      setLoadingCity(false);
      setLoadingState(false);
    }
  };

  // Function to fetch city based on state and ZIP
  const fetchCityFromStateZip = async (state, zip) => {
    if (!state || !zip || zip.length < 5) {
      return;
    }

    setLoadingCity(true);
    try {
      // Try multiple query formats
      const queries = [
        `${zip}, ${state}, USA`,
        `${zip}, ${state}`,
        `${zip}`
      ];

      let cityFound = false;

      // Try each query format sequentially
      for (const query of queries) {
        if (cityFound) break;

        console.log(`Trying query: ${query}`);

        try {
          const response = await fetch(
            `${LOCATIONIQ_SEARCH_URL}?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&format=json&limit=5`
          );

          // Check if response is OK
          if (!response.ok) {
            console.warn(`Query failed: ${response.status} ${response.statusText}`);
            continue; // Try next query format
          }

          const data = await response.json();
          console.log('City data received for query:', query, data);

          if (!data || !Array.isArray(data) || data.length === 0) {
            console.log('No data for this query format');
            continue;
          }

          // Look for valid city in all results
          for (const item of data) {
            const cityName = extractCityFromLocationData([item]);

            if (cityName && cityName.length >= 2) {
              // Additional validation
              const hasInvalidChars = /^\d+$/.test(cityName) ||
                /^[^a-zA-Z]+$/.test(cityName);

              if (!hasInvalidChars &&
                !cityName.toUpperCase().includes(state) &&
                !cityName.includes(zip)) {

                console.log('Valid city found:', cityName);

                // Update the city field
                onFieldChange({ target: { name: "city", value: cityName } });
                setValidationErrors(prev => ({ ...prev, city: "" }));

                // Also update state if different
                const extractedState = extractStateFromLocationData([item]);
                if (extractedState && extractedState !== state) {
                  console.log('Also updating state to:', extractedState);
                  onFieldChange({ target: { name: "state", value: extractedState } });
                  setSearchText(extractedState);
                }

                cityFound = true;
                break;
              }
            }
          }
        } catch (innerError) {
          console.warn(`Error with query "${query}":`, innerError);
          // Continue to next query
        }
      }

      // If no city found with search API, try reverse geocoding
      if (!cityFound) {
        console.log('No city found with search API, trying reverse geocoding...');

        try {
          // First get coordinates for the ZIP code
          const coordResponse = await fetch(
            `${LOCATIONIQ_SEARCH_URL}?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(zip)}&format=json&limit=1`
          );

          if (coordResponse.ok) {
            const coordData = await coordResponse.json();
            if (coordData.length > 0 && coordData[0].lat && coordData[0].lon) {
              const { lat, lon } = coordData[0];

              // Use reverse geocoding with coordinates
              const reverseResponse = await fetch(
                `${LOCATIONIQ_REVERSE_URL}?key=${LOCATIONIQ_KEY}&lat=${lat}&lon=${lon}&format=json&addressdetails=1`
              );

              if (reverseResponse.ok) {
                const reverseData = await reverseResponse.json();
                console.log('Reverse geocode data:', reverseData);

                if (reverseData.address) {
                  // Extract city from reverse geocode
                  let cityName = '';

                  if (reverseData.address.city) {
                    cityName = reverseData.address.city;
                  } else if (reverseData.address.town) {
                    cityName = reverseData.address.town;
                  } else if (reverseData.address.village) {
                    cityName = reverseData.address.village;
                  } else if (reverseData.address.municipality) {
                    cityName = reverseData.address.municipality;
                  }

                  if (cityName && cityName.length >= 2) {
                    console.log('City found via reverse geocoding:', cityName);
                    onFieldChange({ target: { name: "city", value: cityName } });
                    setValidationErrors(prev => ({ ...prev, city: "" }));
                    cityFound = true;
                  }
                }
              }
            }
          }
        } catch (reverseError) {
          console.warn('Reverse geocoding failed:', reverseError);
        }
      }

      if (!cityFound) {
        console.warn(`Could not find city for state: ${state}, ZIP: ${zip}`);
      }

    } catch (error) {
      console.error('Error in fetchCityFromStateZip:', error);
    } finally {
      setLoadingCity(false);
    }
  };

  // Debounced version of fetchZipCodes to avoid too many API calls
  const debouncedFetchZipCodes = useCallback(
    debounce((city, state) => fetchZipCodes(city, state), 500),
    []
  );

  // Function to handle field clearing
  const handleFieldClear = (fieldName) => {
    // Clear validation error for the field
    setValidationErrors(prev => ({ ...prev, [fieldName]: "" }));

    // Clear ZIP suggestions if any field is cleared (except ZIP itself)
    if (fieldName !== 'zip') {
      setZipSuggestions([]);
      setShowZipDropdown(false);
    }

    // If ZIP is 5 digits and a field was cleared, try to refill it
    if (address.zip && address.zip.length === 5) {
      setTimeout(() => {
        if (fieldName === 'city' && (!address.city || address.city === '')) {
          // City was cleared, try to fetch it if state exists
          if (address.state && address.state.length === 2) {
            console.log('Refetching city after clear');
            fetchCityFromStateZip(address.state, address.zip);
          }
        } else if (fieldName === 'state' && (!address.state || address.state === '')) {
          // State was cleared, try to fetch it if city exists
          if (address.city && address.city.length >= 2) {
            console.log('Refetching state after clear');
            fetchStateFromCityZip(address.city, address.zip);
          }
        }
      }, 300); // Small delay to ensure state is updated
    }
  };

  // Handle city change - trigger ZIP code lookup if state is filled
  const handleCityChange = (e) => {
    const value = e.target.value;

    // Validate input format
    if (!/^[A-Za-z\s\-']*$/.test(value)) return;

    // Update the city value
    if (onFieldChange) {
      onFieldChange(e);
    }

    // Clear city error when user starts typing
    setValidationErrors(prev => ({ ...prev, city: "" }));

    // Clear ZIP suggestions when city is being edited
    setZipSuggestions([]);
    setShowZipDropdown(false);

    // If field is being cleared
    if (value === '') {
      handleFieldClear('city');
      return;
    }

    // If ZIP is already filled and state is missing, try to fetch state
    if (address.zip && address.zip.length === 5 &&
      (!address.state || address.state.length !== 2) &&
      value.length >= 2) {
      console.log('Fetching state for new city:', value, 'ZIP:', address.zip);
      fetchStateFromCityZip(value, address.zip);
    }

    // If state is already filled AND ZIP is NOT already filled, fetch ZIP codes
    else if (value.length >= 2 && address.state && address.state.length === 2 &&
      (!address.zip || address.zip.length !== 5)) {
      // Only fetch ZIP codes if ZIP field is empty or incomplete
      debouncedFetchZipCodes(value, address.state);
    }
  };

  // Handle state selection
  const handleSelect = (state) => {
    handleStateChange(state);
    setShowDropdown(false);
    setActiveIndex(-1);
    keepDropdownOpenRef.current = false;
    zipRef.current?.focus();
  };

  // Handle state change - trigger ZIP code lookup if city is filled
  const handleStateChange = (value) => {
    setSearchText(value.toUpperCase());
    setValidationErrors(prev => ({ ...prev, state: "" }));

    // Update the state field through onFieldChange
    if (onFieldChange) {
      onFieldChange({ target: { name: "state", value: value.toUpperCase() } });
    }

    // Clear ZIP suggestions when state is being edited
    setZipSuggestions([]);
    setShowZipDropdown(false);

    // If field is being cleared
    if (value === '') {
      handleFieldClear('state');
      return;
    }

    // If ZIP is already filled and city is missing, try to fetch city
    if (address.zip && address.zip.length === 5 &&
      (!address.city || address.city.length < 2)) {
      console.log('Auto-fetching city for new state:', value, 'ZIP:', address.zip);
      fetchCityFromStateZip(value.toUpperCase(), address.zip);
    }

    // If city is already filled AND ZIP is NOT already filled, fetch ZIP codes
    else if (value.length === 2 && address.city && address.city.length >= 2 &&
      (!address.zip || address.zip.length !== 5)) {
      // Only fetch ZIP codes if ZIP field is empty or incomplete
      fetchZipCodes(address.city, value.toUpperCase());
    }
  };

  // Handle state input change
  const handleStateInputChange = (e) => {
    const value = e.target.value.toUpperCase();

    // Allow only letters and maximum 2 characters
    if (!/^[A-Za-z]*$/.test(value) || value.length > 2) return;

    // Update search text
    setSearchText(value);

    // Update state field
    if (onFieldChange) {
      onFieldChange({ target: { name: "state", value } });
    }

    // Clear state error
    setValidationErrors(prev => ({ ...prev, state: "" }));

    // Show dropdown when typing and there are matches
    if (value.trim() !== "") {
      const matches = usStates.filter(st =>
        st.toLowerCase().startsWith(value.toLowerCase())
      );

      if (matches.length > 0) {
        setShowDropdown(true);
        setActiveIndex(0);
      } else {
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }

    // Handle field clearing
    if (value === '') {
      handleFieldClear('state');
    }
  };

  // Handle ZIP change - trigger city/state lookup if needed
  const handleZipChange = (e) => {
    const value = e.target.value;

    // Update the ZIP value
    if (onFieldChange) {
      onFieldChange(e);
    }

    // Clear ZIP error when user starts typing
    setValidationErrors(prev => ({ ...prev, zip: "" }));

    // Clear ZIP suggestions when ZIP is being edited
    setZipSuggestions([]);
    setShowZipDropdown(false);

    // Handle field clearing
    if (value === '') {
      handleFieldClear('zip');
      return;
    }

    // If ZIP is 5 digits, try to auto-fill missing fields
    if (value.length === 5) {
      const city = address.city || "";
      const state = address.state || "";

      console.log('ZIP changed to 5 digits:', value, 'City:', city, 'State:', state);

      // Logic for auto-filling based on what's missing
      if (city && city.length >= 2 && (!state || state.length !== 2)) {
        // Case 1: City is filled but state is missing or incomplete
        console.log('Fetching state for city:', city, 'ZIP:', value);
        fetchStateFromCityZip(city, value);
      }
      else if (state && state.length === 2 && (!city || city.length < 2)) {
        // Case 2: State is filled but city is missing
        console.log('Fetching city for state:', state, 'ZIP:', value);
        fetchCityFromStateZip(state, value);
      }
      else if (!city && !state) {
        // Case 3: Both city and state are missing - fetch both
        console.log('Fetching city and state for ZIP:', value);

        // First fetch city and state together
        fetchCityStateFromZip(value).then(({ city: fetchedCity, state: fetchedState }) => {
          if (fetchedCity && !address.city) {
            onFieldChange({ target: { name: "city", value: fetchedCity } });
          }
          if (fetchedState && !address.state) {
            onFieldChange({ target: { name: "state", value: fetchedState } });
            setSearchText(fetchedState);
          }
        });
      }
    }
  };

  // Handle ZIP code selection from dropdown
  const handleZipSelect = (zip) => {
    if (onFieldChange) {
      onFieldChange({ target: { name: "zip", value: zip } });
    }
    setShowZipDropdown(false);
    searchWithinRef.current?.focus();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle ZIP dropdown
      if (zipDropdownRef.current && !zipDropdownRef.current.contains(event.target)) {
        setShowZipDropdown(false);
      }

      // Handle state dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Only close if user didn't click the dropdown arrow
        const isDropdownArrow = event.target.closest('[aria-label="Toggle state dropdown"]');
        if (!isDropdownArrow) {
          setShowDropdown(false);
          setActiveIndex(-1);
          keepDropdownOpenRef.current = false;
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedFetchZipCodes.cancel();
    };
  }, [debouncedFetchZipCodes]);

  // Navigation helper functions
  const handleEnterNavigation = (currentField, nextField) => {
    return (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (nextField === "search") {
          searchButtonRef.current?.click();
        } else if (typeof nextField === "function") {
          nextField();
        } else {
          nextField?.current?.select();
        }
      }
    };
  };

  const handleTabNavigation = (e, currentField, nextField) => {
    if (e.key === "Tab") {
      e.preventDefault();

      if (currentField === "searchWithin" && nextField === "city") {
        cityRef.current?.select();
      } else if (nextField === "search") {
        searchButtonRef.current?.focus();
      } else if (typeof nextField === "function") {
        nextField();
      } else {
        nextField?.current?.select();
      }

      if (currentField === "state") {
        setShowDropdown(false);
        setActiveIndex(-1);
        keepDropdownOpenRef.current = false;
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

    // Validate city
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
    if (!searchWithin || searchWithin < 1) {
      errors.searchWithin = "Search radius must be at least 1 mile";
      isValid = false;
    } else if (searchWithin > 40) {
      errors.searchWithin = "Search radius cannot exceed 40 miles";
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
      if (validationErrors.city) cityRef.current?.select();
      else if (validationErrors.state) stateRef.current?.select();
      else if (validationErrors.zip) zipRef.current?.select();
      else if (validationErrors.searchWithin) searchWithinRef.current?.select();
    }
  };

  // Auto-scroll to active item - improved version with smooth scrolling
  useEffect(() => {
    if (showDropdown && activeIndex >= 0 && dropdownListRef.current) {
      const list = dropdownListRef.current;
      const activeItem = list.querySelector(`[data-state-index="${activeIndex}"]`);

      if (activeItem) {
        // Calculate scroll position with buffer
        const itemTop = activeItem.offsetTop;
        const itemBottom = itemTop + activeItem.offsetHeight;
        const listTop = list.scrollTop;
        const listBottom = listTop + list.clientHeight;

        // Calculate buffer (20% of item height for smoother scrolling)
        const buffer = activeItem.offsetHeight * 0.2;

        // If item is above visible area (with buffer)
        if (itemTop < listTop + buffer) {
          list.scrollTop = Math.max(0, itemTop - buffer);
        }
        // If item is below visible area (with buffer)
        else if (itemBottom > listBottom - buffer) {
          list.scrollTop = itemBottom - list.clientHeight + buffer;
        }
      }
    }
  }, [activeIndex, showDropdown, filteredStates]);

  // Helper function to get caret index from click
  const getCaretIndexFromClick = (input, clickX) => {
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
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 space-y-8 border border-white/20 relative">
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
            <div className="relative">
              <input
                ref={cityRef}
                type="text"
                name="city"
                value={address.city}
                onChange={handleCityChange}
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
                disabled={loadingAddress || loadingCity}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEnterNavigation("city", stateRef)(e);
                  if (e.key === "Tab") handleTabNavigation(e, "city", stateRef);
                }}
                className={`w-full border rounded-xl px-4 py-3.5
                  focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400
                  bg-white/50 shadow-sm hover:shadow-md text-black placeholder-gray-400
                  ${loadingAddress || loadingCity ? "opacity-50 cursor-not-allowed" : ""}
                  ${validationErrors.city ? "border-red-500 focus:border-red-500 focus:ring-red-400" : "border-gray-200"}
                `}
              />
              {loadingCity && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </div>
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
                onChange={handleStateInputChange}
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
                onBlur={(e) => {
                  // Don't close if the dropdown or its contents are clicked
                  const relatedTarget = e.relatedTarget;
                  const isClickingDropdown =
                    relatedTarget?.closest('[id="state-dropdown"]') ||
                    relatedTarget?.closest('[aria-label="Toggle state dropdown"]');

                  if (!isClickingDropdown && !keepDropdownOpenRef.current) {
                    setShowDropdown(false);
                    setActiveIndex(-1);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();

                    // If Enter is pressed and we have a selected category
                    if (showDropdown && activeIndex >= 0 && filteredStates[activeIndex]) {
                      handleSelect(filteredStates[activeIndex]);
                      setShowDropdown(false);
                    } else if (showDropdown && filteredStates.length > 0) {
                      // Select first item if dropdown is open but no specific item selected
                      handleSelect(filteredStates[0]);
                      setShowDropdown(false);
                    } else {
                      // Otherwise navigate to ZIP field
                      zipRef.current?.focus();
                    }
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (showDropdown && filteredStates.length > 0) {
                      // Move selection down
                      const newIndex = activeIndex < filteredStates.length - 1
                        ? activeIndex + 1
                        : 0;
                      setActiveIndex(newIndex);
                    } else if (filteredStates.length > 0) {
                      // If input has focus and user presses arrow down, show all states
                      setShowDropdown(true);
                      setActiveIndex(0);
                    }
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (showDropdown && filteredStates.length > 0) {
                      // Move selection up
                      const newIndex = activeIndex > 0
                        ? activeIndex - 1
                        : filteredStates.length - 1;
                      setActiveIndex(newIndex);
                    } else if (filteredStates.length > 0) {
                      // If input has focus and user presses arrow up, show all states
                      setShowDropdown(true);
                      setActiveIndex(filteredStates.length - 1);
                    }
                  } else if (e.key === 'Escape') {
                    if (showDropdown) {
                      e.preventDefault();
                      setShowDropdown(false);
                      setActiveIndex(-1);
                      keepDropdownOpenRef.current = false;
                      stateRef.current?.focus();
                    }
                  } else if (e.key === 'Tab') {
                    handleTabNavigation(e, "state", zipRef);
                    // Close dropdown on tab
                    if (showDropdown) {
                      setShowDropdown(false);
                      setActiveIndex(-1);
                      keepDropdownOpenRef.current = false;
                    }
                  }
                }}
                placeholder="State"
                disabled={loadingAddress || loadingState}
                className={`w-full border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/50 shadow-sm hover:shadow-md text-black ${loadingAddress || loadingState ? "opacity-50 cursor-not-allowed" : ""} ${validationErrors.state ? "border-red-500 focus:border-red-500 focus:ring-red-400" : "border-gray-200"}`}
              />

              <div
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer hover:bg-indigo-50 p-1 rounded-lg transition-colors"
                onClick={() => {
                  // Toggle dropdown when icon is clicked
                  if (!showDropdown) {
                    // Show all states when dropdown icon is clicked
                    if (filteredStates.length > 0) {
                      setShowDropdown(true);
                      setActiveIndex(0);
                      keepDropdownOpenRef.current = true;
                    }
                  } else {
                    setShowDropdown(false);
                    setActiveIndex(-1);
                    keepDropdownOpenRef.current = false;
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!showDropdown) {
                      if (filteredStates.length > 0) {
                        setShowDropdown(true);
                      }
                      setActiveIndex(0);
                      keepDropdownOpenRef.current = true;
                    } else {
                      setShowDropdown(false);
                      setActiveIndex(-1);
                      keepDropdownOpenRef.current = false;
                    }
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="Toggle state dropdown"
                aria-expanded={showDropdown}
                aria-controls="state-dropdown"
              >
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform ${showDropdown ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {loadingState && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                </div>
              )}

              {/* Dropdown menu - show when dropdown is open and there are states */}
              {showDropdown && filteredStates.length > 0 && (
                <div
                  id="state-dropdown"
                  ref={dropdownListRef}
                  className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                  onKeyDown={(e) => {
                    // Handle global dropdown keyboard events
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setShowDropdown(false);
                      setActiveIndex(-1);
                      keepDropdownOpenRef.current = false;
                      stateRef.current?.focus();
                    }
                  }}
                  tabIndex={-1}
                >
                  {filteredStates.map((state, index) => (
                    <div
                      key={state}
                      className={`px-4 py-3 cursor-pointer transition-colors duration-150
    border-b border-gray-100 last:border-b-0
    focus:outline-none focus:ring-0
    ${activeIndex === index
                          ? 'bg-gray-300'
                          : 'hover:bg-gray-50'
                        }`}
                      onClick={() => {
                        handleSelect(state);
                        setShowDropdown(false);
                        keepDropdownOpenRef.current = false;
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelect(state);
                          setShowDropdown(false);
                          keepDropdownOpenRef.current = false;
                        } else if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          const newIndex = index < filteredStates.length - 1 ? index + 1 : 0;
                          setActiveIndex(newIndex);
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          const newIndex = index > 0 ? index - 1 : filteredStates.length - 1;
                          setActiveIndex(newIndex);
                        }
                      }}
                      tabIndex={0}
                      role="option"
                      aria-selected={activeIndex === index}
                      data-state-index={index}
                      ref={el => {
                        // Only focus if this is the active item AND it's not already focused
                        // This prevents the abrupt jump
                        if (activeIndex === index && showDropdown && el) {
                          const isFocused = document.activeElement === el;
                          if (!isFocused) {
                            setTimeout(() => {
                              if (activeIndex === index && showDropdown) {
                                el.focus();
                              }
                            }, 10);
                          }
                        }
                      }}
                    >
                      <div className={`font-medium ${activeIndex === index ? 'text-indigo-700' : 'text-gray-800'}`}>
                        {state}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {validationErrors.state && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.state}</p>
            )}
          </div>

          {/* ZIP */}
          <div className="space-y-2 relative" ref={zipDropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l9 6 9-6M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" />
              </svg>
              Enter Your ZIP
            </label>
            <div className="relative">
              <input
                ref={zipRef}
                type="text"
                name="zip"
                value={address.zip}
                onChange={handleZipChange}
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
                disabled={loadingAddress || loadingZip}
                onFocus={() => {
                  // Only show dropdown if ZIP is not already 5 digits and there are suggestions
                  if (!address.zip || address.zip.length !== 5) {
                    if (zipSuggestions.length > 0) {
                      setShowZipDropdown(true);
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEnterNavigation("zip", searchWithinRef)(e);
                  }
                  if (e.key === "Tab") {
                    handleTabNavigation(e, "zip", searchWithinRef);
                  }
                  if (showZipDropdown && zipSuggestions.length > 0) {
                    if (e.key === "Escape") {
                      setShowZipDropdown(false);
                    }
                  }
                }}
                className={`w-full border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/50 shadow-sm hover:shadow-md text-black placeholder-gray-400 ${loadingAddress || loadingZip ? "opacity-50 cursor-not-allowed" : ""
                  } ${validationErrors.zip ? "border-red-500 focus:border-red-500 focus:ring-red-400" : "border-gray-200"}`}
              />

              {loadingZip && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                </div>
              )}

              {/* Only show ZIP dropdown if ZIP is not already 5 digits */}
              {showZipDropdown && zipSuggestions.length > 0 && (!address.zip || address.zip.length !== 5) && (
                <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
                  <li className="px-4 py-2 text-sm text-gray-500 bg-gray-50 border-b">
                    ZIP Codes for {address.city}, {address.state}
                  </li>
                  {zipSuggestions.map((zip, index) => (
                    <li
                      key={zip}
                      onClick={() => handleZipSelect(zip)}
                      className="px-4 py-2.5 cursor-pointer text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    >
                      {zip}
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
              handleTabNavigation(e, "search", () => cityRef.current?.focus());
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

// Keep the SearchWithinInput component exactly as it was
function SearchWithinInput({ searchWithin, onChange, disabled = false, searchWithinRef, onKeyDown, error, getCaretIndexFromClick }) {
  const [inputValue, setInputValue] = useState(searchWithin.toString());

  // Update local state when prop changes
  useEffect(() => {
    setInputValue(searchWithin.toString());
  }, [searchWithin]);

  const handleChange = (e) => {
    const value = e.target.value;

    // If value is empty, allow it (clear the field)
    if (value === "") {
      setInputValue("");
      onChange(""); // Pass empty string instead of 0
      return;
    }

    // Allow only digits (0-9)
    if (!/^\d*$/.test(value)) return;

    // Update local state
    setInputValue(value);

    // Handle the case where user types multiple digits
    if (value.length > 0) {
      const numericValue = Number(value);

      // Validate range (1-40)
      if (numericValue <= 40 && numericValue >= 1) {
        onChange(numericValue);
      } else if (numericValue > 40) {
        // If user types a number greater than 40, cap it at 40
        setInputValue("40");
        onChange(40);
      }
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

    // Handle backspace/delete - allow clearing completely
    if (e.key === 'Backspace' || e.key === 'Delete') {
      // Let the change handler handle this
      return;
    }

    // Prevent typing "0" as the first character
    if (e.key === '0') {
      const input = e.target;
      const cursorPosition = input.selectionStart;

      // If cursor is at the beginning or field is empty, prevent typing "0"
      if (cursorPosition === 0 || inputValue === "") {
        e.preventDefault();
        return;
      }

      // Allow "0" if it's not at the beginning (like in "10", "20", etc.)
      return;
    }

    // Handle arrow up/down
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentValue = inputValue === "" ? 0 : Number(inputValue);
      const newValue = currentValue === 0 ? 1 : Math.min(40, currentValue + 1);
      if (newValue !== currentValue) {
        onChange(newValue);
        setInputValue(newValue.toString());
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const currentValue = inputValue === "" ? 0 : Number(inputValue);
      const newValue = Math.max(1, currentValue - 1);
      if (newValue !== currentValue) {
        onChange(newValue);
        setInputValue(newValue.toString());
      }
    }
  };

  // Handle blur event - if empty, leave it empty (don't auto-set to 1)
  const handleBlur = () => {
    // Only validate if empty, don't auto-set to 1
    if (inputValue === "") {
      // Keep it empty, validation will handle it
      return;
    }

    // If it's less than 1, clear it
    if (Number(inputValue) < 1) {
      setInputValue("");
      onChange("");
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData('text');

    // Check if pasted text starts with "0"
    if (pastedData.startsWith('0')) {
      e.preventDefault();

      // Remove leading zeros
      const withoutLeadingZeros = pastedData.replace(/^0+/, '');

      if (withoutLeadingZeros !== "") {
        const numericValue = Number(withoutLeadingZeros);
        if (numericValue >= 1 && numericValue <= 40) {
          setInputValue(withoutLeadingZeros);
          onChange(numericValue);
        }
      }
    }
  };

  // Handle arrow button clicks
  const handleArrowUpClick = () => {
    if (disabled) return;
    const currentValue = inputValue === "" ? 0 : Number(inputValue);
    const newValue = currentValue === 0 ? 1 : Math.min(40, currentValue + 1);
    if (newValue !== currentValue) {
      onChange(newValue);
      setInputValue(newValue.toString());
    }
  };

  const handleArrowDownClick = () => {
    if (disabled) return;
    const currentValue = inputValue === "" ? 0 : Number(inputValue);
    const newValue = Math.max(1, currentValue - 1);
    if (newValue !== currentValue) {
      onChange(newValue);
      setInputValue(newValue.toString());
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
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onPaste={handlePaste}
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
          className={`w-full p-3.5 text-black placeholder-gray-400 text-center font-semibold focus:outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed pr-10`}
        />

        {/* Arrow buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col space-y-0.5">
          <button
            type="button"
            onClick={handleArrowUpClick}
            disabled={disabled || (inputValue !== "" && Number(inputValue) >= 40)}
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
            disabled={disabled || (inputValue !== "" && Number(inputValue) <= 1)}
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