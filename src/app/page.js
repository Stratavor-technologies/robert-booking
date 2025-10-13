import Image from "next/image";
import FindBooking from "./components/FindBooking";
import Header from "./components/Header";
import Banner from "./components/HomeBanner";

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


async function getEvents() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`, {
    cache: "no-store",
  });
  if(!res.ok){
    return [];
  }
  return res.json();
}

async function getClients() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/clients`, {
    cache: "no-store",
  });
  if(!res.ok){
    return [];
  }
  return res.json();
}

async function getLocations() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/locations`, {
    cache: "no-store",
  });
  if(!res.ok){
    return [];
  }
  return res.json();
}

export default async function Home() {
  const providers = await getProviders();
  const events = await getEvents();
  const locations = await getLocations();
  const clients = await getClients();

  console.log("providers: ", providers,events,locations,clients);

  return (
    <>
    <Banner />
   <FindBooking providers={providers} events={events} locations={locations} clients={clients} />/
    </>
  )
}
