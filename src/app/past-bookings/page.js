"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PastBookings() {
  const [bookings, setBookings] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email");
  
  // Get user email from URL parameter or localStorage
  const [userEmail, setUserEmail] = useState(emailFromUrl || "");

  useEffect(() => {
    // If email is in URL, use it and also store in localStorage
    if (emailFromUrl) {
      setUserEmail(emailFromUrl);
      localStorage.setItem("userEmail", emailFromUrl);
    } else {
      // Fallback to localStorage if no URL parameter
      const storedEmail = localStorage.getItem("userEmail");
      if (storedEmail) {
        setUserEmail(storedEmail);
      }
    }
  }, [emailFromUrl]);

  useEffect(() => {
    if (userEmail) {
      fetchProvidersAndBookings();
    } else {
      setLoading(false);
    }
  }, [userEmail]);

  const fetchProvidersAndBookings = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Fetching providers and bookings for email:", userEmail);
      
      // Fetch providers first - using the same endpoint as your booking page
      const providersResponse = await fetch('/api/providers');
      let providersData = [];
      
      if (providersResponse.ok) {
  const providersResult = await providersResponse.json();
  let providersData = providersResult.data || providersResult || [];

  // ✅ Ensure it's always an array
  if (!Array.isArray(providersData)) {
    providersData = Object.values(providersData);
  }

  console.log("Normalized Providers Data:", providersData);
  setProviders(providersData);
}
      // Then fetch bookings
      const bookingsResponse = await fetch(`/api/bookings?email=${encodeURIComponent(userEmail)}`);
      const bookingsResult = await bookingsResponse.json();
      
      console.log("Bookings API Response:", bookingsResult);
      
      if (bookingsResult.success) {
        setBookings(bookingsResult.data || []);
      } else {
        setError(bookingsResult.error || "Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshBookings = () => {
    if (userEmail) {
      fetchProvidersAndBookings();
    }
  };

  // Helper function to get service names from the services object
  const getServiceNames = (services) => {
    if (!services) return ["No services selected"];
    
    const serviceNames = [];
    if (services.manicure) serviceNames.push("Manicure");
    if (services.manicureGel) serviceNames.push("Manicure Gel");
    if (services.pedicure) serviceNames.push("Pedicure");
    if (services.pedicureGel) serviceNames.push("Pedicure Gel");
    if (services.eyelashFull) serviceNames.push("Eyelash Full");
    if (services.eyelashRefill) serviceNames.push("Eyelash Refill");
    if (services.waxEyebrows) serviceNames.push("Wax Eyebrows");
    if (services.waxLips) serviceNames.push("Wax Lips");
    
    return serviceNames.length > 0 ? serviceNames : ["No services selected"];
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Helper function to format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "";
    
    // Convert time string like "11:30" to "11:30 AM"
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Helper function to get provider name from providers array
  const getProviderName = (providerId) => {
    if (!providers || providers.length === 0) {
      return `Provider ${providerId}`;
    }
    
    const provider = providers.find(p => p.id === providerId.toString());
    return provider ? provider.name : `Provider ${providerId}`;
  };

  // Helper function to get provider details
  const getProviderDetails = (providerId) => {
    if (!providers || providers.length === 0) {
      return null;
    }
    
    return providers.find(p => p.id === providerId.toString());
  };

  // Calculate total amount for services (you can customize this based on your pricing)
  const calculateTotalAmount = (services) => {
    if (!services) return "0.00";
    
    let total = 0;
    // Add your service pricing here
    if (services.manicure) total += 25;
    if (services.manicureGel) total += 15;
    if (services.pedicure) total += 35;
    if (services.pedicureGel) total += 20;
    if (services.eyelashFull) total += 60;
    if (services.eyelashRefill) total += 40;
    if (services.waxEyebrows) total += 15;
    if (services.waxLips) total += 10;
    
    return total.toFixed(2);
  };

  if (loading) {
    return (
      <>
        <Header userEmail={userEmail} />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-6xl mx-auto p-6">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Your Bookings</h3>
              <p className="text-gray-600">Please wait while we fetch your appointment history...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header userEmail={userEmail} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Your Bookings
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {userEmail ? `Manage and view all your appointments for ${userEmail}` : "Your appointment history"}
            </p>
          </div>

          {/* Stats and Actions */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-200">
                <span className="text-sm text-gray-600">Total Bookings:</span>
                <span className="ml-2 font-semibold text-blue-600">{bookings.length}</span>
              </div>
              {bookings.length > 0 && (
                <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-200">
                  <span className="text-sm text-gray-600">Upcoming:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    {bookings.filter(booking => new Date(booking.date) > new Date()).length}
                  </span>
                </div>
              )}
            </div>
            
            {userEmail && (
              <div className="flex gap-3">
                <button
                  onClick={refreshBookings}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-50 transition shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <Link 
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Booking
                </Link>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {!userEmail ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-lg border border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Not Logged In</h3>
                <p className="text-gray-600 mb-6 text-lg">Please log in to view your past bookings and manage your appointments.</p>
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go to Homepage
                </Link>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-lg border border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Bookings Yet</h3>
                <p className="text-gray-600 mb-6 text-lg">You haven't made any bookings yet. Start by booking your first appointment with our service providers.</p>
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Book Your First Appointment
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking, index) => {
                const providerDetails = getProviderDetails(booking.provider);
                const isUpcoming = new Date(booking.date) > new Date();
                const totalAmount = calculateTotalAmount(booking.services);
                
                return (
                  <div key={booking._id || index} className="bg-white rounded-3xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-200">
                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-3 h-3 rounded-full ${isUpcoming ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {getServiceNames(booking.services).join(", ")}
                          </h3>
                        </div>
                  {/* Provider image and name */}
<div className="flex items-center gap-3 mb-2">
  {providerDetails?.picture_path ? (
    <img
      src={
        providerDetails.picture_path
          ? process.env.NEXT_PUBLIC_BASE_URL_IMAGE + providerDetails.picture_path
          : "/images/placeholder.jpg"
      }
      alt={providerDetails.name || "Provider"}
      className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
    />
  ) : (
    <img
      src="/images/placeholder.jpg"
      alt="Placeholder"
      className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
    />
  )}

  <p className="text-lg text-gray-700 font-semibold">
    {getProviderName(booking.provider)}
  </p>
</div>

                        {providerDetails && providerDetails.description && (
                          <p 
                            className="text-gray-600 mb-3 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: providerDetails.description }}
                          />
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          isUpcoming 
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {isUpcoming ? 'Upcoming' : 'Completed'}
                        </span>
                        {totalAmount !== "0.00" && (
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-xl font-bold text-blue-600">${totalAmount}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Date</p>
                          <p className="text-gray-900 font-semibold">{formatDate(booking.date)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Time</p>
                          <p className="text-gray-900 font-semibold">{formatTime(booking.time)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Client</p>
                          <p className="text-gray-900 font-semibold">{booking.fullname}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Phone</p>
                          <p className="text-gray-900 font-semibold">{booking.phonenumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    {booking.clientaddress && (
                      <div className="mb-6 p-5 bg-blue-50 rounded-2xl border border-blue-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-blue-900">Service Address</h4>
                        </div>
                        <p className="text-blue-800 font-medium ml-11">
                          {booking.clientaddress.fullAddress}
                        </p>
                        {booking.clientaddress.city && booking.clientaddress.state && (
                          <p className="text-blue-600 text-sm ml-11 mt-1">
                            {booking.clientaddress.city}, {booking.clientaddress.state}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Provider Contact Information */}
                    {providerDetails && (providerDetails.phone || providerDetails.email) && (
                      <div className="mb-6 p-5 bg-green-50 rounded-2xl border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Provider Contact Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                          {providerDetails.phone && (
                            <div className="flex items-center gap-3">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <div>
                                <p className="text-sm text-green-700 font-medium">Phone</p>
                                <p className="text-green-900 font-semibold">{providerDetails.phone}</p>
                              </div>
                            </div>
                          )}
                          {providerDetails.email && (
                            <div className="flex items-center gap-3">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <div>
                                <p className="text-sm text-green-700 font-medium">Email</p>
                                <p className="text-green-900 font-semibold">{providerDetails.email}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Booking Metadata */}
                    <div className="pt-5 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Booking ID: {booking._id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Created: {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}