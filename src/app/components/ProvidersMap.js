import { useEffect, useRef } from "react";
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

export default function NearbyProvidersMap({ locations, userLocation, searchWithin }) {
  const mapRef = useRef(null); // store the map instance
  const markersRef = useRef([]); // store markers so we can clear/update them

  useEffect(() => {
    import("leaflet").then((L) => {
      // Initialize map only once
      if (!mapRef.current) {
        const center = userLocation
          ? [userLocation[0], userLocation[1]]
          : [locations[1].lat, locations[1].lng];

        mapRef.current = L.map("map").setView(center, 12);

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

      // Add user marker if available
      if (userLocation) {
        const userMarker = L.marker([userLocation[0], userLocation[1]], { icon: userIcon })
          .addTo(map)
          .bindPopup("<b>You are here</b>");
        markersRef.current.push(userMarker);
        map.setView([userLocation[0], userLocation[1]], 12);
      }

      // Filter nearby providers (or show all if no userLocation)
      const nearbyLocs = userLocation
        ? Object.values(locations).filter((loc) => {
            if (!loc.lat || !loc.lng) return false;
            const dist = getDistance(
              userLocation[0],
              userLocation[1],
              parseFloat(loc.lat),
              parseFloat(loc.lng)
            );
            return dist <= searchWithin;
          })
        : Object.values(locations);

      nearbyLocs.forEach((loc) => {
        const marker = L.marker([parseFloat(loc.lat), parseFloat(loc.lng)], { icon: providerIcon })
          .addTo(map)
          .bindPopup(`<b>${loc.name}</b><br/>${loc.address1 || ""}, ${loc.city || ""}`);
        markersRef.current.push(marker);
      });
    });

    // Cleanup map on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [locations, userLocation, searchWithin]);

  return (
    <div className="w-full h-[500px] rounded-lg shadow-md">
      <div id="map" className="w-full h-full" />
    </div>
  );
}
