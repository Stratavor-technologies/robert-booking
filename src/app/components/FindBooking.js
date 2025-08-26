"use client";
import { useEffect, useState } from "react";

export default function FindBooking() {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    fetch("/api/providers")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch providers");
        return res.json();
      })
      .then((data) => setProviders(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold">Providers</h2>
      <ul>
        {providers.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
