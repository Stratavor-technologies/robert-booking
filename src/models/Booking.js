import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    phonenumber: { type: String, required: true },
    provider: { type: String, required: true },   // Service provider name or ID
    date: { type: String, required: true },       // Could also use Date type if you want
    time: { type: String, required: true },       // e.g. "10:30 AM"
    clientaddress: {
      streetaddress: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
    },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

// prevent model overwrite in dev
export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
