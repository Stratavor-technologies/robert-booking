import { useState, useEffect } from "react";

export default function ServicesSection({ 
  services, 
  onCheckboxChange, 
  loadingServices = false,
  selectedProvider,
  providers,
  events 
}) {
  const [selectedCount, setSelectedCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);

  // Get the provider's available services
  useEffect(() => {
    if (selectedProvider && providers && events) {
      const provider = providers.find(p => p.id === selectedProvider);
      if (provider && provider.services) {
        const providerServices = provider.services
          .map(serviceId => {
            const service = events.find(event => event.id === serviceId.toString());
            if (service) {
              // Create consistent key from service name
              const serviceKey = service.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/(^_+|_+$)/g, '');
              
              return {
                id: service.id,
                name: service.name,
                price: service.price || "0.00",
                currency: service.currency || "USD",
                key: serviceKey,
                description: service.description
              };
            }
            return null;
          })
          .filter(service => service !== null);

        console.log('Available services for provider:', {
          provider: provider.name,
          services: providerServices,
          currentServicesState: services
        });

        setAvailableServices(providerServices);
      }
    } else {
      setAvailableServices([]);
    }
  }, [selectedProvider, providers, events, services]);

  // Generate service groups based on available services
  const getServiceGroups = () => {
    if (availableServices.length === 0) {
      return [];
    }

    return [
      {
        title: "Available Services",
        icon: "💅",
        description: `Select the services you'd like from ${providers?.find(p => p.id === selectedProvider)?.name || 'this provider'}`,
        services: availableServices
      }
    ];
  };

  const serviceGroups = getServiceGroups();

  // Update selected count with animation
  useEffect(() => {
    const count = Object.values(services).filter(Boolean).length;
    if (count !== selectedCount) {
      setIsAnimating(true);
      setSelectedCount(count);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [services, selectedCount]);

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">3</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Select Services
          </h2>
          <p className="text-gray-600 mt-1">
            {availableServices.length > 0 
              ? `Choose from ${availableServices.length} available service${availableServices.length !== 1 ? 's' : ''}`
              : "No services available for this provider"}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loadingServices ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Services</h3>
          <p className="text-gray-600">Preparing available services for your selection...</p>
        </div>
      ) : (
        <>
          {/* Services Grid */}
          <div className="grid grid-cols-1 gap-8">
            {serviceGroups.map((group, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:border-purple-200 transition-all duration-300"
              >
                {/* Group Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-lg">
                    {group.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{group.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                  </div>
                </div>

                {/* Services List */}
                <div className="space-y-4">
                  {group.services.map((service) => (
                    <ServiceCheckbox
                      key={service.id}
                      service={service}
                      isChecked={services[service.key] || false}
                      onChange={onCheckboxChange}
                    />
                  ))}
                </div>

                {/* Services Count */}
                {group.services.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                      {group.services.length} service{group.services.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Selected Services Summary */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  selectedCount > 0 
                    ? 'bg-purple-100' 
                    : 'bg-gray-100'
                } ${isAnimating ? 'scale-110' : ''}`}>
                  {selectedCount > 0 ? (
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  {selectedCount} service{selectedCount !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              {selectedCount > 0 && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">Ready for next step</div>
                  <div className="text-sm font-semibold text-purple-600 flex items-center gap-1">
                    Continue to schedule
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Selection Guidance */}
            {availableServices.length > 0 && selectedCount === 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-blue-700">
                    Select one or more services to continue with your booking
                  </p>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {availableServices.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Selection Progress</span>
                  <span>{availableServices.length > 0 ? Math.round((selectedCount / availableServices.length) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${availableServices.length > 0 ? (selectedCount / availableServices.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ServiceCheckbox({ service, isChecked, onChange }) {
  const [isRecentlyChanged, setIsRecentlyChanged] = useState(false);

  const handleChange = (e) => {
    onChange(e);
    setIsRecentlyChanged(true);
    setTimeout(() => setIsRecentlyChanged(false), 300);
  };

  // Format price function
  const formatPrice = (price, currency) => {
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) return `$${0.00}`;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(priceNum);
  };

  return (
    <label 
      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group relative overflow-hidden
        ${isChecked 
          ? "border-purple-500 bg-purple-50 shadow-md" 
          : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm"
        } ${isRecentlyChanged ? 'scale-105' : ''}`}
    >
      {/* Animated background effect */}
      {isRecentlyChanged && (
        <div className="absolute inset-0 bg-purple-500 opacity-10 animate-pulse rounded-xl"></div>
      )}
      
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            <input
              type="checkbox"
              name={service.key}
              checked={isChecked}
              onChange={handleChange}
              className="sr-only"
            />
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all relative
              ${isChecked
                ? "border-purple-500 bg-purple-500 shadow-sm"
                : "border-gray-300 bg-white group-hover:border-purple-400"
              }`}
            >
              {isChecked && (
                <svg 
                  className="w-4 h-4 text-white transition-all duration-200"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
              
              {/* Ripple effect */}
              {isRecentlyChanged && (
                <div className="absolute inset-0 border-2 border-purple-500 rounded-lg animate-ping opacity-60"></div>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <span className={`font-medium transition-colors block
              ${isChecked ? "text-purple-700 font-semibold" : "text-gray-700"}
            `}>
              {service.name}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className={`text-sm font-semibold px-3 py-1 rounded-lg transition-colors
          ${isChecked ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}
        `}>
          {formatPrice(service.price, service.currency)}
        </div>
      </div>
    </label>
  );
}