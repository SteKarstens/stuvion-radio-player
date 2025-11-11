import { MessageCircle, TrendingUp, Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const NavigationLinks = () => {
  const links = [
    {
      title: "Chat",
      url: "https://chat.stuvion.com",
      icon: MessageCircle,
      variant: "default" as const,
    },
    {
      title: "Charts",
      url: "https://stuvion.com/charts",
      icon: TrendingUp,
      variant: "secondary" as const,
    },
    {
      title: "Datenschutz",
      url: "https://stuvion.com/datenschutz",
      icon: Shield,
      variant: "secondary" as const,
    },
    {
      title: "Impressum",
      url: "https://stuvion.com/impressum",
      icon: FileText,
      variant: "secondary" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Button
            key={link.title}
            variant={link.variant}
            size="lg"
            asChild
            className="h-auto py-4 px-6 justify-start gap-3 hover:scale-105 transition-transform"
          >
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              <Icon className="w-5 h-5" />
              <span className="text-lg">{link.title}</span>
            </a>
          </Button>
        );
      })}
    </div>
  );
};

export default NavigationLinks;
