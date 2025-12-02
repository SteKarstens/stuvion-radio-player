import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChartEntry {
  position: number;
  artist: string;
  title: string;
  coverUrl: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const response = await fetch('https://stuvion.com/charts');
    const html = await response.text();
    
    const charts: ChartEntry[] = [];
    
    // Parse Top 5 entries from HTML
    const entryRegex = /<div class="chart-entry premium-entry" data-position="(\d+)"[\s\S]*?<img src="([^"]+)"[^>]*alt="([^"]+)"[\s\S]*?<h4 class="premium-artist">([^<]+)<\/h4>[\s\S]*?<h3 class="premium-title">"([^"]+)"<\/h3>/g;
    
    let match;
    while ((match = entryRegex.exec(html)) !== null && charts.length < 5) {
      const position = parseInt(match[1]);
      const coverUrl = match[2];
      const artist = match[4].trim();
      const title = match[5].trim();
      
      if (position <= 5) {
        charts.push({
          position,
          artist,
          title,
          coverUrl,
        });
      }
    }
    
    // Sort by position
    charts.sort((a, b) => a.position - b.position);

    return new Response(JSON.stringify({ charts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching charts:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch charts', charts: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
