import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const gfaType = url.searchParams.get('type') || 'CLDWX';
    const airportCode = url.searchParams.get('airport') || 'CYUL'; // Default to CYUL if not provided
    
    // Use the correct NavCanada API endpoint with site parameter for the specific airport
    // This ensures we get GFA for the correct geographical area
    const apiUrl = `https://plan.navcanada.ca/weather/api/alpha/?site=${encodeURIComponent(airportCode)}&image=GFA/CLDWX&image=GFA/TURBC`;
    
    console.log(`[API GFA] Fetching for airport ${airportCode} from: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`[API GFA] NavCanada API returned ${response.status}`);
      return NextResponse.json({ error: `NavCanada API returned ${response.status}` }, { status: response.status });
    }

    const apiData = await response.json();
    console.log(`[API GFA] Received raw data with ${apiData.data?.length || 0} items`);
    
    // Find the data item matching the requested GFA type
    const gfaItem = apiData.data?.find((item: any) => {
      try {
        const textData = JSON.parse(item.text);
        return textData.sub_product === gfaType;
      } catch {
        return false;
      }
    });

    if (!gfaItem) {
      console.warn(`[API GFA] No data found for type ${gfaType} at airport ${airportCode}`);
      return NextResponse.json({ error: `No GFA data available for ${gfaType}` }, { status: 404 });
    }

    // Parse the text field which contains the actual GFA data
    const textData = JSON.parse(gfaItem.text);
    
    // Wrap in the expected structure for the component
    const wrappedData = {
      data: [{
        type: 'gfa',
        text: JSON.stringify(textData)
      }]
    };
    
    const responseData = NextResponse.json(wrappedData);
    responseData.headers.set('Cache-Control', 'public, max-age=300'); // 5 minute cache
    
    console.log(`[API GFA] Returning wrapped response for ${gfaType} at ${airportCode}`);
    return responseData;
  } catch (err: any) {
    console.error('API /api/gfa error:', err);
    return NextResponse.json({ error: err?.message || 'unknown error' }, { status: 500 });
  }
}
