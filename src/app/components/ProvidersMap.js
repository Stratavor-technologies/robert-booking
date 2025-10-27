import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function ProvidersMap({ providers = [], locations, userLocation, searchWithin }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    import("leaflet").then((L) => {
      // Initialize map
      if (!mapRef.current) {
        const center = userLocation || [40.1, -75.1]; // default fallback
        mapRef.current = L.map("map").setView(center, 10);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;

      // Clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Custom icons
      const userIcon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const providerIcon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      // Add user marker
      if (userLocation) {
        const userMarker = L.marker(userLocation, { icon: userIcon })
          .addTo(map)
          .bindPopup("<b>You are here</b>");
        markersRef.current.push(userMarker);
        map.setView(userLocation, 10);
      }

      // ✅ Plot only filtered provider locations
      const providerLocations = providers.flatMap((p) =>
        (p.providerLocations || [])
          .filter((loc) => loc.lat && loc.lng)
          .map((loc) => ({
            ...loc,
            providerName: p.name,
          }))
      );

      providerLocations.forEach((loc) => {
        const dist = userLocation
          ? getDistance(userLocation[0], userLocation[1], parseFloat(loc.lat), parseFloat(loc.lng))
          : 0;

        if (!userLocation || dist <= searchWithin) {
          const marker = L.marker([parseFloat(loc.lat), parseFloat(loc.lng)], { icon: providerIcon })
            .addTo(map)
            .bindPopup(
  `<b>${loc.providerName}</b><br/>${loc.address1 || ""}, ${loc.city || ""}` +
  (userLocation ? `<br/><i>${dist.toFixed(1)} miles away</i>` : "")
);
          markersRef.current.push(marker);
        }
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [providers, userLocation, searchWithin]);

  return (
    <div className="w-full h-[500px] rounded-lg shadow-md">
      <div id="map" className="w-full h-full" />
    </div>
  );
}
