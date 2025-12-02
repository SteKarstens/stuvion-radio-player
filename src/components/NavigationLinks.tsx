import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const NavigationLinks = () => {
  const links = [
    {
      title: "Impressum",
      url: "https://stuvion.com/impressum",
      icon: FileText,
      variant: "secondary" as const,
    },
  ];

  return (
    <div className="flex justify-center w-full max-w-2xl mx-auto">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Button
            key={link.title}
            variant={link.variant}
            size="sm"
            onClick={() => window.open(link.url, '_blank')}
            className="gap-2 opacity-70 hover:opacity-100 transition-opacity"
          >
            <Icon className="w-4 h-4" />
            <span>{link.title}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default NavigationLinks;
