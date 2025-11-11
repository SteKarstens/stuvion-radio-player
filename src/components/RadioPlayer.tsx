import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

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

  const STREAM_URL = "https://www.stuvion.com/listen.m3u";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  useEffect(() => {
    // Simulate fetching now playing info
    // In production, you'd fetch from stuVion API and then iTunes API
    const fetchNowPlaying = async () => {
      try {
        // This is a placeholder - you'll need to implement actual API calls
        // Example: fetch from your radio's metadata endpoint
        const mockData: NowPlaying = {
          title: "stuVion Radio",
          artist: "Live Stream",
          coverUrl: "/placeholder.svg",
        };
        setNowPlaying(mockData);
      } catch (error) {
        console.error("Error fetching now playing:", error);
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Card className="bg-player-bg border-border p-8 shadow-2xl">
      <div className="flex flex-col items-center space-y-8">
        {/* Album Cover */}
        <div className="relative group">
          <div className="absolute inset-0 bg-player-glow opacity-20 blur-3xl group-hover:opacity-30 transition-opacity" />
          <img
            src={nowPlaying.coverUrl}
            alt="Now Playing"
            className="w-64 h-64 rounded-2xl shadow-2xl object-cover relative z-10 transition-transform group-hover:scale-105"
          />
        </div>

        {/* Now Playing Info */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{nowPlaying.title}</h2>
          <p className="text-muted-foreground text-lg">{nowPlaying.artist}</p>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-6">
          <Button
            size="lg"
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-player-glow/50 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>
        </div>

        {/* Volume Control */}
        <div className="w-full max-w-xs flex items-center gap-4">
          <Volume2 className="w-5 h-5 text-muted-foreground" />
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>

        {/* Hidden Audio Element */}
        <audio ref={audioRef} src={STREAM_URL} preload="none" />
      </div>
    </Card>
  );
};

export default RadioPlayer;
