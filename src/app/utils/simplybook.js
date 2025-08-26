const API_URL = "https://user-api.simplybook.me";

// Step 1: Get session token
export async function getToken() {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      companyLogin: process.env.SIMPLYBOOK_COMPANY,
      apiKey: process.env.SIMPLYBOOK_API_KEY,
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || "Failed to authenticate with SimplyBook");
  }

  return data.token;
}

// Step 2: Generic JSON-RPC call
async function callSimplyBook(method, params = {}, token) {
  const headers = {
    "Content-Type": "application/json",
    "X-Company-Login": process.env.SIMPLYBOOK_COMPANY,
    "X-Token": token,
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id: 1,
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || "SimplyBook API error");
  }

  return data.result;
}

// Step 3: Get providers (staff / units)
export async function getProviders() {
  const token = await getToken();
  return callSimplyBook("getUnitList", {}, token);
}
