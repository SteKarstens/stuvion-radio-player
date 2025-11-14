import { MessageCircle, TrendingUp, Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Browser } from "@capacitor/browser";

const NavigationLinks = () => {
  const links = [
    {
      title: "Chat",
      url: "https://chat.stuvion.com",
      icon: MessageCircle,
      variant: "default" as const,
      inApp: true,
    },
    {
      title: "Charts",
      url: "https://stuvion.com/charts",
      icon: TrendingUp,
      variant: "secondary" as const,
      inApp: true,
    },
    {
      title: "Datenschutz",
      url: "https://stuvion.com/datenschutz",
      icon: Shield,
      variant: "secondary" as const,
      inApp: false,
    },
    {
      title: "Impressum",
      url: "https://stuvion.com/impressum",
      icon: FileText,
      variant: "secondary" as const,
      inApp: false,
    },
  ];

  const handleLinkClick = async (url: string, inApp: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (inApp) {
      // Open in in-app browser for mobile
      try {
        await Browser.open({ url });
      } catch (error) {
        // Fallback for web browser
        window.open(url, '_blank');
      }
    } else {
      // Open external for legal pages
      window.open(url, '_blank');
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Button
            key={link.title}
            variant={link.variant}
            size="lg"
            onClick={(e) => handleLinkClick(link.url, link.inApp, e)}
            className="h-auto py-4 px-6 justify-center gap-3 hover:scale-105 transition-transform"
          >
            <Icon className="w-5 h-5" />
            <span className="text-lg">{link.title}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default NavigationLinks;
