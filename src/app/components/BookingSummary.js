// components/BookingSummary.jsx
import { CheckCircle, User, Calendar, Clock, MapPin, Loader2, Shield, Mail, Phone } from "lucide-react";
import { useState, useEffect } from "react";

export default function BookingSummary({
  selectedEvent,
  selectedProvider,
  selectedDate,
  selectedTime,
  events,
  providers,
  dayMap,
  formData,
  onSubmit,
  onChange,
  getSelectedServiceNames,
  submittingBooking = false,
  currentEmail,
}) {
  const providerArray = Array.isArray(providers) ? providers : Object.values(providers || {});
  const eventArray = Array.isArray(events) ? events : Object.values(events || {});

  const [formValid, setFormValid] = useState(false);

  // Check form validity
  useEffect(() => {
    const isValid = formData.name &&
      formData.email &&
      formData.phone &&
      formData.privacy;
    setFormValid(isValid);
  }, [formData]);

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">6</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Confirm Your Booking
          </h2>
          <p className="text-gray-600 mt-1">Review your appointment details and complete booking</p>
        </div>
      </div>

      {/* Loading Overlay */}
      {submittingBooking && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
            <div>
              <p className="text-gray-800 font-semibold text-lg mb-1">Processing Booking</p>
              <p className="text-gray-600 text-sm">Please wait while we confirm your appointment...</p>
            </div>
            <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        {/* Booking Summary */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Appointment Summary</h3>
          </div>

          <SummaryTable
            selectedEvent={selectedEvent}
            selectedProvider={selectedProvider}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            eventArray={eventArray}
            providerArray={providerArray}
            dayMap={dayMap}
            getSelectedServiceNames={getSelectedServiceNames}
          />
        </div>

        {/* Booking Form */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Your Information</h3>
          </div>

          <BookingForm
            formData={formData}
            onSubmit={onSubmit}
            onChange={onChange}
            submittingBooking={submittingBooking}
            formValid={formValid}
            currentEmail={currentEmail}
          />
        </div>
      </div>

      {/* Success Preview */}
      {!submittingBooking && formValid && (
        <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800">Ready to book!</p>
              <p className="text-xs text-emerald-600">All required information is complete. Click confirm to finalize your appointment.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryTable({ selectedEvent, selectedProvider, selectedDate, selectedTime, eventArray, providerArray, dayMap, getSelectedServiceNames }) {
  const provider = providerArray.find((provider) => selectedProvider == provider.id);

  const summaryItems = [
    {
      icon: MapPin,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      label: "Services",
      value: getSelectedServiceNames(),
      description: "Selected services for your appointment"
    },
    {
      icon: User,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      label: "Provider",
      value: provider?.name || "N/A",
      description: "Your service professional"
    },
    {
      icon: Calendar,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      label: "Date",
      value: `${dayMap[selectedDate.getDay()]}, ${selectedDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })}`,
      description: "Appointment date"
    },
    {
      icon: Clock,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      label: "Time",
      value: selectedTime,
      description: "Appointment time"
    }
  ];

  return (
    <div className="space-y-4">
      {summaryItems.map((item, index) => (
        <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-all duration-200">
          <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <item.icon className={`w-6 h-6 ${item.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="font-semibold text-gray-800 truncate">{item.value}</p>
            <p className="text-xs text-gray-400 mt-1">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function BookingForm({
  formData,
  onSubmit,
  onChange,
  submittingBooking,
  formValid,
  currentEmail
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formValid && !submittingBooking) {
      onSubmit(e);
    }
  };

  const formFields = [
    {
      label: "Full Name",
      name: "name",
      type: "text",
      value: formData.name,
      placeholder: "Enter your full name",
      required: true,
      icon: User,
      disabled: submittingBooking, // normal disable rule
    },
    {
      label: "Email Address",
      name: "email",
      type: "email",
      value: formData.email,
      placeholder: "your.email@example.com",
      required: true,
      icon: Mail,
      disabled: submittingBooking || currentEmail, // ✅ disable if currentEmail = true
    },
    {
      label: "Phone Number",
      name: "phone",
      type: "tel",
      value: formData.phone,
      placeholder: "+1 (555) 123-4567",
      required: true,
      icon: Phone,
      disabled: submittingBooking,
      maxLength: 10, 
    },
  ];

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {formFields.map((field, index) => (
        <FormField
          key={index}
          label={field.label}
          name={field.name}
          type={field.type}
          value={field.value}
          onChange={onChange}
          placeholder={field.placeholder}
          required={field.required}
          icon={<field.icon className="w-5 h-5 text-black" />}
          disabled={field.disabled}
        />
      ))}

      <PrivacyCheckbox
        checked={formData.privacy}
        onChange={onChange}
        disabled={submittingBooking}
      />

      <button
        type="submit"
        disabled={!formValid || submittingBooking}
        className={`w-full py-4 text-white text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-3 group relative overflow-hidden ${formValid && !submittingBooking
            ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-xl hover:scale-[1.02]"
            : "bg-gray-400 cursor-not-allowed"
          }`}
      >
        {submittingBooking && (
          <div className="absolute inset-0 bg-emerald-500 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}

        <CheckCircle
          className={`w-5 h-5 transition-transform ${submittingBooking ? "opacity-0" : "group-hover:scale-110"
            }`}
        />

        <span className={submittingBooking ? "opacity-0" : ""}>
          {submittingBooking ? "Processing..." : "Confirm Booking"}
        </span>
      </button>

      {/* Form Validation Status */}
      <div className="text-center">
        {!formValid && (
          <p className="text-sm text-amber-600 flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            Please complete all required fields
          </p>
        )}
        {formValid && (
          <p className="text-sm text-gray-500">
            You'll receive a confirmation email shortly
          </p>
        )}
      </div>
    </form>
  );
}

function FormField({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  required,
  icon,
  disabled = false,
   maxLength,
}) {
  return (
    <div className="space-y-2 ">
      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl 
              focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 
              focus:outline-none transition-all duration-200 bg-white/50 shadow-sm 
              hover:shadow-md text-gray-800
              ${disabled ? " cursor-not-allowed text-gray-400" : ""}
              ${value ? "border-emerald-200 bg-emerald-50" : ""}`}
        />

        {value && !disabled && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
        )}
      </div>
    </div>
  );
}

function PrivacyCheckbox({ checked, onChange, disabled = false }) {
  return (
    <div className={`flex items-start space-x-3 p-4 rounded-xl border transition-all duration-200 ${checked ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'
      } ${disabled ? 'opacity-50' : ''}`}>
      <input
        id="privacy"
        name="privacy"
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`h-5 w-5 rounded focus:ring-emerald-500 mt-0.5 flex-shrink-0 ${checked ? 'text-emerald-600 border-emerald-300' : 'text-gray-600 border-gray-300'
          }`}
      />
      <label htmlFor="privacy" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">Privacy Agreement</span>
        </div>
        I agree to the{" "}
        <a href="/privacy-policy" className="text-emerald-600 font-semibold hover:underline">
          Privacy Policy
        </a>{" "}
        and understand that my information will be used to process this booking and send appointment reminders.
      </label>
    </div>
  );
}