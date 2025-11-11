import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch AzuraCast now playing data
    const azuracastResponse = await fetch('https://ls111.systemweb-server.eu:8040/api/nowplaying/1', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!azuracastResponse.ok) {
      throw new Error(`AzuraCast API error: ${azuracastResponse.status}`);
    }

    const azuracastData = await azuracastResponse.json();
    
    const nowPlaying = azuracastData.now_playing || {};
    const song = nowPlaying.song || {};
    const title = song.title || 'stuVion Radio';
    const artist = song.artist || 'Live Stream';
    
    // Search iTunes API for cover art
    let coverUrl = '/placeholder.svg';
    
    if (title && artist && title !== 'stuVion Radio') {
      try {
        const searchQuery = encodeURIComponent(`${artist} ${title}`);
        const itunesResponse = await fetch(
          `https://itunes.apple.com/search?term=${searchQuery}&media=music&limit=1`
        );
        
        if (itunesResponse.ok) {
          const itunesData = await itunesResponse.json();
          if (itunesData.results && itunesData.results.length > 0) {
            // Get high quality artwork (replace 100x100 with 600x600)
            coverUrl = itunesData.results[0].artworkUrl100?.replace('100x100', '600x600') || '/placeholder.svg';
          }
        }
      } catch (itunesError) {
        console.error('iTunes API error:', itunesError);
        // Continue with placeholder if iTunes fails
      }
    }

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
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
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
