import RadioPlayer from "@/components/RadioPlayer";
import NavigationLinks from "@/components/NavigationLinks";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col p-4 sm:p-8 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      
      {/* Animated Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-radio-accent/10 via-transparent to-radio-gradient-end/10 pointer-events-none" />
      <div className="absolute top-20 -left-20 w-96 h-96 bg-radio-accent/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-radio-gradient-end/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      
      <div className="w-full max-w-4xl mx-auto relative z-10 flex flex-col min-h-[calc(100vh-2rem)]">
        {/* Logo - Header Style */}
        <div className="text-center pt-1 pb-2">
          <div className="flex justify-center">
            <img 
              src={logo} 
              alt="stuVion Radio" 
              className="w-80 h-80 sm:w-96 sm:h-96 object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Radio Player */}
        <div className="flex-1 flex items-center justify-center py-4">
          <RadioPlayer />
        </div>

        {/* Navigation Links */}
        <div className="pb-2">
          <NavigationLinks />
        </div>

        {/* Footer */}
        <div className="text-center text-muted-foreground/70 text-sm pb-2">
          <p className="font-medium">© 2025 stuVion Radio. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
