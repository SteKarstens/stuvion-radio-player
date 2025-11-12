import RadioPlayer from "@/components/RadioPlayer";
import NavigationLinks from "@/components/NavigationLinks";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight">
            stuVion
          </h1>
          <p className="text-muted-foreground text-lg">Radio vision online</p>
        </div>

        {/* Radio Player */}
        <RadioPlayer />

        {/* Navigation Links */}
        <NavigationLinks />

        {/* Footer */}
        <div className="text-center text-muted-foreground text-sm">
          <p>© 2025 stuVion Radio. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
