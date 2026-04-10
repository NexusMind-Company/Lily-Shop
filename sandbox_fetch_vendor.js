async function getVendors() {
  try {
    const res = await fetch('https://api.lilyshops.com/foods/vendors/');
    const data = await res.json();
    
    // Check results format (paginated?)
    const vendors = data.results || data;

    const brendan = vendors.find(v => v.name.toLowerCase().includes('brendan'));
    if (brendan) {
      console.log(JSON.stringify(brendan, null, 2));
    } else {
      console.log('Brendan not found. First vendor:', JSON.stringify(vendors[0], null, 2));
    }
  } catch (err) {
    console.error('Error fetching vendors:', err);
  }
}

getVendors();
