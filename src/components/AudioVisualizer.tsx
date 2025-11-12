import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
}

const AudioVisualizer = ({ audioElement, isPlaying }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode>();
  const dataArrayRef = useRef<Uint8Array>();

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up audio context and analyser
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    const draw = () => {
      if (!isPlaying) {
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        return;
      }

      animationIdRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.offsetHeight);
      gradient.addColorStop(0, "rgba(139, 92, 246, 0.1)");
      gradient.addColorStop(1, "rgba(236, 72, 153, 0.1)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      const barWidth = (canvas.offsetWidth / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.offsetHeight * 0.8;

        // Create gradient for bars
        const barGradient = ctx.createLinearGradient(0, canvas.offsetHeight - barHeight, 0, canvas.offsetHeight);
        barGradient.addColorStop(0, "rgb(139, 92, 246)");
        barGradient.addColorStop(1, "rgb(236, 72, 153)");
        
        ctx.fillStyle = barGradient;
        ctx.fillRect(x, canvas.offsetHeight - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }
    };

    if (isPlaying) {
      draw();
    }

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      source.disconnect();
      analyser.disconnect();
      audioContext.close();
    };
  }, [audioElement, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 rounded-xl bg-gradient-to-br from-radio-accent/5 to-radio-gradient-end/5 backdrop-blur-sm"
    />
  );
};

export default AudioVisualizer;
