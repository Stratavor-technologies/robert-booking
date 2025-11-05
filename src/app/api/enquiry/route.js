import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Enquiry from "@/models/Enquiry";
 
// 🟢 GET — fetch all enquiries or filter by params
export async function GET(request) {
  try {
    await connectDB();
 
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    const pincode = searchParams.get("pincode");
    const enquiredBy = searchParams.get("enquiredBy");
 
    // Build dynamic filter
    const filter = {};
    if (email) filter.email = email;
    if (state) filter.state = state;
    if (city) filter.city = city;
    if (pincode) filter.pincode = pincode;
    if (enquiredBy) filter.enquiredBy = enquiredBy;
 
    const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
 
    return NextResponse.json(
      {
        success: true,
        count: enquiries.length,
        data: enquiries,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching enquiries:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
 
// 🟣 POST — create a new enquiry
export async function POST(request) {
  try {
    await connectDB();
 
    const body = await request.json();
    const {
      enquiredBy,
      city,
      state,
      pincode,
      email,
      phoneNumber,
      fullAddress,
      lat,
      lon,
    } = body;
 
    // Validation — at least one identifying field required
    if (!email && !phoneNumber && !city && !state && !pincode) {
      return NextResponse.json(
        { success: false, error: "At least one field is required" },
        { status: 400 }
      );
    }
 
 
    // Create enquiry document
    const newEnquiry = await Enquiry.create({
      enquiredBy,
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      email: email || "",
      phoneNumber: phoneNumber || "",
      fullAddress: fullAddress || "",
      lat: lat || "",
      lon: lon || "",
    });
 
    return NextResponse.json(
      {
        success: true,
        message: "Enquiry submitted successfully",
        data: newEnquiry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating enquiry:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}