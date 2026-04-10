async function debugVendor() {
  try {
    const vendorId = "0e31f7e5-fd3e-4daa-94fb-57ae5290a5d3";
    
    // Fetch Vendor Detail
    const resVendor = await fetch(`https://api.lilyshops.com/foods/food-vendors/${vendorId}/`);
    const vendor = await resVendor.json();
    console.log('--- Vendor Detail ---');
    console.log(JSON.stringify(vendor, null, 2));

    // Fetch Meal Plans
    const resPlans = await fetch(`https://api.lilyshops.com/foods/subscriptions/vendors/${vendorId}/plans/`);
    const plans = await resPlans.json();
    console.log('\n--- Meal Plans ---');
    console.log(JSON.stringify(plans, null, 2));

    // Fetch User Profile
    if (vendor && vendor.user) {
      const userId = typeof vendor.user === 'string' ? vendor.user : vendor.user.id;
      const resProfile = await fetch(`https://api.lilyshops.com/auth/profile/${userId}/`);
      const profile = await resProfile.json();
      console.log('\n--- User Profile Data ---');
      console.log(JSON.stringify(profile, null, 2));
    }
  } catch (err) {
    console.error('Error debugging vendor:', err);
  }
}

debugVendor();
