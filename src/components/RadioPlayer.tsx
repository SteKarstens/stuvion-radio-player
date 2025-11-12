import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NowPlaying {
  title: string;
  artist: string;
  coverUrl: string;
}

const RadioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying>({
    title: "stuVion Radio",
    artist: "Loading...",
    coverUrl: "",
  });
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const STREAM_URL = "https://ls111.systemweb-server.eu:8040/128kbps.mp3";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('now-playing');

        if (error) {
          throw error;
        }

        if (data) {
          setNowPlaying({
            title: data.title,
            artist: data.artist,
            coverUrl: data.coverUrl,
          });
        }
      } catch (error) {
        console.error("Error fetching now playing:", error);
        // Keep showing last known data on error
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        // Load and play the stream
        audioRef.current.load();
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing audio:", error);
        alert("Stream konnte nicht geladen werden. Bitte überprüfen Sie die Stream-URL in der RadioPlayer.tsx Datei.");
      }
    }
  };

  const handleShare = async () => {
    const shareText = `Höre gerade "${nowPlaying.title}" von ${nowPlaying.artist} auf stuVion Radio! 🎵`;
    const shareUrl = window.location.href;

    // Check if Web Share API is available (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "stuVion Radio - Now Playing",
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: "Geteilt!",
          description: "Song erfolgreich geteilt",
        });
      } catch (error) {
        // User cancelled share or error occurred
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast({
          title: "In Zwischenablage kopiert!",
          description: "Song-Info wurde kopiert",
        });
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        toast({
          title: "Fehler",
          description: "Kopieren fehlgeschlagen",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="bg-player-card/80 backdrop-blur-xl border-border/50 p-8 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-radio-accent/5 to-radio-gradient-end/5 pointer-events-none" />
      
      <div className="flex flex-col items-center space-y-8 relative z-10">
        {/* Album Cover */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-radio-gradient-start to-radio-gradient-end opacity-30 blur-3xl group-hover:opacity-50 transition-all duration-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-radio-gradient-start/20 to-radio-gradient-end/20 rounded-3xl animate-pulse-glow" />
          <img
            src={nowPlaying.coverUrl || '/placeholder.svg'}
            alt="Now Playing"
            className="w-72 h-72 sm:w-80 sm:h-80 rounded-3xl shadow-2xl object-cover relative z-10 transition-all duration-500 group-hover:scale-105 border-4 border-white/10"
          />
          {isPlaying && (
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-radio-gradient-start to-radio-gradient-end text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse z-20 flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          )}
        </div>

        {/* Now Playing Info */}
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight line-clamp-2">{nowPlaying.title}</h2>
          <p className="text-muted-foreground text-xl font-medium line-clamp-1">{nowPlaying.artist}</p>
          
          {/* Share Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2 mt-4 bg-secondary/50 hover:bg-secondary/80 border-border/50"
          >
            <Share2 className="w-4 h-4" />
            Song teilen
          </Button>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-6">
          <Button
            size="lg"
            onClick={togglePlay}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-radio-gradient-start to-radio-gradient-end hover:shadow-2xl hover:shadow-radio-accent/50 transition-all duration-300 hover:scale-110 border-4 border-white/20 relative group"
          >
            <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            {isPlaying ? (
              <Pause className="w-10 h-10 text-white drop-shadow-lg relative z-10" />
            ) : (
              <Play className="w-10 h-10 ml-1 text-white drop-shadow-lg relative z-10" />
            )}
          </Button>
        </div>

        {/* Volume Control */}
        <div className="w-full max-w-sm flex items-center gap-4 bg-secondary/50 backdrop-blur-sm px-6 py-4 rounded-full border border-border/50 shadow-lg">
          <Volume2 className="w-6 h-6 text-radio-accent" />
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-sm font-bold text-foreground w-12 text-right">{volume}%</span>
        </div>

        {/* Hidden Audio Element */}
        <audio 
          ref={audioRef} 
          preload="none"
          crossOrigin="anonymous"
        >
          <source src={STREAM_URL} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    </Card>
  );
};

export default RadioPlayer;
