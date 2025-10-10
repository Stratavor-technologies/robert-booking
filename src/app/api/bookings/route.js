import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find();
    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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


