import mongoose from "mongoose";

if (mongoose.models.Booking) {
  delete mongoose.models.Booking;
}

const BookingSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    phonenumber: { type: String, required: true },
    provider: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    clientaddress: {
      fullAddress: { type: String, required: true, trim: true },
      lat: { type: String, required: true },
      lon: { type: String, required: true },
       city: { type: String },
      state: { type: String},
    },

    // 👇 NEW FIELD
    services: {
      manicure: { type: Boolean, default: false },
      manicureGel: { type: Boolean, default: false },
      pedicure: { type: Boolean, default: false },
      pedicureGel: { type: Boolean, default: false },
      eyelashFull: { type: Boolean, default: false },
      eyelashRefill: { type: Boolean, default: false },
      waxEyebrows: { type: Boolean, default: false },
      waxLips: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema);
