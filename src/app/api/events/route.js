import { getEvents } from "../../utils/simplybook";

export async function GET() {
  try {
    const events = await getEvents(); 
    // console.log("providers: ", providers);

    return new Response(JSON.stringify(events), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // console.log("err: ", err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
