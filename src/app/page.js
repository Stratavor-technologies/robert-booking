import Image from "next/image";
import FindBooking from "./components/FindBooking";
import Header from "./components/Header";
import Banner from "./components/HomeBanner";

async function getProviders() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/providers`, {
    cache: "no-store",
  });
  return res.json();
}

async function getEvents() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`, {
    cache: "no-store",
  });
  return res.json();
}

async function getClients() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/clients`, {
    cache: "no-store",
  });
  return res.json();
}

async function getLocations() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/locations`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function Home() {
  const providers = await getProviders();
  const events = await getEvents();
  const locations = await getLocations();
  const clients = await getClients();

  return (
    <>
      <Banner />
      <FindBooking providers={providers} events={events} locations={locations} clients={clients} />
    </>
  )
}
