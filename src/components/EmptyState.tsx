import { Rocket, Zap, Target, TrendingUp } from "lucide-react";

interface EmptyStateProps {
  onExampleClick?: (idea: string) => void;
}

export const EmptyState = ({ onExampleClick }: EmptyStateProps) => {
  const examples = [
    { icon: Rocket, text: "An app that helps remote teams sync across time zones" },
    { icon: Zap, text: "AI-powered meal planning for busy professionals" },
    { icon: Target, text: "A marketplace for freelance legal services" },
    { icon: TrendingUp, text: "Subscription box for sustainable home products" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mt-16">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Try these examples
        </h2>
        <p className="text-muted-foreground">
          Click any idea below to see what's already out there
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {examples.map((example, index) => {
          const Icon = example.icon;
          return (
            <button
              key={index}
              onClick={() => onExampleClick?.(example.text)}
              className="group glass-card rounded-xl p-5 text-left hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed group-hover:text-foreground transition-colors">
                  {example.text}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
