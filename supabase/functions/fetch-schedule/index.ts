import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Program {
  title: string;
  time: string;
  moderator: string;
  imageUrl: string;
}

interface DaySchedule {
  day: string;
  date: string;
  programs: Program[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const response = await fetch('https://stuvion.com/sendeplan');
    const html = await response.text();
    
    const schedule: DaySchedule[] = [];
    
    // Get today's day name in German
    const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const today = new Date();
    const todayName = dayNames[today.getDay()];
    
    // Parse each day's schedule
    const dayRegex = /<div class="schedule-day">([\s\S]*?)<\/div>\s*<\/div>\s*(?=<div class="schedule-day">|<\/div>\s*<\/div>\s*<\/div>)/g;
    const dayHeaderRegex = /<h3>([^<]+)<\/h3>\s*<span class="day-date">([^<]+)<\/span>/;
    const programRegex = /<div class="program-item">([\s\S]*?)<\/div>\s*<\/div>/g;
    
    let dayMatch;
    while ((dayMatch = dayRegex.exec(html)) !== null) {
      const dayContent = dayMatch[1];
      const headerMatch = dayHeaderRegex.exec(dayContent);
      
      if (headerMatch) {
        const dayName = headerMatch[1].trim();
        const dayDate = headerMatch[2].trim();
        
        // Only get today's programs
        if (dayName !== todayName) continue;
        
        const programs: Program[] = [];
        
        // Find all programs for this day
        const programsSection = dayContent.match(/<div class="day-programs">([\s\S]*)/);
        if (programsSection) {
          const titleRegex = /<h4 class="program-title">\s*(?:<a[^>]*>)?\s*([^<]+)/g;
          const timeRegex = /<div class="program-time">([^<]+)<\/div>/g;
          const moderatorRegex = /<div class="program-moderator">[\s\S]*?<span>([^<]+)<\/span>/g;
          const imageRegex = /<div class="program-image">[\s\S]*?<img src="([^"]+)"/g;
          
          const titles: string[] = [];
          const times: string[] = [];
          const moderators: string[] = [];
          const images: string[] = [];
          
          let m;
          while ((m = titleRegex.exec(programsSection[1])) !== null) titles.push(m[1].trim());
          while ((m = timeRegex.exec(programsSection[1])) !== null) times.push(m[1].trim());
          while ((m = moderatorRegex.exec(programsSection[1])) !== null) moderators.push(m[1].trim());
          while ((m = imageRegex.exec(programsSection[1])) !== null) images.push(m[1]);
          
          for (let i = 0; i < titles.length; i++) {
            programs.push({
              title: titles[i] || 'Unbekannt',
              time: times[i] || '',
              moderator: moderators[i] || '',
              imageUrl: images[i] || '/placeholder.svg',
            });
          }
        }
        
        schedule.push({
          day: dayName,
          date: dayDate,
          programs,
        });
        
        break; // Only need today
      }
    }

    return new Response(JSON.stringify({ schedule }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch schedule', schedule: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
