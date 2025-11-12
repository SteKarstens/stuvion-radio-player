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
    let title = 'stuVion Radio';
    let artist = 'Live Stream';
    let metadataSource = 'default';
    
    console.log('Starting metadata fetch...');
    
    // Try AzuraCast API directly (most reliable)
    try {
      console.log('Fetching from AzuraCast API...');
      const azuraController = new AbortController();
      const azuraTimeoutId = setTimeout(() => azuraController.abort(), 8000);
      
      const azuraResponse = await fetch('https://ls111.systemweb-server.eu:8040/api/nowplaying/1', {
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'stuVion-Radio/1.0'
        },
        signal: azuraController.signal,
      });
      clearTimeout(azuraTimeoutId);
      
      console.log('AzuraCast response status:', azuraResponse.status);
      
      if (azuraResponse.ok) {
        const azuraData = await azuraResponse.json();
        console.log('AzuraCast data received, keys:', Object.keys(azuraData).join(', '));
        
        const nowPlaying = azuraData.now_playing || azuraData || {};
        const song = nowPlaying.song || {};
        
        if (song.title || song.text) {
          title = song.title || song.text;
          artist = song.artist || 'Live Stream';
          metadataSource = 'azuracast';
          console.log('Successfully parsed from AzuraCast:', { title, artist });
        }
      }
    } catch (azuraError) {
      const errorMsg = azuraError instanceof Error ? azuraError.message : 'Unknown error';
      console.error('AzuraCast API failed:', errorMsg);
    }
    
    console.log('Final song info from', metadataSource, ':', { title, artist });
    
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
