// lib/otpUtils.js
// Generate fixed OTP for testing
export function generateOTP() {
  return "1234"; // Fixed OTP for testing
}

// Dummy email sender
export async function sendOTPEmail(email, otp) {
  try {
    console.log(`📧 OTP ${otp} sent to ${email} (Dummy Email)`);
    return true;
  } catch (error) {
    console.error('Error in dummy email:', error);
    return false;
  }
}

// Dummy SMS sender
export async function sendOTPSMS(phoneNumber, otp) {
  console.log(`📱 OTP ${otp} sent to ${phoneNumber} (Dummy SMS)`);
  return true;
}