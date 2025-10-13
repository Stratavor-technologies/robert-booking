import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET(request) {
  try {
    await connectDB();

    // Get search params from URL
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email"); // optional

    let filter = {};
    if (email) {
      filter.email = email; // filter by email if provided
    }

    // Find and sort by most recent first
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: bookings.length,
        data: bookings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      fullname,
      email,
      phonenumber,
      provider,
      date,
      time,
      clientaddress,
      services, // 👈 include services
    } = body;

    // Validation
    if (
      !fullname ||
      !email ||
      !phonenumber ||
      !provider ||
      !date ||
      !time ||
      !clientaddress?.fullAddress ||
      !clientaddress?.lat ||
      !clientaddress?.lon
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Create booking and save services
    const newBooking = await Booking.create({
      fullname,
      email,
      phonenumber,
      provider,
      date,
      time,
      clientaddress,
      services: services || {}, // ensure empty object if not provided
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully",
        booking: newBooking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


