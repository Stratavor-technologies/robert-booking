import { useState, useEffect } from "react";

const LOCATIONIQ_AUTOCOMPLETE = "https://us1.locationiq.com/v1/autocomplete.php";
const LOCATIONIQ_API = "https://us1.locationiq.com/v1/search";

// Add the distance calculation function at the top level of the hook
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

// Helper function to extract state from location title
function getStateFromLocation(location) {
  if (!location || !location.title) return '';
  
  console.log("Extracting state from location title:", location.title);
  
  // Extract state from title (e.g., "729 Stryker Avenue, Doylestown, PA" -> "PA")
  const parts = location.title.split(',');
  if (parts.length >= 3) {
    const statePart = parts[parts.length - 1].trim();
    console.log("Extracted state:", statePart);
    return statePart;
  }
  
  return '';
}

export function useBooking({ providers, events, locations, clients }) {
  // Convert props to arrays
  const providerArray = Array.isArray(providers) ? providers : Object.values(providers || {});
  const eventArray = Array.isArray(events) ? events : Object.values(events || {});
  const clientsArray = Array.isArray(clients) ? clients : Object.values(clients || {});
  const locationArray = Array.isArray(locations) ? locations : Object.values(locations || {});

  // State declarations
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [workCalandar, setWorkCalandar] = useState(null);
  const [firstDay, setFirstDay] = useState(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [slots, setSlots] = useState([]);
  const [clientLocation, setClientLocation] = useState(null);
  const [searchWithin, setSearchWithin] = useState(20);
  const [selectedClient, setSelectedClient] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchedAddress, setIsSearchedAddress] = useState(false);
  const [limitedLocations, setLimitedLocations] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  // New loading states
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    privacy: false,
  });

  const [address, setAddress] = useState({
    fullAddress: "",
    lat: "",
    lon: "",
    city: "",
    state: "",
  });

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

  // Handler functions
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setServices((prev) => ({ ...prev, [name]: checked }));
  };

  const resetBooking = () => {
    setSelectedEvent("");
    setSelectedProvider("");
    setSelectedDate(null);
    setSelectedTime("");
    setWorkCalandar(null);
    setFirstDay(null);
    setSlots([]);
    setSelectedClient("");
    setQuery("");
    setSuggestions([]);
    setIsSearchedAddress(false);
    setLimitedLocations([]);
    setFilteredProviders([]);
    setFormData({
      name: "",
      email: "",
      phone: "",
      privacy: false,
    });
    setServices({
      manicure: false,
      manicureGel: false,
      pedicure: false,
      pedicureGel: false,
      eyelashFull: false,
      eyelashRefill: false,
      waxEyebrows: false,
      waxLips: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmittingBooking(true);

    if (!formData.privacy) {
      alert("You must agree to the Privacy Policy before booking.");
      setSubmittingBooking(false);
      return;
    }

    if (!address.fullAddress || !address.lat || !address.lon) {
      alert("Please provide a valid address with latitude and longitude.");
      setSubmittingBooking(false);
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
        fullAddress: address.fullAddress,
        lat: address.lat,
        lon: address.lon,
        city: address.city,
        state: address.state,
      },
      services,
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

      // Reset everything after successful booking
      resetBooking();
      
      // Return success for notification
      return { success: true, data };
    } catch (err) {
      console.error("❌ Error creating booking:", err);
      return { success: false, error: err.message };
    } finally {
      setSubmittingBooking(false);
    }
  };

  async function handleBlacklist(providerId) {
    if (!userEmail) {
      alert("Please enter your email before Hiding a provider.");
      return;
    }

    try {
      const res = await fetch("/api/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, providerId }),
      });

      const result = await res.json();

      if (result.success) {
        // instantly remove blacklisted provider
        setFilteredProviders((prev) => prev.filter((p) => p.id !== providerId));
        alert("Provider has been Hidden successfully!");
      } else {
        alert(result.message || "Failed to Hiding provider.");
      }
    } catch (error) {
      console.error("Blacklist error:", error);
      alert("Something went wrong while Hiding the provider.");
    }
  }

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
    console.log("Selected place:", place);
    setClientLocation([place.lat, place.lon]);
    
    // Extract state from the selected place
    const state = extractStateFromPlace(place);
    console.log("Extracted state from place:", state);
    setAddress(prev => ({
      ...prev,
      state: state
    }));
  };

  // Improved function to extract state from LocationIQ place object
  function extractStateFromPlace(place) {
    console.log("Extracting state from place:", place);
    
    // First try to get state from address object (LocationIQ usually has this)
    if (place.address) {
      // Try different possible state fields in LocationIQ response
      if (place.address.state) {
        console.log("Found state in address.state:", place.address.state);
        return place.address.state;
      }
      if (place.address.state_code) {
        console.log("Found state in address.state_code:", place.address.state_code);
        return place.address.state_code;
      }
    }
    
    // Try to extract from display_name as fallback
    if (place.display_name) {
      console.log("Trying to extract from display_name:", place.display_name);
      const parts = place.display_name.split(',');
      
      // Look for a 2-letter state code in the last few parts
      for (let i = Math.max(0, parts.length - 3); i < parts.length; i++) {
        const part = parts[i].trim();
        // If it's a 2-letter uppercase code, it's likely a state
        if (part.length === 2 && /^[A-Z]{2}$/.test(part)) {
          console.log("Extracted state from display_name:", part);
          return part;
        }
      }
      
      // If no 2-letter code found, try to get the state name and map it
      if (parts.length >= 3) {
        const possibleState = parts[parts.length - 1].trim();
        console.log("Possible state name:", possibleState);
        // Map common state names to codes
        const stateMap = {
          'pennsylvania': 'PA',
          'new jersey': 'NJ',
          'new york': 'NY',
          'california': 'CA',
          'texas': 'TX',
          // Add more as needed
        };
        const mappedState = stateMap[possibleState.toLowerCase()];
        if (mappedState) {
          console.log("Mapped state name to code:", mappedState);
          return mappedState;
        }
      }
    }
    
    console.log("No state found in place object");
    return '';
  }

  async function getLatLngFromAddress(client) {
    setLoadingAddress(true);
    try {
      const fullAddress = [
        client.address1,
        client.address2,
        client.city,
        client.zip,
        client.state, // This should be the state code like "PA"
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
      console.log("Location data:", data);

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No location found");
      }

      const location = data[0];

      // Extract state from the location response
      const extractedState = extractStateFromPlace(location);
      
      // Update the address state with the fetched data
      setAddress({
        fullAddress: location.display_name,
        lat: location.lat,
        lon: location.lon,
        city: client.city,
        state: extractedState || client.state, // Use extracted state or fallback to client.state
      });
      
      console.log("Client state set to:", extractedState || client.state);
      
      setIsSearchedAddress(true);
      setClientLocation([parseFloat(location.lat), parseFloat(location.lon)]);
    } catch (error) {
      console.error("Error fetching location:", error);
    } finally {
      setLoadingAddress(false);
    }
  }

  const handleNotFoundSubmit = async () => {
    if (address.email === "" || address.phone === "") {
      alert("Email and Phone is required...");
      return;
    }

    setAddress({
      email: "",
      phone: "",
      street1: "",
      city: "",
      zip: "",
      state: "",
      country: "US",
    });
    setIsSearchedAddress(false);
    setFilteredProviders([]);
    alert("We have received your request. We will contact you once we are available in your area.");
    return;
  }

  // ADD THE MONTH CHANGE HANDLER
  const handleMonthChange = async (date) => {
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
      console.error("Error fetching calendar for month change:", err);
    } finally {
      setLoadingCalendar(false);
    }
  };

  // Add function to get selected service names
  const getSelectedServiceNames = () => {
    const selectedServices = Object.entries(services)
      .filter(([_, isSelected]) => isSelected)
      .map(([key]) => {
        const serviceNames = {
          manicure: "Manicure",
          manicureGel: "Manicure Gel",
          pedicure: "Pedicure",
          pedicureGel: "Pedicure Gel",
          eyelashFull: "Eyelash Full Set",
          eyelashRefill: "Eyelash Refill",
          waxEyebrows: "Wax Eyebrows",
          waxLips: "Wax Lips"
        };
        return serviceNames[key] || key;
      });
    
    return selectedServices.length > 0 ? selectedServices.join(", ") : "No services selected";
  };

  useEffect(() => {
    if (!selectedProvider) return;
    
    setLoadingServices(true);
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
      } finally {
        setLoadingServices(false);
      }
    };
    fetchData();
  }, [selectedProvider]);

  useEffect(() => {
    if (!selectedDate || !workCalandar) {
      setSlots([]);
      return;
    }

    setLoadingTimeSlots(true);

    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${d}`;

    const dayInfo = workCalandar[key];
    if (!dayInfo || parseInt(dayInfo.is_day_off) === 1) {
      setSlots([]);
      setLoadingTimeSlots(false);
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
    setLoadingTimeSlots(false);
  }, [selectedDate, workCalandar]);

  useEffect(() => {
    console.log("🔍 Filtering providers...");
    console.log("Client location:", clientLocation);
    console.log("Client state:", address.state);
    console.log("Total providers:", providerArray?.length);
    console.log("Total locations:", locationArray?.length);

    if (!providerArray || providerArray.length === 0) {
      setFilteredProviders([]);
      return;
    }

    if (!clientLocation) {
      console.log("No client location, showing all providers");
      setFilteredProviders(providerArray);
      return;
    }

    setLoadingProviders(true);

    const [userLat, userLng] = clientLocation;

    // STEP 1: Distance filtering
    const providersWithDistance = providerArray
      .map((p) => {
        const providerLocations = p.locations
          ?.map((locId) => locationArray.find((l) => l.id === locId))
          .filter(Boolean);

        if (!providerLocations?.length) {
          console.log(`Provider ${p.id} has no locations`);
          return null;
        }

        let minDist = Infinity;
        let nearestLocation = null;
        
        providerLocations.forEach((loc) => {
          const dist = getDistance(
            userLat,
            userLng,
            parseFloat(loc.lat),
            parseFloat(loc.lng)
          );
          if (dist < minDist) {
            minDist = dist;
            nearestLocation = loc;
          }
        });

        const providerState = getStateFromLocation(nearestLocation);
        console.log(`Provider ${p.id} - distance: ${minDist}, location state: ${providerState}`);

        return {
          ...p,
          distance: minDist,
          nearestLocation: nearestLocation,
          providerState: providerState, // Store the extracted state
        };
      })
      .filter(Boolean)
      .filter((p) => p.distance <= searchWithin)
      .sort((a, b) => a.distance - b.distance);

    console.log("Providers after distance filtering:", providersWithDistance.length);

    // STEP 2: STATE-BASED FILTERING
    let finalFilteredProviders;
    if (address.state && address.state.length === 2) { // Only filter if we have a valid state code
      finalFilteredProviders = providersWithDistance.filter((p) => {
        console.log(`Checking provider ${p.id}: ${p.providerState} === ${address.state}?`, p.providerState === address.state);
        return p.providerState === address.state;
      });
      console.log("Providers after state filtering:", finalFilteredProviders.length);
    } else {
      finalFilteredProviders = providersWithDistance;
      console.log("No valid client state code set, showing all distance-filtered providers");
    }

    // Limit to 4 providers
    const limitedProviders = finalFilteredProviders.slice(0, 4);
    console.log("Final limited providers:", limitedProviders.length);

    // STEP 3 + 4: Apply blacklist and booking priority
    async function filterProviders() {
      if (!userEmail) {
        setFilteredProviders(limitedProviders);
        setLoadingProviders(false);
        return;
      }

      try {
        const blacklistRes = await fetch(`/api/blacklist?email=${userEmail}`);
        const blacklistData = await blacklistRes.json();
        const blockedIds = blacklistData?.blockedProviderIds || [];

        const bookingRes = await fetch(`/api/bookings?email=${userEmail}`);
        const bookingData = await bookingRes.json();
        const bookedProviderIds = bookingData?.data?.map((b) => b.provider) || [];

        let finalList = limitedProviders.filter(
          (p) => !blockedIds.includes(p.id)
        );

        finalList = finalList.sort((a, b) => {
          const aBooked = bookedProviderIds.includes(a.id);
          const bBooked = bookedProviderIds.includes(b.id);

          if (aBooked && !bBooked) return -1;
          if (!aBooked && bBooked) return 1;
          return 0;
        });

        setFilteredProviders(finalList);
      } catch (err) {
        console.error("Provider filtering error:", err);
        setFilteredProviders(limitedProviders);
      } finally {
        setLoadingProviders(false);
      }
    }

    filterProviders();
  }, [clientLocation, searchWithin, providerArray, locations, userEmail, address.state]);

  return {
    // State
    selectedEvent,
    selectedProvider,
    selectedDate,
    selectedTime,
    workCalandar,
    firstDay,
    loadingCalendar,
    slots,
    clientLocation,
    searchWithin,
    selectedClient,
    query,
    suggestions,
    isSearchedAddress,
    limitedLocations,
    filteredProviders,
    userEmail,
    formData,
    address,
    services,
    
    // Loading States
    loadingProviders,
    loadingServices,
    loadingTimeSlots,
    submittingBooking,
    loadingAddress,
    
    // Handlers
    handleChange,
    handleCheckboxChange,
    handleSubmit,
    handleBlacklist,
    handleFieldChange,
    handleSearchChange,
    handleSearchSelect,
    setSearchWithin,
    setUserEmail,
    setSelectedProvider,
    setSelectedDate,
    setSelectedTime,
    getLatLngFromAddress,
    handleNotFoundSubmit,
    handleMonthChange,
    resetBooking,
    getSelectedServiceNames
  };
}