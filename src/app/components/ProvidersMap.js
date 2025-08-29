import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function NearbyProvidersMap({ locations, userLocation }) {
  useEffect(() => {
    if (!userLocation) return; // wait until userLocation is available

    const [userLat, userLng] = userLocation;

    import("leaflet").then((L) => {
      const map = L.map("map").setView([userLat, userLng], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

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
      L.marker([userLat, userLng], { icon: userIcon }).addTo(map)
        .bindPopup("<b>You are here</b>");

      // Filter and add nearby providers (within 20km)
      const nearbyLocs = Object.values(locations).filter((loc) => {
        if (!loc.lat || !loc.lng) return false;
        const dist = getDistance(userLat, userLng, parseFloat(loc.lat), parseFloat(loc.lng));
        return dist <= 20;
      });

      nearbyLocs.forEach((loc) => {
        L.marker([parseFloat(loc.lat), parseFloat(loc.lng)], { icon: providerIcon })
          .addTo(map)
          .bindPopup(`<b>${loc.name}</b><br/>${loc.address1 || ""}, ${loc.city || ""}`);
      });
    });
  }, [locations, userLocation]);

  return (
    <div className="w-full h-[500px] rounded-lg shadow-md">
      <div id="map" className="w-full h-full" />
    </div>
  );
}
