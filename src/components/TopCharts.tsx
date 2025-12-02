import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface ChartEntry {
  position: number;
  artist: string;
  title: string;
  coverUrl: string;
}

const TopCharts = () => {
  const [charts, setCharts] = useState<ChartEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-charts');
        if (error) throw error;
        if (data?.charts) {
          setCharts(data.charts);
        }
      } catch (error) {
        console.error('Error fetching charts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharts();
  }, []);

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50";
      case 2:
        return "bg-gradient-to-r from-slate-400/20 to-slate-300/20 border-slate-400/50";
      case 3:
        return "bg-gradient-to-r from-amber-700/20 to-orange-600/20 border-amber-700/50";
      default:
        return "bg-secondary/30 border-border/50";
    }
  };

  const getPositionBadge = (position: number) => {
    const colors = {
      1: "from-yellow-400 to-amber-500 text-black",
      2: "from-slate-300 to-slate-400 text-black",
      3: "from-amber-600 to-orange-500 text-white",
      4: "from-radio-gradient-start to-radio-gradient-end text-white",
      5: "from-radio-gradient-start to-radio-gradient-end text-white",
    };
    return colors[position as keyof typeof colors] || colors[5];
  };

  if (loading) {
    return (
      <Card className="bg-player-card/60 backdrop-blur-xl border-border/50 p-4 sm:p-6 w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-bold text-player-text">Top 5 Charts</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="w-14 h-14 rounded-lg" />
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

  return (
    <Card className="bg-player-card/60 backdrop-blur-xl border-border/50 p-4 sm:p-6 w-full max-w-2xl mx-auto overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-bold text-player-text">Top 5 Charts</h3>
        </div>
        <span className="text-xs text-player-text-muted">Aktualisiert: Montag 6:00</span>
      </div>
      
      <ScrollArea className="h-[280px] pr-2">
        <div className="space-y-2">
          {charts.map((entry) => (
            <div
              key={entry.position}
              className={`flex items-center gap-3 p-2 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${getPositionStyle(entry.position)}`}
            >
              {/* Position Badge */}
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getPositionBadge(entry.position)} flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0`}>
                {entry.position}
              </div>
              
              {/* Cover */}
              <div className="relative flex-shrink-0">
                <img
                  src={entry.coverUrl}
                  alt={`${entry.artist} - ${entry.title}`}
                  className="w-14 h-14 rounded-lg object-cover shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                {entry.position === 1 && (
                  <span className="absolute -top-1 -right-1 text-lg">👑</span>
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-player-text truncate text-sm">
                  {entry.title}
                </h4>
                <p className="text-player-text-muted text-xs truncate">
                  {entry.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default TopCharts;
