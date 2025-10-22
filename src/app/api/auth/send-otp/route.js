// app/api/auth/send-otp/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { generateOTP, sendOTPEmail, sendOTPSMS } from "@/lib/otpUtils";

export async function POST(request) {
  try {
    await connectDB();

    const { email, phonenumber } = await request.json();

    // Validation
    if (!email || !phonenumber) {
      return NextResponse.json(
        { error: "Email and phone number are required" },
        { status: 400 }
      );
    }

    // Find user by email and phone number
    const user = await User.findOne({ email, phonenumber });

    if (!user) {
      return NextResponse.json(
        { error: "User not found with provided email and phone number" },
        { status: 404 }
      );
    }

    // Generate OTP (random 4-digit OTP recommended for production)
    const otp = generateOTP(); 
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via email (real) and SMS (still dummy)
    const emailSent = await sendOTPEmail(email, otp);
    await sendOTPSMS(phonenumber, otp);

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: "Failed to send OTP email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully",
        // Remove otp from response in production
 
        note: "OTP sent via email"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
