import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Blacklist from "@/models/Blacklist";

// 🟩 POST — Add a provider to the user's blacklist
export async function POST(req) {
  try {
    const { email, providerId } = await req.json();

    if (!email || !providerId) {
      return NextResponse.json(
        { success: false, message: "Missing email or providerId" },
        { status: 400 }
      );
    }

    await connectDB();

    let userBlacklist = await Blacklist.findOne({ email });

    if (!userBlacklist) {
      userBlacklist = await Blacklist.create({
        email,
        providerIds: [providerId],
      });
    } else {
      // Ensure array exists
      if (!Array.isArray(userBlacklist.providerIds)) {
        userBlacklist.providerIds = [];
      }

      // Add only if not already present
      if (!userBlacklist.providerIds.includes(providerId)) {
        userBlacklist.providerIds.push(providerId);
        await userBlacklist.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Provider blacklisted successfully",
      data: userBlacklist,
    });
  } catch (error) {
    console.error("POST /blacklist Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// 🟦 GET — Fetch user's blacklist
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email required" },
        { status: 400 }
      );
    }

    await connectDB();

    const userBlacklist = await Blacklist.findOne({ email });

    return NextResponse.json({
      success: true,
      blockedProviderIds: userBlacklist?.providerIds || [],
    });
  } catch (error) {
    console.error("GET /blacklist Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
