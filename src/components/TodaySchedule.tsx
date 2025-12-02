import { useState, useEffect } from "react";
import { Radio, Clock, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

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

const TodaySchedule = () => {
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-schedule');
        if (error) throw error;
        if (data?.schedule && data.schedule.length > 0) {
          setSchedule(data.schedule[0]);
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  if (loading) {
    return (
      <Card className="bg-player-card/60 backdrop-blur-xl border-border/50 p-4 sm:p-6 w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Radio className="w-5 h-5 text-radio-accent" />
          <h3 className="text-lg font-bold text-player-text">Heute auf Sendung</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!schedule || schedule.programs.length === 0) {
    return (
      <Card className="bg-player-card/60 backdrop-blur-xl border-border/50 p-4 sm:p-6 w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Radio className="w-5 h-5 text-radio-accent" />
          <h3 className="text-lg font-bold text-player-text">Heute auf Sendung</h3>
        </div>
        <p className="text-player-text-muted text-center py-4">
          Heute keine geplanten Sendungen
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-player-card/60 backdrop-blur-xl border-border/50 p-4 sm:p-6 w-full max-w-2xl mx-auto overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-radio-accent" />
          <h3 className="text-lg font-bold text-player-text">Heute auf Sendung</h3>
        </div>
        <span className="text-xs px-2 py-1 bg-radio-accent/20 text-radio-accent rounded-full font-medium">
          {schedule.day}, {schedule.date}
        </span>
      </div>
      
      <ScrollArea className="h-[200px] pr-2">
        <div className="space-y-2">
          {schedule.programs.map((program, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30 transition-all duration-300 hover:bg-secondary/50 hover:scale-[1.01]"
            >
              {/* Show Image */}
              <div className="relative flex-shrink-0">
                <img
                  src={program.imageUrl}
                  alt={program.title}
                  className="w-12 h-12 rounded-lg object-cover shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-player-text truncate text-sm">
                  {program.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-player-text-muted mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {program.time}
                  </span>
                  {program.moderator && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {program.moderator}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default TodaySchedule;
