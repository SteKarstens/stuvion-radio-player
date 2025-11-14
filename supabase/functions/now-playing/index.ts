import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    
    // Try Shoutcast current song endpoint first
    try {
      console.log('Fetching from Shoutcast currentsong...');
      const shoutcastController = new AbortController();
      const shoutcastTimeoutId = setTimeout(() => shoutcastController.abort(), 5000);
      
      const shoutcastResponse = await fetch('https://ls111.systemweb-server.eu:8040/currentsong?sid=1', {
        headers: { 
          'User-Agent': 'stuVion-Radio/1.0'
        },
        signal: shoutcastController.signal,
      });
      clearTimeout(shoutcastTimeoutId);
      
      console.log('Shoutcast currentsong response status:', shoutcastResponse.status);
      
      if (shoutcastResponse.ok) {
        const songText = await shoutcastResponse.text();
        console.log('Shoutcast currentsong data:', songText);
        
        if (songText && songText.trim().length > 0) {
          // Parse "Artist - Title" format
          const parts = songText.split(' - ');
          if (parts.length >= 2) {
            artist = parts[0].trim();
            title = parts.slice(1).join(' - ').trim();
          } else {
            title = songText.trim();
          }
          metadataSource = 'shoutcast_currentsong';
          console.log('Successfully parsed from Shoutcast currentsong:', { title, artist });
        }
      }
    } catch (shoutcastError) {
      console.error('Shoutcast currentsong failed:', shoutcastError instanceof Error ? shoutcastError.message : 'Unknown error');
    }
    
    // Try Shoutcast 7.html as fallback
    if (metadataSource === 'default') {
      try {
        console.log('Fetching from Shoutcast 7.html...');
        const html7Controller = new AbortController();
        const html7TimeoutId = setTimeout(() => html7Controller.abort(), 5000);
        
        const html7Response = await fetch('https://ls111.systemweb-server.eu:8040/7.html?sid=1', {
          headers: { 
            'User-Agent': 'stuVion-Radio/1.0'
          },
          signal: html7Controller.signal,
        });
        clearTimeout(html7TimeoutId);
        
        console.log('Shoutcast 7.html response status:', html7Response.status);
        
        if (html7Response.ok) {
          const html7Text = await html7Response.text();
          console.log('Shoutcast 7.html raw data (first 200 chars):', html7Text.substring(0, 200));
          
          // Parse CSV format: listeners,status,peak,max,unique,bitrate,song
          const values = html7Text.split(',');
          if (values.length >= 7) {
            listeners = parseInt(values[0]) || 0;
            const songText = values.slice(6).join(',').trim();
            
            if (songText && songText.length > 0) {
              // Parse "Artist - Title" format
              const parts = songText.split(' - ');
              if (parts.length >= 2) {
                artist = parts[0].trim();
                title = parts.slice(1).join(' - ').trim();
              } else {
                title = songText.trim();
              }
              metadataSource = 'shoutcast_7html';
              console.log('Successfully parsed from Shoutcast 7.html:', { title, artist, listeners });
            }
          }
        }
      } catch (html7Error) {
        console.error('Shoutcast 7.html failed:', html7Error instanceof Error ? html7Error.message : 'Unknown error');
      }
    }
    
    console.log('Final song info from', metadataSource, ':', { title, artist });
    
    // Search for cover art (iTunes first, then Spotify as fallback)
    let coverUrl = '/placeholder.svg';
    
    if (title && artist && title !== 'stuVion Radio') {
      // Try iTunes first
      try {
        console.log('Searching iTunes for cover art...');
        const searchQuery = encodeURIComponent(`${artist} ${title}`);
        const itunesController = new AbortController();
        const itunesTimeoutId = setTimeout(() => itunesController.abort(), 5000);
        
        const itunesResponse = await fetch(
          `https://itunes.apple.com/search?term=${searchQuery}&media=music&limit=1`,
          { signal: itunesController.signal }
        );
        clearTimeout(itunesTimeoutId);
        
        if (itunesResponse.ok) {
          const itunesData = await itunesResponse.json();
          if (itunesData.results && itunesData.results.length > 0) {
            coverUrl = itunesData.results[0].artworkUrl100?.replace('100x100', '600x600') || '/placeholder.svg';
            console.log('iTunes cover found:', coverUrl);
          } else {
            console.log('No iTunes results found, trying Spotify...');
          }
        }
      } catch (itunesError) {
        console.error('iTunes API error:', itunesError);
      }
      
      // Try Spotify as fallback if iTunes didn't find anything
      if (coverUrl === '/placeholder.svg') {
        console.log('No cover art found, using placeholder');
      }
    }

    // Save to song history (only if we have valid song data)
    if (title !== 'stuVion Radio' && artist !== 'Live Stream') {
      try {
        // Check if this song is already the most recent one to avoid duplicates
        const { data: recentSong } = await supabase
          .from('song_history')
          .select('title, artist')
          .order('played_at', { ascending: false })
          .limit(1)
          .single();

        // Only insert if it's a different song
        if (!recentSong || recentSong.title !== title || recentSong.artist !== artist) {
          const { error: insertError } = await supabase
            .from('song_history')
            .insert({
              title,
              artist,
              cover_url: coverUrl,
              listeners,
            });

          if (insertError) {
            console.error('Error saving song to history:', insertError);
          } else {
            console.log('Song saved to history:', { title, artist });
          }
        }
      } catch (historyError) {
        console.error('Error checking/saving song history:', historyError);
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
