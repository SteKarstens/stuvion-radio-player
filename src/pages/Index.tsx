import RadioPlayer from "@/components/RadioPlayer";
import NavigationLinks from "@/components/NavigationLinks";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      
      {/* Animated Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-radio-accent/10 via-transparent to-radio-gradient-end/10 pointer-events-none" />
      <div className="absolute top-20 -left-20 w-96 h-96 bg-radio-accent/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-radio-gradient-end/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      
      <div className="w-full max-w-4xl space-y-8 relative z-10">
        {/* Logo/Header */}
        <div className="text-center space-y-3">
          <div className="inline-block">
            <h1 className="text-6xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-radio-gradient-start to-radio-gradient-end tracking-tight drop-shadow-2xl">
              stuVion
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-radio-gradient-start to-radio-gradient-end rounded-full mt-3 shadow-lg shadow-radio-accent/50" />
          </div>
          <p className="text-muted-foreground text-xl font-medium tracking-wide">Radio vision online</p>
        </div>

        {/* Radio Player */}
        <RadioPlayer />

        {/* Navigation Links */}
        <NavigationLinks />

        {/* Footer */}
        <div className="text-center text-muted-foreground/70 text-sm pt-8">
          <p className="font-medium">© 2025 stuVion Radio. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
