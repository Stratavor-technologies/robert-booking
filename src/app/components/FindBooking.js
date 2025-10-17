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
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [userFlow, setUserFlow] = useState("entry"); // 'entry', 'new-user', 'returning-client', 'otp-verification'
  const [loginData, setLoginData] = useState({
    email: "",
    phonenumber: ""
  });
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");

  const {
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
    getSelectedServiceNames,
    resetBooking
  } = useBooking({ providers, events, locations, clients });

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
      
      // Auto-hide success notification after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setBookingDetails(null);
      }, 5000);
    }
  };

  // Manual close handler for success notification
  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setBookingDetails(null);
  };

  // Reset everything including success state
  const handleFullReset = () => {
    resetBooking();
    setShowSuccess(false);
    setBookingDetails(null);
    setUserFlow("entry");
    setOtpVerified(false);
    setOtp("");
    setLoginData({ email: "", phonenumber: "" });
  };

  // Handle OTP send for returning clients
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError("");

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
        setOtpError(result.error || "Failed to send OTP");
      }
    } catch (error) {
      setOtpError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError("");

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

      if (result.success) {
        setOtpVerified(true);
        setUserFlow("new-user"); // Switch to booking flow
        
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
        
        // Set user email
        setUserEmail(result.user.email);
      } else {
        setOtpError(result.error || "Invalid OTP");
      }
    } catch (error) {
      setOtpError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Entry Point - Two Buttons
  if (userFlow === "entry") {
    return (
      <div className="w-full max-w-6xl mx-auto mt-6 mb-16 p-6 space-y-10 bg-gradient-to-br from-white via-blue-50 to-indigo-100 shadow-2xl rounded-3xl border border-gray-100 relative overflow-hidden">
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
            Book Your Appointment
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the perfect service provider near you and schedule your appointment in just a few clicks
          </p>
        </div>

        {/* Two Button Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto py-8">
          {/* Find Door-To-Door Services */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100 text-center hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Find Door-To-Door Services</h3>
            <p className="text-gray-600 mb-6">New to our service? Find beauty professionals in your area.</p>
            <button
              onClick={() => setUserFlow("new-user")}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Find Services
            </button>
          </div>

          {/* Client Login */}
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
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full translate-x-1/3 translate-y-1/3 opacity-20 blur-3xl"></div>
        
        {/* Header Section */}
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

        {/* Login Form */}
        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100">
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={loginData.phonenumber}
                onChange={(e) => setLoginData(prev => ({ ...prev, phonenumber: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                placeholder="Enter your phone number"
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
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full translate-x-1/3 translate-y-1/3 opacity-20 blur-3xl"></div>
        
        {/* Header Section */}
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
          <p className="text-sm text-gray-500">
            For testing, use: <strong>1234</strong>
          </p>
        </div>

        {/* OTP Form */}
        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100">
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-center text-2xl font-mono"
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
                onClick={() => setUserFlow("returning-client")}
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
          Book Your Appointment
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find the perfect service provider near you and schedule your appointment in just a few clicks
        </p>
        
        {/* Progress Bar - Only show if not in success state */}
        {!showSuccess && (
          <div className="max-w-2xl mx-auto pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-semibold text-indigo-600">{Math.round((currentStep / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        )}
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
            onSearchClick={() => getLatLngFromAddress(address)}
            loadingAddress={loadingAddress}
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

          {/* Results Header - Only show when not loading */}
          {isSearchedAddress && !loadingAddress && !loadingProviders && (
            <div className="my-12 max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 shadow-lg border border-indigo-100">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-white rounded-full p-3 shadow-lg border border-indigo-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="text-center space-y-4 pt-4">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {filteredProviders.length} Service Provider{filteredProviders.length !== 1 ? 's' : ''} Found Near You
                  </h2>
                  
                  {/* Subtitle with dynamic messaging */}
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    {filteredProviders.length > 0 ? (
                      <>We found the perfect professionals ready to serve you in your area</>
                    ) : (
                      <>No providers found within your search area. Try expanding your search radius.</>
                    )}
                  </p>
                  
                  {/* Stats Bar */}
                  {filteredProviders.length > 0 && (
                    <div className="flex justify-center items-center gap-6 pt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Available now</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span>Within {searchWithin} miles</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* No Providers Found */}
          {isSearchedAddress && !loadingAddress && !loadingProviders && filteredProviders.length === 0 && (
            <NoProvidersSection
              address={address}
              onFieldChange={handleFieldChange}
              onSubmit={handleNotFoundSubmit}
            />
          )}

          {/* Providers Section with Loading */}
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
                  <ProvidersSection
                    providers={filteredProviders}
                    locations={locations}
                    clientLocation={clientLocation}
                    searchWithin={searchWithin}
                    selectedProvider={selectedProvider}
                    userEmail={userEmail}
                    onProviderSelect={setSelectedProvider}
                    onBlacklist={handleBlacklist}
                  />
                )
              )}
            </div>
          )}

          {/* Services Section */}
          {filteredProviders.length > 0 && selectedProvider && (
            <div className="relative">
              {loadingServices ? (
                <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-12 border border-gray-100 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">Loading Services</h3>
                  <p className="text-gray-600 text-lg">Preparing available services for your selection...</p>
                </div>
              ) : (
                <ServicesSection
                  services={services}
                  onCheckboxChange={handleCheckboxChange}
                />
              )}
            </div>
          )}

          {/* Date Picker Section */}
          {filteredProviders.length > 0 && selectedProvider && (
            <DatePickerSection
              selectedDate={selectedDate}
              workCalandar={workCalandar}
              loadingCalendar={loadingCalendar}
              selectedProvider={selectedProvider}
              onDateSelect={setSelectedDate}
              onTimeReset={() => setSelectedTime("")}
              onMonthChange={handleMonthChange}
            />
          )}

          {/* Time Slots Section with Loading */}
          {filteredProviders.length > 0 && selectedDate && (
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
                />
              )}
            </div>
          )}

          {/* Booking Summary & Form with Loading */}
          {filteredProviders.length > 0 && selectedTime && (
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
            />
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