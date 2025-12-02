import { useState, useRef, useEffect } from "react";
import { Play, Pause, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NowPlaying {
  title: string;
  artist: string;
  coverUrl: string;
  listeners: number;
}

const RadioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying>({
    title: "stuVion Radio",
    artist: "Loading...",
    coverUrl: "",
    listeners: 0,
  });
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const STREAM_URL = "https://ls111.systemweb-server.eu:8040/128kbps.mp3";

  // Fetch now playing
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
            listeners: data.listeners || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching now playing:", error);
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 10000);

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
    const shareText = `🎵 Höre gerade auf stuVion Radio:\n"${nowPlaying.title}" von ${nowPlaying.artist}`;
    const shareUrl = window.location.href;

    // Check if Web Share API is available
    if (navigator.share) {
      try {
        // Try to fetch the cover image and create a file
        if (nowPlaying.coverUrl && nowPlaying.coverUrl !== '/placeholder.svg') {
          try {
            const response = await fetch(nowPlaying.coverUrl);
            const blob = await response.blob();
            const file = new File([blob], 'cover.jpg', { type: blob.type });
            
            await navigator.share({
              title: `${nowPlaying.title} - stuVion Radio`,
              text: shareText,
              url: shareUrl,
              files: [file]
            });
          } catch (fileError) {
            // If file sharing fails, share without image
            await navigator.share({
              title: `${nowPlaying.title} - stuVion Radio`,
              text: shareText,
              url: shareUrl,
            });
          }
        } else {
          await navigator.share({
            title: `${nowPlaying.title} - stuVion Radio`,
            text: shareText,
            url: shareUrl,
          });
        }
        
        toast({
          title: "Geteilt!",
          description: "Song erfolgreich geteilt",
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // Fallback: Copy to clipboard with all info
      try {
        const clipboardText = `${shareText}\n\n${shareUrl}`;
        await navigator.clipboard.writeText(clipboardText);
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
    <Card className="bg-player-card/80 backdrop-blur-xl border-border/50 p-8 sm:p-10 shadow-2xl relative overflow-hidden max-w-2xl mx-auto">
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
        <div className="text-center space-y-4 max-w-md w-full">
          <h2 className="text-3xl sm:text-4xl font-bold text-player-text leading-tight line-clamp-2">{nowPlaying.title}</h2>
          <p className="text-player-text-muted text-xl font-medium line-clamp-1">{nowPlaying.artist}</p>
          
          {/* Share Button */}
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleShare}
              className="gap-2 bg-secondary/50 hover:bg-secondary/80 border-border/50 px-8 py-6 cursor-pointer"
            >
              <Share2 className="w-5 h-5" />
              Song teilen
            </Button>
          </div>
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
