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
    console.log('Now-playing function called');

    let title = 'stuVion Radio';
    let artist = 'Live Stream';
    let listeners = 0;
    let metadataSource = 'default';
    
    console.log('Starting metadata fetch...');
    
    // Try AzuraCast API directly
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
        try {
          const azuraData = await azuraResponse.json();
          console.log('AzuraCast data structure check:', {
            hasNowPlaying: !!azuraData.now_playing,
            hasListeners: !!azuraData.listeners,
            topLevelKeys: Object.keys(azuraData).join(', ')
          });
          
          // Parse listeners count
          if (azuraData.listeners && typeof azuraData.listeners.current === 'number') {
            listeners = azuraData.listeners.current;
            console.log('Found listeners count:', listeners);
          } else if (typeof azuraData.listeners === 'number') {
            listeners = azuraData.listeners;
            console.log('Found listeners count (direct):', listeners);
          }
          
          // Parse song info - try multiple structures
          const nowPlaying = azuraData.now_playing || azuraData;
          
          if (nowPlaying) {
            console.log('Now playing structure:', {
              hasSong: !!nowPlaying.song,
              songKeys: nowPlaying.song ? Object.keys(nowPlaying.song).join(', ') : 'none'
            });
            
            const song = nowPlaying.song || nowPlaying;
            
            // Try different field combinations
            if (song.title) {
              title = song.title;
              artist = song.artist || 'Live Stream';
              metadataSource = 'azuracast';
              console.log('Successfully parsed (title field):', { title, artist });
            } else if (song.text) {
              title = song.text;
              artist = song.artist || 'Live Stream';
              metadataSource = 'azuracast';
              console.log('Successfully parsed (text field):', { title, artist });
            } else {
              console.log('No valid song data found. Song object:', JSON.stringify(song).substring(0, 200));
            }
          } else {
            console.log('No now_playing data found');
          }
        } catch (parseError) {
          console.error('Failed to parse AzuraCast JSON:', parseError);
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

    console.log('Returning response with:', { title, artist, listeners, coverUrl });
    return new Response(
      JSON.stringify({
        title,
        artist,
        listeners,
        coverUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Fatal error in now-playing function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    // Always return a valid response
    return new Response(
      JSON.stringify({
        title: 'stuVion Radio',
        artist: 'Live Stream',
        listeners: 0,
        coverUrl: '/placeholder.svg',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
