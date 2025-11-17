"use client";

import Link from "next/link";

export default function Banner() {
  return (
    <section
      className="relative h-[80vh] flex items-center justify-center bg-cover bg-top text-white"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">Bellycast</h1>
        <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
          Celebrate your journey with Bellycast – create timeless keepsakes and memories.
        </p>

        <div className="flex gap-4 justify-center">
         {/*  <Link
            href="#map"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition"
          >
            View Map
          </Link> */}
          {/* <Link
            href="#book"
            className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-xl font-medium transition"
          >
            Book Now
          </Link> */}
        </div>
      </div>
    </section>
  );
}
