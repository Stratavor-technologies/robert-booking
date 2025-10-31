import ProvidersMap from "./ProvidersMap";
import { useState } from "react";
import Link from "next/link";

export default function ProvidersSection({
  providers,
  locations,
  clientLocation,
  searchWithin,
  selectedProvider,
  userEmail,
  onProviderSelect,
  onBlacklist,
  loadingProviders = false
}) {
  const [blacklistingProvider, setBlacklistingProvider] = useState(null);
  if(providers)
  {
    console.log("userEmail raw:", JSON.stringify(userEmail));
console.log("isEmpty?", userEmail === "");
    console.log(providers)
  }

  const handleBlacklist = async (providerId) => {
    setBlacklistingProvider(providerId);
    try {
      await onBlacklist(providerId);
    } finally {
      setBlacklistingProvider(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Map Section */}
      <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Provider Locations</h3>
            <p className="text-sm text-gray-600">View all available providers in your area</p>
          </div>
        </div>
        <ProvidersMap
          providers={providers}
          locations={locations}
          userLocation={clientLocation}
          searchWithin={searchWithin}
        />
      </div>

      {/* Providers List */}
      <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">{providers.length}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Select Your Provider
              </h2>
              <p className="text-gray-600 mt-1">
                {loadingProviders ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading providers...
                  </span>
                ) : (
                  `Choose from ${providers.length} available professional${providers.length !== 1 ? 's' : ''}`
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-gray-500">Search radius</div>
              <div className="text-lg font-semibold text-indigo-600">{searchWithin} miles</div>
            </div>
            
            {/* Manage Hidden Providers Button */}
            {userEmail && (
              <Link 
                href={`/blacklisted?email=${encodeURIComponent(userEmail)}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all duration-200 border border-gray-300 hover:border-gray-400 hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Manage Hidden
              </Link>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loadingProviders ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Finding Providers</h3>
            <p className="text-gray-600">Searching for the best professionals near you...</p>
          </div>
        ) : (
          /* Providers Grid */
          <div className="grid gap-4">
            {providers.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isSelected={selectedProvider === provider.id}
                onSelect={onProviderSelect}
                onBlacklist={handleBlacklist}
                isBlacklisting={blacklistingProvider === provider.id}
                userEmail={userEmail}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loadingProviders && providers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Providers Found</h3>
            <p className="text-gray-600 mb-6">Try expanding your search radius or check back later.</p>
            
            {/* Show Manage Hidden button in empty state too */}
            {userEmail && (
              <Link 
                href={`/blacklisted?email=${encodeURIComponent(userEmail)}`}
                className="inline-flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 border border-gray-300 hover:border-gray-400 hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Manage Hidden Providers
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProviderCard({ provider, isSelected, onSelect, onBlacklist, isBlacklisting = false ,userEmail }) {
  return (
    <div
      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${
        isSelected
          ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-lg"
          : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md"
      } ${isBlacklisting ? "opacity-50" : ""}`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Blacklisting Overlay */}
      {isBlacklisting && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 font-medium">Hiding provider...</p>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Provider Image */}
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              src={
                provider.picture_path
                  ? process.env.NEXT_PUBLIC_BASE_URL_IMAGE + provider.picture_path
                  : "/images/placeholder.jpg"
              }
              alt={provider.name}
              className="w-24 h-24 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all"
            />
            {isSelected && (
              <div className="absolute inset-0 border-2 border-indigo-500 rounded-xl"></div>
            )}
          </div>
        </div>

        {/* Provider Info */}
        <div 
          className="flex-1 min-w-0"
          onClick={() => !isBlacklisting && onSelect(provider.id)}
        >
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {provider.name}
              </h3>
              {provider.nearestLocation && (
                <p className="text-gray-600 text-sm mt-1 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                 {  provider.nearestLocation.city==provider.nearestLocation.address2  ? provider.nearestLocation.city  : provider.nearestLocation.city +" " +provider.nearestLocation.address2 } 
                </p>
              )}
            </div>

            {/* Distance and Status */}
            <div className="flex items-center gap-4">
              {provider.distance && (
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {provider.distance.toFixed(1)} miles away
                </div>
              )}
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Available Now
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 justify-center">
          <button
            onClick={() => !isBlacklisting && onSelect(provider.id)}
            disabled={isBlacklisting}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              isSelected
                ? "bg-indigo-500 text-white shadow-md hover:bg-indigo-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } ${isBlacklisting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSelected ? "Selected" : "Select"}
          </button>
          

          {userEmail ?  <button
            onClick={(e) => {
              e.stopPropagation();
              !isBlacklisting && onBlacklist(provider.id);
            }}
            disabled={isBlacklisting}
            className={`flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-medium transition-all group/blacklist ${
              isBlacklisting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isBlacklisting ? (
              <>
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                Hiding...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 group-hover/blacklist:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Hide
              </>
            )}
          </button>  : <></>}


         

        </div>
      </div>
    </div>
  );
}