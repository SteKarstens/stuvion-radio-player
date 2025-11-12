import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Now-playing function called');

  try {
    // Fetch AzuraCast now playing data with timeout
    console.log('Fetching from AzuraCast API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const azuracastResponse = await fetch('https://ls111.systemweb-server.eu:8040/api/nowplaying/1', {
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    console.log('AzuraCast response status:', azuracastResponse.status);

    if (!azuracastResponse.ok) {
      throw new Error(`AzuraCast API error: ${azuracastResponse.status}`);
    }

    let azuracastData;
    try {
      azuracastData = await azuracastResponse.json();
      console.log('AzuraCast JSON parsed successfully');
    } catch (jsonError) {
      console.error('Failed to parse AzuraCast JSON:', jsonError);
      throw new Error('Failed to parse AzuraCast response');
    }
    
    console.log('Data keys:', Object.keys(azuracastData).join(', '));
    
    // AzuraCast returns the now_playing data directly at the root
    const nowPlaying = azuracastData.now_playing || azuracastData || {};
    const song = nowPlaying.song || {};
    const title = song.title || song.text || 'stuVion Radio';
    const artist = song.artist || 'Live Stream';
    
    console.log('Parsed song data:', { title, artist });
    
    console.log('Song info:', { title, artist });
    
    // Search iTunes API for cover art
    let coverUrl = '/placeholder.svg';
    
    if (title && artist && title !== 'stuVion Radio') {
      try {
        console.log('Searching iTunes for cover art...');
        const searchQuery = encodeURIComponent(`${artist} ${title}`);
        const itunesController = new AbortController();
        const itunesTimeoutId = setTimeout(() => itunesController.abort(), 5000); // 5 second timeout
        
        const itunesResponse = await fetch(
          `https://itunes.apple.com/search?term=${searchQuery}&media=music&limit=1`,
          { signal: itunesController.signal }
        );
        clearTimeout(itunesTimeoutId);
        
        if (itunesResponse.ok) {
          const itunesData = await itunesResponse.json();
          if (itunesData.results && itunesData.results.length > 0) {
            // Get high quality artwork (replace 100x100 with 600x600)
            coverUrl = itunesData.results[0].artworkUrl100?.replace('100x100', '600x600') || '/placeholder.svg';
            console.log('iTunes cover found:', coverUrl);
          } else {
            console.log('No iTunes results found');
          }
        }
      } catch (itunesError) {
        console.error('iTunes API error:', itunesError);
        // Continue with placeholder if iTunes fails
      }
    }

    console.log('Returning response with cover:', coverUrl);
    return new Response(
      JSON.stringify({
        title,
        artist,
        coverUrl,
        live: nowPlaying.live || {},
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in now-playing function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        title: 'stuVion Radio',
        artist: 'Live Stream',
        coverUrl: '/placeholder.svg',
      }),
      {
        status: 200, // Return 200 with fallback data instead of error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
