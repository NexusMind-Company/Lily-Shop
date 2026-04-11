const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'services', 'api.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix createFoodVendor
const createPattern = /if \(vendorData\.contact_phone\)\s+formData\.append\("contact_phone", vendorData\.contact_phone\);/;
if (createPattern.test(content)) {
  content = content.replace(createPattern, 'if (vendorData.contact_phone)\n    formData.append("contact_phone", vendorData.contact_phone);\n  if (vendorData.address)\n    formData.append("address", vendorData.address);');
  console.log('Fixed createFoodVendor address append.');
} else {
  console.log('Could not find contact_phone pattern in createFoodVendor.');
}

// 2. Add updateFoodVendor if it doesn't exist
if (!content.includes('export const updateFoodVendor')) {
  const insertionPoint = 'return response.data;\n};'; // Find end of some function
  const parts = content.split(insertionPoint);
  if (parts.length > 2) {
    // Insert after createFoodVendor (which we know follows this pattern)
    // Actually let's search for the end of createFoodVendor specifically
    const createEndPattern = /const response = await api\.post\("\/foods\/food-vendors\/", formData, \{\s+headers: \{\s+"Content-Type": "multipart\/form-data",\s+\},\s+\}\);\s+return response\.data;\s+\};/;
    if (createEndPattern.test(content)) {
       const updateFunc = '\n\nexport const updateFoodVendor = async (vendorId, vendorData) => {\n  const formData = new FormData();\n\n  if (vendorData.name) formData.append("name", vendorData.name);\n  if (vendorData.cuisine) formData.append("cuisine", vendorData.cuisine);\n  if (vendorData.description)\n    formData.append("description", vendorData.description);\n  if (vendorData.address)\n    formData.append("address", vendorData.address);\n  if (vendorData.contact_phone)\n    formData.append("contact_phone", vendorData.contact_phone);\n\n  const response = await api.patch(`/foods/food-vendors/${vendorId}/`, formData, {\n    headers: {\n      "Content-Type": "multipart/form-data",\n    },\n  });\n  return response.data;\n};';
       content = content.replace(createEndPattern, (match) => match + updateFunc);
       console.log('Added updateFoodVendor function.');
    }
  }
}

fs.writeFileSync(filePath, content);
console.log('File patched successfully.');
