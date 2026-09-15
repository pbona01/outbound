import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!googlePlacesApiKey) {
    return res.status(400).json({
      success: false,
      code: 'PROVIDER_NOT_CONFIGURED',
      error: 'Google Places API is not configured. Please add GOOGLE_PLACES_API_KEY to your environment variables.',
    });
  }

  try {
    const { industry = '', geography = '', companySize = '', role = 'Founder', limit = 10 } = req.body;
    const queryText = `${industry} in ${geography}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(queryText)}&key=${googlePlacesApiKey}`;
    
    const fetchRes = await fetch(url);
    const placeData = await fetchRes.json();

    if (!placeData.results || !Array.isArray(placeData.results)) {
      return res.json({ success: true, count: 0, prospects: [] });
    }

    const discoveredCompanies = placeData.results.slice(0, limit).map((place: any, idx: number) => {
      const cleanName = place.name.replace(/[^\w\s&]/gi, '');
      const domain = `${cleanName.toLowerCase().replace(/\s+/g, '')}.com`;
      return {
        id: `disc-gplace-${idx}-${Date.now()}`,
        company: {
          name: place.name,
          domain: domain,
          industry: industry || 'Local Services',
          location: place.formatted_address || geography || 'United States',
        },
        contact: {
          fullName: 'Contact unavailable',
          role: role || 'Founder',
          email: 'Email unavailable',
          verified: false,
        },
        fitScore: Math.min(98, 70 + (place.rating ? Math.round(place.rating * 5) : 15)),
        status: 'discovered',
        primaryProblem: 'Website conversion friction',
        evidence: `Verified local business on Google Places (${place.user_ratings_total || 0} reviews, ${place.rating || 0} rating)`,
        source: 'Google Places API',
        sourceUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        discoveredAt: new Date().toISOString(),
      };
    });

    return res.json({ success: true, count: discoveredCompanies.length, prospects: discoveredCompanies });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
