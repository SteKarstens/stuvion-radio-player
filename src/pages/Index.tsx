import RadioPlayer from "@/components/RadioPlayer";
import NavigationLinks from "@/components/NavigationLinks";
import ThemeToggle from "@/components/ThemeToggle";
import TopCharts from "@/components/TopCharts";
import TodaySchedule from "@/components/TodaySchedule";
import logo from "@/assets/logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col p-4 sm:p-6 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      
      {/* Animated Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-radio-accent/10 via-transparent to-radio-gradient-end/10 pointer-events-none" />
      <div className="absolute top-20 -left-20 w-96 h-96 bg-radio-accent/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-radio-gradient-end/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      
      <div className="w-full max-w-4xl mx-auto relative z-10 flex flex-col gap-4">
        {/* Logo - Header Style */}
        <div className="text-center pt-1">
          <div className="flex justify-center">
            <img 
              src={logo} 
              alt="stuVion Radio" 
              className="w-64 h-32 sm:w-80 sm:h-40 object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Radio Player */}
        <div className="flex justify-center">
          <RadioPlayer />
        </div>

        {/* Charts & Schedule Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopCharts />
          <TodaySchedule />
        </div>

        {/* Navigation Links & Footer */}
        <div className="flex flex-col items-center gap-2 pb-2">
          <NavigationLinks />
          <p className="text-muted-foreground/50 text-xs">
            © 2025 stuVion Radio
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
