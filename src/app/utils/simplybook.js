const API_URL = "https://user-api.simplybook.me";

export async function getToken() {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "getToken",
      params: [
        process.env.SIMPLYBOOK_COMPANY,
        process.env.SIMPLYBOOK_API_KEY,
      ],
      id: 1,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || "Failed to fetch token");
  }

  return data.result; // session token
}

const LOGIN_URL = "https://user-api.simplybook.me/login";
const ADMIN_URL = "https://user-api.simplybook.me/admin";

export async function getAdminToken() {
  const res = await fetch(LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "getUserToken",
      params: [
        process.env.SIMPLYBOOK_COMPANY,   // subdomain (company login)
        process.env.SIMPLYBOOK_ADMIN_USER, // admin username
        process.env.SIMPLYBOOK_ADMIN_PASS, // admin password
      ],
      id: 1,
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || "Failed to fetch admin token");
  }
  return data.result;
}

// Step 2: Call Admin API
async function callAdmin(method, params = [], token) {
  const res = await fetch(ADMIN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Company-Login": process.env.SIMPLYBOOK_COMPANY,
      "X-User-Token": token, // notice: X-User-Token, not X-Token
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id: 1,
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || JSON.stringify(data));
  }
  return data.result;
}

// Step 3: Get Clients
export async function getClients(limit = 50, start = 0) {
  const token = await getAdminToken();
  return callAdmin("getClientList", ["", limit], token);
}

export async function getClient(clientId) {
  const token = await getAdminToken();
  return callAdmin("getClientInfo", [clientId], token);
}


async function callSimplyBook(method, params = {}, token) {
  console.log("params: ", {
      jsonrpc: "2.0",
      method,
      params,
      id: 1,
    });
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Company-Login": process.env.SIMPLYBOOK_COMPANY,
      "X-Token": token,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id: 1,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || JSON.stringify(data));
  }

  return data.result;
}

export async function getProviders() {
  const token = await getToken();
  return callSimplyBook("getUnitList", {}, token);
}

// export async function getClients() {
//   const token = await getToken();
//   return callSimplyBook("getClientList", {}, token);
// }

export async function getLocations() {
  const token = await getToken();
  return callSimplyBook("getLocationsList", {}, token);
}

export async function getEvents() {
  const token = await getToken();
  return callSimplyBook("getEventList", {}, token);
}

export async function getWorkCalendar(year, month, performerId) {
  const token = await getToken();
  // SimplyBook expects params as an array [year, month, performerId]
  return callSimplyBook("getWorkCalendar", [year, month, performerId], token);
}

export async function getFirstWorkingDay(performerId) {
  const token = await getToken();
  return callSimplyBook("getFirstWorkingDay", [performerId], token);
}
