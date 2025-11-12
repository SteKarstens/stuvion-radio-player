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
    
    // Try Shoutcast/Icecast stats endpoint first
    console.log('Trying Shoutcast stats endpoint...');
    try {
      const statsController = new AbortController();
      const statsTimeoutId = setTimeout(() => statsController.abort(), 5000);
      
      const statsResponse = await fetch('https://ls111.systemweb-server.eu:8040/stats', {
        headers: {
          'Accept': 'application/json',
        },
        signal: statsController.signal,
      });
      clearTimeout(statsTimeoutId);
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Shoutcast stats response:', statsData);
        
        // Parse Shoutcast/Icecast stats format
        if (statsData.icestats?.source?.title) {
          const fullTitle = statsData.icestats.source.title;
          const parts = fullTitle.split(' - ');
          if (parts.length >= 2) {
            artist = parts[0].trim();
            title = parts.slice(1).join(' - ').trim();
          } else {
            title = fullTitle;
          }
          console.log('Parsed from Shoutcast stats:', { title, artist });
        }
      }
    } catch (statsError) {
      console.log('Shoutcast stats failed, trying status-json.xsl...');
      
      // Try alternative Icecast endpoint
      try {
        const jsonController = new AbortController();
        const jsonTimeoutId = setTimeout(() => jsonController.abort(), 5000);
        
        const jsonResponse = await fetch('https://ls111.systemweb-server.eu:8040/status-json.xsl', {
          signal: jsonController.signal,
        });
        clearTimeout(jsonTimeoutId);
        
        if (jsonResponse.ok) {
          const jsonData = await jsonResponse.json();
          console.log('status-json.xsl response:', jsonData);
          
          if (jsonData.icestats?.source?.title) {
            const fullTitle = jsonData.icestats.source.title;
            const parts = fullTitle.split(' - ');
            if (parts.length >= 2) {
              artist = parts[0].trim();
              title = parts.slice(1).join(' - ').trim();
            } else {
              title = fullTitle;
            }
            console.log('Parsed from status-json:', { title, artist });
          }
        }
      } catch (jsonError) {
        console.log('status-json.xsl also failed, trying AzuraCast API...');
        
        // Fall back to AzuraCast API
        try {
          const azuraController = new AbortController();
          const azuraTimeoutId = setTimeout(() => azuraController.abort(), 5000);
          
          const azuraResponse = await fetch('https://ls111.systemweb-server.eu:8040/api/nowplaying/1', {
            headers: { 'Accept': 'application/json' },
            signal: azuraController.signal,
          });
          clearTimeout(azuraTimeoutId);
          
          if (azuraResponse.ok) {
            const azuraData = await azuraResponse.json();
            const nowPlaying = azuraData.now_playing || azuraData || {};
            const song = nowPlaying.song || {};
            title = song.title || song.text || 'stuVion Radio';
            artist = song.artist || 'Live Stream';
            console.log('Parsed from AzuraCast:', { title, artist });
          }
        } catch (azuraError) {
          console.error('All metadata sources failed:', azuraError);
        }
      }
    }
    
    console.log('Final song info:', { title, artist });
    
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
