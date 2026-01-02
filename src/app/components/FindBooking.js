"use client";
import { useState, useEffect } from "react";
import SearchSection from "./SearchSection";
import ProvidersSection from "./ProvidersSection";
import ServicesSection from "./ServicesSection";
import DatePickerSection from "./DatePickerSection";
import TimeSlotsSection from "./TimeSlotsSection";
import BookingSummary from "./BookingSummary";
import NoProvidersSection from "./NoProvidersSection";
import SuccessNotification from "./SuccessNotification";
import { useBooking } from "./useBooking";
import { Calendar, Clock, CheckCircle } from "lucide-react";

const dayMap = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export default function FindBooking({ providers, events, locations, clients, categories }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
   const [userFlow, setUserFlow] = useState("entry"); 
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [currentView, setCurrentView] = useState('providers');
  const [blacklistedProviders, setBlacklistedProviders] = useState([]);
  const [loadingBlacklist, setLoadingBlacklist] = useState(false);
  const [unblacklisting, setUnblacklisting] = useState(null);
  const [showServicesSection, setShowServicesSection] = useState(false);
  const [showDatePickerSection, setShowDatePickerSection] = useState(true);
  const [showTimeSlotsSection, setShowTimeSlotsSection] = useState(true);
  const [showBookingSummary, setShowBookingSummary] = useState(true);
  const [resetForm, setResetForm] = useState(false);
  // Add this function inside the FindBooking component, after all the useState declarations
  const saveBookingState = () => {
    const bookingState = {
      clientLocation,
      searchWithin,
      selectedProvider,
      selectedEvent,
      selectedDate,
      selectedTime,
      address,
      userEmail,
      formData,
      isSearchedAddress,
      timestamp: Date.now()
    };

    sessionStorage.setItem('bookingState', JSON.stringify(bookingState));
    console.log('💾 Saved booking state for navigation');
  };

  // Get all hook functions FIRST
  const {
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
    providerArray,
    loadingProviders,
    loadingServices,
    loadingTimeSlots,
    submittingBooking,
    loadingAddress,
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
    getSelectedServiceNames,
    resetBooking,
    setFormData
  } = useBooking({ providers, events, locations, clients, categories });


  // Custom handler for provider selection that automatically opens services section
  const handleProviderSelect = (providerId) => {
    setSelectedProvider(providerId);
    // Automatically open services section when provider is selected
    setShowServicesSection(true);
  };

  // REPLACE THE ENTIRE useEffect (lines 87-128) WITH:
  useEffect(() => {
    const loadAuthState = () => {
      if (typeof window !== 'undefined') {
        const savedAuth = sessionStorage.getItem('userAuth');
        if (savedAuth) {
          try {
            const parsed = JSON.parse(savedAuth);
            if (parsed.isAuthenticated) {
              // Set booking hook state
              setUserEmail(parsed.userEmail);
              setFormData(prev => ({ ...prev, email: parsed.userEmail }));

              // Restore address if available
              if (parsed.userData?.lastAddress) {
                const addr = parsed.userData.lastAddress;

                if (addr.fullAddress) {
                  handleFieldChange({
                    target: { name: "fullAddress", value: addr.fullAddress }
                  });
                }
                if (addr.city) {
                  handleFieldChange({
                    target: { name: "city", value: addr.city }
                  });
                }
                if (addr.state) {
                  handleFieldChange({
                    target: { name: "state", value: addr.state }
                  });
                }
              }
            }
          } catch (error) {
            console.error('❌ Error loading auth state:', error);
            sessionStorage.removeItem('userAuth');
          }
        }
      }
    };

    loadAuthState();
  }, []);



  // Add this useEffect to listen for reset events from Header and NoProvidersSection
  useEffect(() => {
    const handleResetBookingForm = () => {
      console.log('🔄 Received reset request from header/no-thanks');
      handleFullReset();
    };

    // Listen for the custom reset event
    window.addEventListener('reset-booking-form', handleResetBookingForm);

    return () => {
      window.removeEventListener('reset-booking-form', handleResetBookingForm);
    };
  }, []);

  // Add this handler function
  const handleCloseServicesSection = () => {
    console.log('Closing ServicesSection');
    setShowServicesSection(false);
  };

  // Add this function to reopen if needed
  const handleReopenServicesSection = () => {
    setShowServicesSection(true);
  };


  // Add these handler functions
  const handleCloseDatePickerSection = () => {
    console.log('Closing DatePickerSection');
    setShowDatePickerSection(false);
  };

  const handleReopenDatePickerSection = () => {
    setShowDatePickerSection(true);
  };

  // Add these handler functions
  const handleCloseTimeSlotsSection = () => {
    console.log('Closing TimeSlotsSection');
    setShowTimeSlotsSection(false);
  };

  const handleReopenTimeSlotsSection = () => {
    setShowTimeSlotsSection(true);
  };


  // Add these handler functions
  const handleCloseBookingSummary = () => {
    console.log('Closing BookingSummary');
    setShowBookingSummary(false);
  };

  const handleReopenBookingSummary = () => {
    setShowBookingSummary(true);
  };


  // 🔥 ADD THESE PHONE UTILITY FUNCTIONS HERE
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');

    // Remove leading "1" if it's the first digit (US country code)
    let processedNumber = phoneNumber;
    if (phoneNumber.length > 0 && phoneNumber[0] === '1') {
      processedNumber = phoneNumber.substring(1);
    }

    // Limit to 10 digits
    const limitedNumber = processedNumber.substring(0, 10);

    // Apply formatting
    if (limitedNumber.length === 0) return '';
    if (limitedNumber.length <= 3) return `(${limitedNumber}`;
    if (limitedNumber.length <= 6) return `(${limitedNumber.substring(0, 3)}) ${limitedNumber.substring(3)}`;

    return `(${limitedNumber.substring(0, 3)}) ${limitedNumber.substring(3, 6)}-${limitedNumber.substring(6)}`;
  };

  const normalizePhoneNumber = (formattedNumber) => {
    // Remove all formatting and return just the 10 digits
    return formattedNumber.replace(/\D/g, '').substring(0, 10);
  };



  const currentStep = selectedTime
    ? 4
    : selectedDate
      ? 3
      : selectedProvider
        ? 2
        : selectedEvent
          ? 1
          : 0;

  // Enhanced handleSubmit that shows success notification
  const handleSubmitWithNotification = async (e) => {
    const result = await handleSubmit(e);
    if (result && result.success) {
      setBookingDetails({
        provider: selectedProvider,
        date: selectedDate,
        time: selectedTime,
        services: getSelectedServiceNames(),
      });
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setBookingDetails(null);
      }, 5000);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setBookingDetails(null);
  };

  // 🔥 AUTH PERSISTENCE: Enhanced reset that clears session storage
  // REPLACE THE handleFullReset function (lines 238-259) WITH:
  const handleFullReset = () => {
    resetBooking();
    setShowSuccess(false);
    setBookingDetails(null);
    setResetForm(true); // Trigger form reset in SearchSection

    // Reset all section visibility states
    setShowServicesSection(false);
    setShowDatePickerSection(true);
    setShowTimeSlotsSection(true);
    setShowBookingSummary(true);

    // Reset the form reset flag after a short delay
    setTimeout(() => setResetForm(false), 100);

    // Clear auth state from session storage
    sessionStorage.removeItem('userAuth');
    sessionStorage.removeItem('bookingState');
    console.log('🗑️ Cleared auth state from session storage');
  };

  // NEW: Handler for "No Thanks" that goes back to ENTRY point
  const handleNoThanks = () => {
  // Reset everything
  resetBooking();
  sessionStorage.clear();
  window.dispatchEvent(new CustomEvent('reset-booking-form'));
  console.log('🔙 Resetting booking form');
};

  // Handle OTP send for returning clients with redirect on failure
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setOtpError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!loginData.email || !emailRegex.test(loginData.email)) {
      setOtpError("Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!loginData.phonenumber || !phoneRegex.test(loginData.phonenumber)) {
      setOtpError("Please enter a valid 10-digit phone number.");
      return;
    }

    setOtpLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email,
          phonenumber: loginData.phonenumber
        }),
      });

      const result = await response.json();

      if (result.success) {
        setUserFlow("otp-verification");
      } else {
        // 🔥 REDIRECT TO MAIN BOOKING FLOW ON FAILURE
        const errorMsg = result.error || "Unable to verify client account";
        setOtpError(`${errorMsg}. Taking you to service search...`);

        // Redirect to main booking flow after showing message
        setTimeout(() => {
          console.log('🔀 Redirecting to new-user flow due to OTP failure');
          setUserFlow("new-user");
          setUserEmail(loginData.email);
          setFormData(prev => ({ ...prev, email: loginData.email }));
          // 🔥 IMPORTANT: Don't set currentEmail to true so email remains editable
          setCurrentEmail(false);
        }, 2500);
      }
    } catch (error) {
      console.error('OTP send error:', error);
      // 🔥 REDIRECT TO MAIN BOOKING FLOW ON NETWORK ERROR TOO
      setOtpError("Network issue. Taking you to service search...");

      // Redirect to main booking flow on network errors too
      setTimeout(() => {
        console.log('🔀 Redirecting to new-user flow due to network error');
        setUserFlow("new-user");
        setUserEmail(loginData.email);
        setFormData(prev => ({ ...prev, email: loginData.email }));
        // 🔥 IMPORTANT: Don't set currentEmail to true so email remains editable
        setCurrentEmail(false);
      }, 2500);
    } finally {
      setOtpLoading(false);
    }
  };


  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError("");

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(loginData.phonenumber)) {
      setOtpError("Invalid phone number format");
      setOtpLoading(false);
      return;
    }


    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email,
          phonenumber: loginData.phonenumber,
          otp: otp
        }),
      });

      const result = await response.json();
      console.log('OTP verification result:', result);

      if (result.success) {
        console.log(result.user)
        setOtpVerified(true);
        setUserFlow("new-user");

        // 🔥 SAVE AUTH STATE TO SESSION STORAGE
        const authData = {
          isAuthenticated: true,
          userEmail: result.user.email,
          userData: result.user,
          loginData: {
            email: loginData.email,
            phonenumber: loginData.phonenumber
          },
          timestamp: new Date().toISOString()
        };
        sessionStorage.setItem('userAuth', JSON.stringify(authData));
        console.log('💾 Saved auth state to session storage');
        window.dispatchEvent(new Event("session-changed"));

        handleFieldChange({
          target: { name: "city", value: "" }
        });

        handleFieldChange({
          target: { name: "state", value: "" }
        });



        handleFieldChange({
          target: { name: "fullAddress", value: "" }
        });

        setUserEmail(result.user.email);
        setFormData(prev => ({ ...prev, email: result.user.email }));
        if (!currentEmail) {
          setCurrentEmail(true);
        }


        // Auto-fill address if available
        if (result.user.lastAddress) {
          handleFieldChange({
            target: {
              name: "fullAddress",
              value: result.user.lastAddress.fullAddress
            }
          });
          handleFieldChange({
            target: {
              name: "city",
              value: result.user.lastAddress.city || ""
            }
          });
          handleFieldChange({
            target: {
              name: "state",
              value: result.user.lastAddress.state || ""
            }
          });
        }

        setUserEmail(result.user.email);
        setFormData(prev => ({ ...prev, email: result.user.email }));
        if (!currentEmail) {
          setCurrentEmail(true);
        }
      } else {
        setOtpError(result.error || "Invalid OTP");
      }
    } catch (error) {
      setOtpError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };


  // loadBlacklistedProviders management
  const loadBlacklistedProviders = async (email) => {
    if (!email) return;

    setLoadingBlacklist(true);
    try {
      console.log("Fetching blacklist for email:", email);
      const response = await fetch(`/api/blacklist?email=${email}`);
      const data = await response.json();
      console.log("Blacklist API response:", data);

      if (data.success) {
        setBlacklistedProviders(data.blockedProviderIds || []);
      } else {
        console.error("Blacklist API error:", data.message);
      }
    } catch (error) {
      console.error('Error fetching blacklist:', error);
    } finally {
      setLoadingBlacklist(false);
    }
  };

  // Function to show blacklisted providers
  const showBlacklistedProviders = () => {
    setCurrentView('blacklisted');
    loadBlacklistedProviders(userEmail);
  };

  // Function to show normal providers
  const showProviders = () => {
    setCurrentView('providers');
  };

  // Function to unblacklist a provider
  // Function to unblacklist a provider
  const handleUnblacklist = async (providerId) => {
    if (!userEmail) return;

    setUnblacklisting(providerId);
    try {
      console.log("Unblacklisting provider:", providerId);
      const res = await fetch(`/api/blacklist?email=${userEmail}&providerId=${providerId}`, {
        method: "DELETE",
      });

      const result = await res.json();
      console.log("Unblacklist response:", result);

      if (result.success) {
        // Remove from local state
        setBlacklistedProviders(prev => prev.filter(id => id !== providerId));

        // 🔥 REFRESH PROVIDERS DATA - Trigger a re-fetch of providers
        if (clientLocation && searchWithin) {
          console.log("Refreshing providers after unblacklist...");
          // You might need to add a refresh function to your useBooking hook
          // or trigger the search again
          getLatLngFromAddress(); // This will re-fetch providers with updated blacklist
        }

        alert("Provider has been unblacklisted successfully!");
      } else {
        alert(result.message || "Failed to unblacklist provider.");
      }
    } catch (error) {
      console.error("Unblacklist error:", error);
      alert("Something went wrong while unblacklisting the provider.");
    } finally {
      setUnblacklisting(null);
    }
  };

  const handleSearchWithReset = async () => {
    // Reset provider selection when doing a new search
    setSelectedProvider("");
    setShowServicesSection(false);

    // Then perform the address search
    await getLatLngFromAddress();
  };



  // Function to unblacklist all providers
  const handleUnblacklistAll = async () => {
    if (!userEmail) return;

    if (!confirm("Are you sure you want to unblacklist all providers?")) {
      return;
    }

    setLoadingBlacklist(true);
    try {
      // Unblacklist each provider one by one
      for (const providerId of blacklistedProviders) {
        console.log("Unblacklisting provider:", providerId);
        const res = await fetch(`/api/blacklist?email=${userEmail}&providerId=${providerId}`, {
          method: "DELETE",
        });
        const result = await res.json();
        console.log(`Unblacklist result for ${providerId}:`, result);
      }

      setBlacklistedProviders([]);
      alert("All providers have been unblacklisted successfully!");
    } catch (error) {
      console.error("Unblacklist all error:", error);
      alert("Something went wrong while unblacklisting providers.");
    } finally {
      setLoadingBlacklist(false);
    }
  };

  // Blacklisted Providers View Component

  const BlacklistedProvidersView = () => {
    // Get provider details from the providers prop
    const getProviderDetails = (providerId) => {
      const provider = providers.find(p => p.id.toString() === providerId.toString());
      return provider || {
        id: providerId,
        name: `Provider ${providerId}`,
        picture_path: null
      };
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl shadow-lg mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Hidden Providers
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage providers You&apos;ve hidden from your search results
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Header with actions */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Hidden Providers ({blacklistedProviders.length})
                </h2>
                <p className="text-gray-600 mt-1">
                  For: {userEmail}
                </p>
                <p className="text-gray-500 text-sm">
                  These providers are currently hidden from your search results
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Back to Providers Button */}
                <button
                  onClick={showProviders}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Booking
                </button>

                {blacklistedProviders.length > 0 && (
                  <button
                    onClick={handleUnblacklistAll}
                    disabled={loadingBlacklist}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Show All Again
                  </button>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loadingBlacklist && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600">Loading hidden providers...</p>
              </div>
            )}

            {/* Empty State */}
            {!loadingBlacklist && blacklistedProviders.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Hidden Providers</h3>
                <p className="text-gray-600 mb-6">You haven&apos;t hidden any providers yet.</p>
                <button
                  onClick={showProviders}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Booking
                </button>
              </div>
            )}

            {/* Providers List */}
            {!loadingBlacklist && blacklistedProviders.length > 0 && (
              <div className="space-y-4">
                {blacklistedProviders.map((providerId) => {
                  const provider = getProviderDetails(providerId);
                  return (
                    <div
                      key={providerId}
                      className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <img
                            src={
                              provider.picture_path
                                ? process.env.NEXT_PUBLIC_BASE_URL_IMAGE + provider.picture_path
                                : "/images/placeholder.jpg"
                            }
                            alt={provider.name}
                            className="w-12 h-12 object-cover rounded-2xl shadow-md"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {provider.name}
                          </h3>
                          <p className="text-gray-600 text-sm">Provider ID: {providerId}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUnblacklist(providerId)}
                        disabled={unblacklisting === providerId}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                      >
                        {unblacklisting === providerId ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Showing...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Show Again
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Entry Point - Two Buttons
  if (userFlow === "entry") {
    return (
      <div className="w-full max-w-6xl mx-auto mt-6 mb-16 p-6 space-y-10 bg-gradient-to-br from-white via-blue-50 to-indigo-100 shadow-2xl rounded-3xl border border-gray-100 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full translate-x-1/3 translate-y-1/3 opacity-20 blur-3xl"></div>

      
        <div className="relative text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Find Door-To-Door Services
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the perfect service provider near you and schedule your appointment in just a few clicks
          </p>
        </div>

 
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto py-8">
      
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100 text-center hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Find Door-To-Door Services</h3>
            <p className="text-gray-600 mb-6">New to our service? Find beauty professionals in your area.</p>
            <button
              onClick={() => {
                // Clear fields when manually starting new search
                handleFieldChange({
                  target: { name: "city", value: "" }
                });
                handleFieldChange({
                  target: { name: "state", value: "" }
                });
                handleFieldChange({
                  target: { name: "fullAddress", value: "" }
                });
                setUserFlow("new-user");
                /* setIsUnverifiedUser(true); // Add this line */
              }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Find Services
            </button>
          </div>

    
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100 text-center hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Client Login</h3>
            <p className="text-gray-600 mb-6">Returning client? Login to manage your appointments.</p>
            <button
              onClick={() => setUserFlow("returning-client")}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Client Login
            </button>
          </div>
        </div>
      </div>
    );
  } 

  // Returning Client Login Form
   if (userFlow === "returning-client") {
    return (
      <div className="w-full max-w-6xl mx-auto mt-6 mb-16 p-6 space-y-10 bg-gradient-to-br from-white via-blue-50 to-indigo-100 shadow-2xl rounded-3xl border border-gray-100 relative overflow-hidden">
       
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full translate-x-1/3 translate-y-1/3 opacity-20 blur-3xl"></div>

      
        <div className="relative text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Client Login
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your email and phone number to receive OTP
          </p>
        </div>

  
        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100">
          <form onSubmit={handleSendOTP} className="space-y-6">
          
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
                className={`w-full px-4 py-3 border rounded-2xl text-black placeholder-black transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${otpError.includes("email") ? "border-red-500" : "border-gray-300"
                  }`}
                required
              />
            </div>

         
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formatPhoneNumber(loginData.phonenumber)}
                onChange={(e) => {
                  const formattedValue = formatPhoneNumber(e.target.value);
                  const normalizedValue = normalizePhoneNumber(formattedValue);

                  setLoginData(prev => ({
                    ...prev,
                    phonenumber: normalizedValue
                  }));
                }}
                placeholder="Enter your phone number"
                className={`w-full px-4 py-3 border rounded-2xl text-black placeholder-black  transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${otpError.includes("phone") ? "border-red-500" : "border-gray-300"
                  }`}
                required
              />

            </div>

        
            {otpError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
                {otpError}
              </div>
            )}

         
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setUserFlow("entry")}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={otpLoading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {otpLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  } 

  // OTP Verification
   if (userFlow === "otp-verification") {
    return (
      <div className="w-full max-w-6xl mx-auto mt-6 mb-16 p-6 space-y-10 bg-gradient-to-br from-white via-blue-50 to-indigo-100 shadow-2xl rounded-3xl border border-gray-100 relative overflow-hidden">
      
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full translate-x-1/3 translate-y-1/3 opacity-20 blur-3xl"></div>

        
        <div className="relative text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Verify OTP
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter the OTP sent to your email and phone
          </p>
        </div>

  
        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100">
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-center text-2xl font-mono text-black placeholder-black"
                placeholder="Enter OTP"
                maxLength={6}
                required
              />
            </div>

            {otpError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
                {otpError}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setUserFlow("returning-client");
                  setOtpError("");
                  setOtp("");
                }}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={otpLoading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {otpLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  } 

  // Main Booking Flow (for both new users and returning clients)
  return (
    <div className="w-full max-w-6xl mx-auto mt-6 mb-16 p-6 space-y-10 bg-gradient-to-br from-white via-blue-50 to-indigo-100 shadow-2xl rounded-3xl border border-gray-100 relative overflow-hidden">
      {/* Success Notification */}
      {showSuccess && bookingDetails && (
        <SuccessNotification
          bookingDetails={bookingDetails}
          onClose={handleCloseSuccess}
        />
      )}

      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full translate-x-1/3 translate-y-1/3 opacity-20 blur-3xl"></div>

      {/* Header Section */}
      <div className="relative text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Find Door-To-Door Services
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find the perfect service provider near you and schedule your appointment in just a few clicks
        </p>
      </div>

      {/* Show booking form only if not in success state */}
      {!showSuccess ? (
        <>
          {/* Search Section */}
          <SearchSection
            address={address}
            searchWithin={searchWithin}
            userEmail={userEmail}
            onFieldChange={handleFieldChange}
            onSearchWithinChange={setSearchWithin}
            onUserEmailChange={setUserEmail}
            onSearchClick={async () => {
              // Reset provider selection and close services section
              setSelectedProvider("");
              setShowServicesSection(false);
              await getLatLngFromAddress();
            }}
            loadingAddress={loadingAddress}
            onBackToHome={handleFullReset}
            resetForm={resetForm}
          />

          {/* Loading State for Address Search */}
          {loadingAddress && (
            <div className="my-12 max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-12 shadow-lg border border-indigo-100">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Finding Your Location</h3>
                    <p className="text-gray-600">Searching for service providers in your area...</p>
                  </div>
                </div>
              </div>
            </div>
          )}


          {isSearchedAddress && !loadingAddress && !loadingProviders && filteredProviders.length === 0 && (
            <NoProvidersSection
              address={address}
              userEmail={userEmail}
              onFieldChange={handleFieldChange}
              onSubmit={handleNotFoundSubmit}
              onNoThanks={handleNoThanks}
            />
          )}


          {isSearchedAddress && clientLocation && !loadingAddress && (
            <div className="relative">
              {loadingProviders ? (
                <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-12 border border-gray-100 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">Finding Providers</h3>
                  <p className="text-gray-600 text-lg">Searching for the best professionals near you...</p>
                  <div className="mt-4 flex justify-center">
                    <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ) : (
                filteredProviders.length > 0 && (
                  currentView === 'providers' ? (
                    <ProvidersSection
                      providers={filteredProviders}
                      locations={locations}
                      clientLocation={clientLocation}
                      searchWithin={searchWithin}
                      selectedProvider={selectedProvider}
                      userEmail={userEmail}
                      onProviderSelect={handleProviderSelect}
                      onBlacklist={handleBlacklist}
                      events={events}
                      categories={categories}
                      onManageHidden={showBlacklistedProviders}
                    />
                  ) : (
                    <BlacklistedProvidersView />
                  )
                )
              )}
            </div>
          )}


          {/* Services Section - Only show when provider is selected AND services section is open */}
          {filteredProviders.length > 0 && selectedProvider && showServicesSection && (
            <div className="relative">
              {loadingServices ? (
                <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-12 border border-gray-100 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Loading Services</h3>
                  <p className="text-gray-600 text-lg">Preparing available services for your selection...</p>
                </div>
              ) : (
                <ServicesSection
                  services={services}
                  onCheckboxChange={handleCheckboxChange}
                  selectedProvider={selectedProvider}
                  providers={providers}
                  events={events}
                  onClose={handleCloseServicesSection}
                />
              )}
            </div>
          )}

          {/* Show "Select Services" button when provider is selected but services section is closed */}
          {filteredProviders.length > 0 && selectedProvider && !showServicesSection && (
            <div className="text-center">
              <button
                onClick={handleReopenServicesSection}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                Select Services
              </button>
            </div>
          )}

          {/* Date Picker Section */}
          { filteredProviders.length > 0 && selectedProvider && showDatePickerSection && (
            <DatePickerSection
              selectedDate={selectedDate}
              workCalandar={workCalandar}
              loadingCalendar={loadingCalendar}
              selectedProvider={selectedProvider}
              onDateSelect={setSelectedDate}
              onTimeReset={() => setSelectedTime("")}
              onMonthChange={handleMonthChange}
              onClose={handleCloseDatePickerSection}
            />
          )}

          {/* Show reopen button if DatePickerSection is closed but conditions are met */}
          { filteredProviders.length > 0 && selectedProvider && !showDatePickerSection && (
            <div className="text-center">
              <button
                onClick={handleReopenDatePickerSection}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Calendar className="w-5 h-5" />
                Show Date Picker
              </button>
            </div>
          )}

          {/* Time Slots Section with Loading */}
          {/* Time Slots Section with Loading */}
          { filteredProviders.length > 0 && selectedDate && showTimeSlotsSection && (
            <div className="relative">
              {loadingTimeSlots ? (
                <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-12 border border-gray-100 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">Loading Time Slots</h3>
                  <p className="text-gray-600 text-lg">Calculating available appointment times...</p>
                </div>
              ) : (
                <TimeSlotsSection
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  slots={slots}
                  dayMap={dayMap}
                  onTimeSelect={setSelectedTime}
                  onClose={handleCloseTimeSlotsSection}
                />
              )}
            </div>
          )}

          {/* Show reopen button if TimeSlotsSection is closed but conditions are met */}
          {filteredProviders.length > 0 && selectedDate && !showTimeSlotsSection && (
            <div className="text-center">
              <button
                onClick={handleReopenTimeSlotsSection}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Clock className="w-5 h-5" />
                Show Time Slots
              </button>
            </div>
          )}

          {/* Booking Summary & Form with Loading */}
          {/* Booking Summary & Form with Loading */}
          {filteredProviders.length > 0 && selectedTime && showBookingSummary && (
            <BookingSummary
              selectedEvent={selectedEvent}
              selectedProvider={selectedProvider}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              events={events}
              providers={providers}
              dayMap={dayMap}
              formData={formData}
              onSubmit={handleSubmitWithNotification}
              onChange={handleChange}
              getSelectedServiceNames={getSelectedServiceNames}
              submittingBooking={submittingBooking}
              onClose={handleCloseBookingSummary}
              selectedTreatment={selectedTreatment}
            />
          )}

          {/* Show reopen button if BookingSummary is closed but conditions are met */}
          {filteredProviders.length > 0 && selectedTime && !showBookingSummary && (
            <div className="text-center">
              <button
                onClick={handleReopenBookingSummary}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <CheckCircle className="w-5 h-5" />
                Show Booking Summary
              </button>
            </div>
          )}
        </>
      ) : (
        /* Success State - Option to book another appointment */
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleFullReset}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Book Another Appointment
            </button>
            <p className="text-gray-600 mt-4">
              Want to schedule another service? Start a new booking.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}