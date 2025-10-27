import { connectDB } from "@/lib/mongodb";
import Blacklist from "@/models/Blacklist";
import BlacklistedProvidersClient from "./BlacklistedProvidersClient";

async function getProviders() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/providers`, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch providers");
    return [];
  }

  const json = await res.json();

  // 🧩 Convert the object (e.g. {2: {...}, 3: {...}}) into an array
  const data = Array.isArray(json)
    ? json
    : typeof json === "object" && json !== null
    ? Object.values(json)
    : [];

  if (!Array.isArray(data)) {
    console.error("Invalid provider data format:", json);
    return [];
  }

  // 🧠 Check if "good_standing" key exists (for future)
  const hasGoodStandingKey =
    data.length > 0 && Object.prototype.hasOwnProperty.call(data[0], "good_standing");

  // ✅ Apply filters
  const filteredProviders = data.filter((p) => {
    const isActiveVisible = p.is_active === "1" && p.is_visible === "1";

    if (!Object.prototype.hasOwnProperty.call(p, "good_standing")) {
      // current logic — only active + visible
      return isActiveVisible;
    }

    // future logic — also require good_standing
    const isGoodStanding =
      p.good_standing === true ||
      p.good_standing === "1" ||
      p.good_standing === "yes" ||
      p.good_standing === "true";

    return isActiveVisible && isGoodStanding;
  });

  return filteredProviders;
}

export default async function BlacklistedProvidersPage() {
  await connectDB();
  
  // Fetch all providers using the same function as your main page
  const allProviders = await getProviders();
  
  return <BlacklistedProvidersClient allProviders={allProviders} />;
}