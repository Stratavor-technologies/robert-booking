// app/api/auth/verify-otp/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectDB();
    const { email, phonenumber, otp } = await request.json();

    // Validation
    if (!email || !phonenumber || !otp) {
      return NextResponse.json(
        { error: "Email, phone number and OTP are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email, phonenumber });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpires) {
      return NextResponse.json(
        { error: "OTP not found or expired" },
        { status: 400 }
      );
    }

    if (user.otpExpires < new Date()) {
      return NextResponse.json(
        { error: "OTP has expired" },
        { status: 400 }
      );
    }

    // Verify OTP (for testing, 1234 is accepted)
    if (user.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP. Use 1234 for testing" },
        { status: 400 }
      );
    }

    // OTP is valid — mark as verified
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    // ✅ Get last pushed address (if any)
    const lastAddress =
      user.address && user.address.length > 0
        ? user.address[user.address.length - 1]
        : null;

    return NextResponse.json(
      {
        success: true,
        message: "OTP verified successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phonenumber: user.phonenumber,
          isVerified: user.isVerified,
          lastAddress, // 👈 include the latest address here
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
