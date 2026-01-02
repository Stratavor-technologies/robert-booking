import { useState, useEffect } from "react";

export default function ServicesSection({ 
  services, 
  onCheckboxChange, 
  loadingServices = false,
  selectedProvider,
  providers,
  events,
  onClose,
  onTreatmentSelect
}) {
  const [selectedCount, setSelectedCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [showAllServices, setShowAllServices] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showTreatmentOptions, setShowTreatmentOptions] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);

  // Get the provider's available services
  useEffect(() => {
    if (selectedProvider && providers && events) {
      const provider = providers.find(p => p.id === selectedProvider);
      if (provider && provider.services) {
        const providerServices = provider.services
          .map(serviceId => {
            const service = events.find(event => event.id === serviceId.toString());
            if (service) {
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
                description: service.description,
                duration: service.duration || 60
              };
            }
            return null;
          })
          .filter(service => service !== null);

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

    const servicesToShow = showAllServices 
      ? availableServices 
      : availableServices.slice(0, 5);

    return [
      {
        title: "Available Services",
        icon: "💅",
        description: `Select the services you'd like from ${providers?.find(p => p.id === selectedProvider)?.name || 'this provider'}`,
        services: servicesToShow,
        showAllButton: availableServices.length > 5 && !showAllServices
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

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Toggle show all services
  const toggleShowAllServices = () => {
    setShowAllServices(!showAllServices);
  };

  // Handle service selection - show treatment options
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setShowTreatmentOptions(true);
  };

  // Handle treatment selection
  const handleTreatmentSelect = (treatmentData) => {
    // Update local state
    setSelectedTreatment(treatmentData.treatmentType || treatmentData.treatment?.id);
    
    // Pass to parent component
    if (onTreatmentSelect) {
      onTreatmentSelect(treatmentData);
    }
    
    // Also mark the service as selected
    if (selectedService && onCheckboxChange) {
      const serviceKey = selectedService.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_+|_+$)/g, '');
      
      const syntheticEvent = {
        target: {
          name: serviceKey,
          checked: true
        }
      };
      onCheckboxChange(syntheticEvent);
    }
  };

  // Go back to service selection
  const handleBackToServices = () => {
    setShowTreatmentOptions(false);
    setSelectedService(null);
    setSelectedTreatment(null);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-gray-100 relative">
      {/* Cross Button */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 group"
        aria-label="Close services section"
      >
        <svg 
          className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">3</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {showTreatmentOptions ? "Select Treatment" : "Select Services"}
          </h2>
          <p className="text-gray-600 mt-1">
            {showTreatmentOptions 
              ? `Choose treatment type for ${selectedService?.name}`
              : availableServices.length > 0 
                ? `Choose from ${availableServices.length} available service${availableServices.length !== 1 ? 's' : ''}`
                : "No services available for this provider"}
          </p>
        </div>
      </div>

      {/* Back button when in treatment selection */}
      {showTreatmentOptions && (
        <button
          onClick={handleBackToServices}
          className="mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to services</span>
        </button>
      )}

      {/* Loading State */}
      {loadingServices ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Services</h3>
          <p className="text-gray-600">Preparing available services for your selection...</p>
        </div>
      ) : showTreatmentOptions ? (
        <TreatmentOptions 
          service={selectedService}
          onTreatmentSelect={handleTreatmentSelect}
          selectedTreatment={selectedTreatment}
        />
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
                    <ServiceCard
                      key={service.id}
                      service={service}
                      isChecked={services[service.key] || false}
                      onSelect={handleServiceSelect}
                    />
                  ))}
                </div>

                {/* Show All Services Button */}
                {group.showAllButton && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={toggleShowAllServices}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 font-medium rounded-xl border border-purple-200 hover:border-purple-300 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 group"
                    >
                      <span>View All {availableServices.length} Services</span>
                      <svg 
                        className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Show Less Button (when all services are shown) */}
                {showAllServices && availableServices.length > 5 && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={toggleShowAllServices}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-gray-300 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 group"
                    >
                      <svg 
                        className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      <span>Show Less</span>
                    </button>
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

// Service Card Component
function ServiceCard({ service, isChecked, onSelect }) {
  const [isRecentlyChanged, setIsRecentlyChanged] = useState(false);

  const handleClick = () => {
    onSelect(service);
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
    <div 
      onClick={handleClick}
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

        {/* Price and Duration */}
        <div className="text-right">
          <div className={`text-sm font-semibold px-3 py-1 rounded-lg transition-colors mb-1
            ${isChecked ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}
          `}>
            {formatPrice(service.price, service.currency)}
          </div>
          <div className="text-xs text-gray-500">
            {service.duration} min
          </div>
        </div>
      </div>
    </div>
  );
}

// Treatment Options Component
function TreatmentOptions({ service, onTreatmentSelect, selectedTreatment }) {
  const treatments = [
    {
      id: 'express',
      name: 'Express Manicure',
      description: 'Quick and efficient treatment',
      duration: 30,
      price: parseFloat(service.price) * 0.8,
      originalPrice: parseFloat(service.price),
      icon: '⚡'
    },
    {
      id: 'classic',
      name: 'Classic Manicure',
      description: 'Standard treatment with full service',
      duration: service.duration || 60,
      price: parseFloat(service.price),
      icon: '✨'
    },
    {
      id: 'deluxe',
      name: 'Deluxe Manicure',
      description: 'Premium treatment with extras',
      duration: (service.duration || 60) * 1.5,
      price: parseFloat(service.price) * 1.5,
      icon: '🌟'
    }
  ];

  // FIXED: Removed setSelectedTreatment from here
  const handleTreatmentClick = (treatment) => {
    // Pass the treatment object to parent
    onTreatmentSelect({
      service: service,
      treatment: treatment,
      treatmentType: treatment.id,
      treatmentName: treatment.name
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: service.currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Treatment Edition Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            ✨
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
              TREATMENT EDITION
            </h3>
            <p className="text-gray-600">Choose your preferred treatment type</p>
          </div>
        </div>
        
        {/* Treatment Stats */}
        <div className="grid grid-cols-3 gap-4">
          {treatments.map((treatment, index) => (
            <div key={treatment.id} className="text-center">
              <div className="text-lg font-bold text-gray-800">
                {treatment.id === 'express' ? '30/13' : 
                 treatment.id === 'classic' ? '15/16' : '6/17'}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {treatment.name.split(' ')[0]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Treatments */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Available Treatments</h4>
        <div className="space-y-4">
          {treatments.map((treatment) => (
            <div
              key={treatment.id}
              onClick={() => handleTreatmentClick(treatment)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg relative overflow-hidden group
                ${selectedTreatment === treatment.id 
                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
            >
              {/* Selected indicator */}
              {selectedTreatment === treatment.id && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all duration-300
                  ${selectedTreatment === treatment.id 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                  }`}>
                  {treatment.icon}
                </div>

                {/* Treatment Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-800 text-lg">{treatment.name}</h5>
                      <p className="text-gray-600 text-sm mt-1">{treatment.description}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${selectedTreatment === treatment.id ? 'text-purple-700' : 'text-gray-800'}`}>
                        {formatPrice(treatment.price)}
                      </div>
                      {treatment.originalPrice && treatment.price < treatment.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(treatment.originalPrice)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Duration */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{treatment.duration} minutes</span>
                    </div>
                    
                    <div className={`px-4 py-2 rounded-lg font-medium transition-all duration-300
                      ${selectedTreatment === treatment.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                      {selectedTreatment === treatment.id ? 'Selected ✓' : 'Select'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Step Guidance */}
      <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-green-700 font-medium">
              {selectedTreatment 
                ? `Selected: ${treatments.find(t => t.id === selectedTreatment)?.name || 'Treatment'}. Continue to date selection.`
                : 'Select a treatment type to proceed to date selection'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}