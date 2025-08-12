import type { APIRoute } from 'astro';

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Geocode a UK postcode using postcodes.io (free API)
async function geocodePostcode(postcode: string) {
  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status === 200 && data.result) {
      return {
        latitude: data.result.latitude,
        longitude: data.result.longitude
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return null;
}

// Fetch and parse DVSA test centres from official CSV
async function fetchTestCentres() {
  try {
    const response = await fetch('http://assets.dft.gov.uk/dvsa/find-your-nearest/practical.csv');
    if (!response.ok) throw new Error('Failed to fetch centres');
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
    
    const centres = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV line (basic parsing - handles quoted fields)
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      if (values.length >= 7) {
        const name = values[0]?.replace(/"/g, '') || '';
        const address1 = values[1]?.replace(/"/g, '') || '';
        const address2 = values[2]?.replace(/"/g, '') || '';
        const city = values[3]?.replace(/"/g, '') || '';
        const county = values[4]?.replace(/"/g, '') || '';
        const postcode = values[5]?.replace(/"/g, '') || '';
        const lat = parseFloat(values[6]) || 0;
        const lng = parseFloat(values[7]) || 0;
        
        if (name && lat && lng && postcode) {
          centres.push({
            name,
            address: [address1, address2, city, county].filter(Boolean).join(', '),
            postcode,
            latitude: lat,
            longitude: lng
          });
        }
      }
    }
    
    return centres;
  } catch (error) {
    console.error('Error fetching test centres:', error);
    return [];
  }
}

export const GET: APIRoute = async ({ url }) => {
  const postcode = url.searchParams.get('postcode');
  const radiusParam = url.searchParams.get('radius');
  
  if (!postcode) {
    return new Response(JSON.stringify({ error: 'Postcode is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const radius = radiusParam ? parseInt(radiusParam) : 50; // Default 50 miles
  
  // Geocode the input postcode
  const userLocation = await geocodePostcode(postcode);
  if (!userLocation) {
    return new Response(JSON.stringify({ error: 'Invalid postcode' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Fetch all test centres
  const allCentres = await fetchTestCentres();
  
  // Calculate distances and filter by radius
  const centresWithDistance = allCentres
    .map(centre => ({
      ...centre,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        centre.latitude,
        centre.longitude
      )
    }))
    .filter(centre => centre.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
  
  return new Response(JSON.stringify({
    userPostcode: postcode,
    userLocation,
    radius,
    centres: centresWithDistance.slice(0, 20), // Limit to 20 results
    total: centresWithDistance.length
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
