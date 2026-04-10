async function probeEndpoints() {
  const base = 'https://api.lilyshops.com';
  // Use a dummy ID or a known one if possible
  const vendorId = '0e31f7e5-fd3e-4daa-94fb-57ae5290a5d3'; 
  const endpoints = [
    `/foods/vendors/${vendorId}/plans/`,
    `/foods/vendor/${vendorId}/plans/`,
    `/foods/subscriptions/vendors/${vendorId}/plans/`,
    `/foods/subscriptions/plans/vendor/${vendorId}/`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(base + url, { method: 'GET' });
      console.log(`${url}: ${res.status} ${res.statusText}`);
    } catch (err) {
      console.log(`${url}: Error - ${err.message}`);
    }
  }
}

probeEndpoints();
