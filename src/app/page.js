import Image from "next/image";
import FindBooking from "./components/FindBooking";

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

export default async function Home() {
  const providers = await getProviders();
  const events = await getEvents();
  return <FindBooking providers={providers} events={events} />;
}
