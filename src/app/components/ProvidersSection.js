import ProvidersMap from "./ProvidersMap";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

export default function ProvidersSection({
  providers = [],
  locations,
  clientLocation,
  searchWithin,
  selectedProvider,
  userEmail,
  onProviderSelect,
  onBlacklist,
  loadingProviders = false,
  events = [],
  categories = [],
  onManageHidden,
  onClose,
}) {
  const [blacklistingProvider, setBlacklistingProvider] = useState(null);

  useEffect(() => {
    console.log("✅ Providers received in ProvidersSection:", providers);
  }, [providers]);

  const getProviderCategories = (provider) => {
    if (!categories?.length || !provider?.services?.length) return [];

    const providerServiceIds = provider.services
      .map((id) => Number(id))
      .filter((id) => !isNaN(id));

    return categories.filter((category) => {
      if (!Array.isArray(category.events)) return false;

      const categoryEventIds = category.events
        .map((id) => Number(id))
        .filter((id) => !isNaN(id));

      return providerServiceIds.some((sid) =>
        categoryEventIds.includes(sid)
      );
    });
  };

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const providerCategories = getProviderCategories(provider);
      return providerCategories.length > 0;
    });
  }, [providers, categories]);

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
      {/* MAP CONTAINER */}
      <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-6 border relative">

        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

        {/* Home Button - top right */}
        <button
          onClick={() => {
            sessionStorage.clear();
            window.location.reload();
          }}
          className="absolute top-4 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl z-10 flex items-center gap-2"
        >
          Home
        </button>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 bg-gray-100 rounded-full"
          >
            ✕
          </button>
        )}

        <h3 className="text-lg font-semibold mb-4 text-black">Provider Locations</h3>

        <ProvidersMap
          providers={filteredProviders}
          locations={locations}
          userLocation={clientLocation}
          searchWithin={searchWithin}
        />
      </div>

      {/* PROVIDER LIST */}
      <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border relative">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">

          {/* LEFT SIDE */}
          <div>
            <h2 className="text-2xl font-bold text-black">Select Your Provider</h2>
            <p className="text-gray-600">
              {loadingProviders
                ? "Loading providers..."
                : `Choose from ${filteredProviders.length} available professional${
                    filteredProviders.length !== 1 ? "s" : ""
                  }`}
            </p>
          </div>

          {/* RIGHT SIDE → Home button + Search Radius */}
          <div className="flex items-center gap-4">

            {/* HOME BUTTON (now left of search radius) */}
            <button
              onClick={() => {
                sessionStorage.clear();
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Home
            </button>

            {/* SEARCH RADIUS */}
            <div className="text-right">
              <div className="text-sm text-gray-500">Search radius</div>
              <div className="text-lg font-semibold text-indigo-600">
                {searchWithin} miles
              </div>
            </div>

          </div>
        </div>

        {/* LOADING */}
        {loadingProviders && (
          <div className="text-center py-12">Finding providers…</div>
        )}

        {/* PROVIDER GRID */}
        {!loadingProviders && filteredProviders.length > 0 && (
          <div className="grid gap-4">
            {filteredProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isSelected={selectedProvider === provider.id}
                onSelect={onProviderSelect}
                onBlacklist={handleBlacklist}
                isBlacklisting={blacklistingProvider === provider.id}
                userEmail={userEmail}
                categories={categories}
              />
            ))}
          </div>
        )}

        {/* NO PROVIDERS */}
        {!loadingProviders && filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No Available Providers</h3>
            <p className="text-gray-600 mb-4">
              Try increasing your search radius or choosing another location.
            </p>

            {userEmail && (
              <button
                onClick={onManageHidden}
                className="px-6 py-3 bg-gray-100 rounded-xl"
              >
                Manage Hidden Providers
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* PROVIDER CARD */
function ProviderCard({
  provider,
  isSelected,
  onSelect,
  onBlacklist,
  isBlacklisting,
  userEmail,
  categories = [],
}) {

     // ---- GET PROVIDER CATEGORIES ----
  const getProviderCategories = () => {
    if (!categories?.length || !provider?.services?.length) return [];

    const providerServiceIds = provider.services
      .map((id) => Number(id))
      .filter((id) => !isNaN(id));

    return categories.filter((category) => {
      if (!Array.isArray(category.events)) return false;

      const categoryEventIds = category.events
        .map((id) => Number(id))
        .filter((id) => !isNaN(id));

      return providerServiceIds.some((sid) =>
        categoryEventIds.includes(sid)
      );
    });
  };

  const providerCategories = getProviderCategories();


  const getLocationDisplay = () => {
    if (!provider.nearestLocation) return "";
    if (provider.nearestLocation.title) {
      return provider.nearestLocation.title
        .split(",")
        .slice(-2)
        .join(",")
        .trim();
    }
    return provider.nearestLocation.city || "";
  };

  return (
    <div
      className={`p-6 rounded-2xl border cursor-pointer transition ${
        isSelected ? "border-indigo-500" : "border-gray-200"
      }`}
      onClick={() => !isBlacklisting && onSelect(provider.id)}
    >
      <div className="flex gap-4">
        <img
          src={
            provider.picture_path
              ? process.env.NEXT_PUBLIC_BASE_URL_IMAGE + provider.picture_path
              : "/images/placeholder.jpg"
          }
          className="w-20 h-20 rounded-xl object-cover"
        />

        <div className="flex-1">
          <h3 className="text-xl font-bold text-black">{provider.name}</h3>

          {provider.nearestLocation && (
            <p className="text-sm text-gray-600 mt-1">📍 {getLocationDisplay()}</p>
          )}

          {/* ---- CATEGORY TAGS BELOW NAME + ADDRESS ---- */}
{providerCategories.length > 0 && (
  <div className="mt-3">
    
    {/* Label on FIRST LINE */}
    <span className="text-xs font-semibold text-gray-600 block mb-1">
      Category
    </span>

    {/* Tags on SECOND LINE */}
    <div className="flex flex-wrap gap-2">
      {providerCategories.map((cat) => (
        <span
          key={cat.id}
          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
        >
          {cat.name}
        </span>
      ))}
    </div>

  </div>
)}




          {provider.distance != null && (
            <p className="text-sm text-green-600 mt-2">
              {provider.distance.toFixed(1)} miles away
            </p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-2 text-black">
          <button
            className={`px-4 py-2 rounded-xl ${
              isSelected ? "bg-indigo-500 text-black" : "bg-gray-300"
            }`}
          >
            {isSelected ? "Selected" : "View Services"}
          </button>

          {userEmail && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBlacklist(provider.id);
              }}
              className="text-red-600 text-sm"
            >
              Hide
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
