"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function BlacklistedProvidersClient({ allProviders }) {
  const [blacklistedProviders, setBlacklistedProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unblacklisting, setUnblacklisting] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get email from URL parameters on component mount
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setUserEmail(emailFromUrl);
      fetchBlacklistedProviders(emailFromUrl);
    } else {
      // If no email in URL, redirect back to home
      router.push('/');
    }
  }, [searchParams, router]);

  // Fetch blacklisted providers
  const fetchBlacklistedProviders = async (email) => {
    if (!email) return;
    
    setLoading(true);
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
      setLoading(false);
    }
  };

  // Get provider details from the allProviders prop
  const getProviderDetails = (providerId) => {
    const provider = allProviders.find(p => p.id.toString() === providerId.toString());
    
    return provider || { 
      id: providerId, 
      name: `Provider ${providerId}`, 
      picture_path: null 
    };
  };

  // Unblacklist a provider
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

  // Unblacklist all providers
  const handleUnblacklistAll = async () => {
    if (!userEmail) return;

    if (!confirm("Are you sure you want to unblacklist all providers?")) {
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
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
            Manage providers you've hidden from your search results
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
              {/* Back to Booking Button */}
              <button
                onClick={() => router.push('/')}
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
                  disabled={loading}
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
          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600">Loading hidden providers...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && blacklistedProviders.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Hidden Providers</h3>
              <p className="text-gray-600 mb-6">You haven't hidden any providers yet.</p>
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Booking
              </button>
            </div>
          )}

          {/* Providers List */}
          {!loading && blacklistedProviders.length > 0 && (
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
}