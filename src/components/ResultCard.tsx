import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  name: string;
  description: string;
  website: string;
  similarity: "high" | "medium" | "low";
  differentiator: string;
}

interface ResultCardProps {
  product: Product;
  index: number;
}

const similarityConfig = {
  high: {
    label: "High Match",
    color: "text-red-400 bg-red-400/10 border-red-400/30",
    icon: TrendingUp,
  },
  medium: {
    label: "Medium Match",
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    icon: Minus,
  },
  low: {
    label: "Low Match",
    color: "text-green-400 bg-green-400/10 border-green-400/30",
    icon: TrendingDown,
  },
};

export const ResultCard = ({ product, index }: ResultCardProps) => {
  const config = similarityConfig[product.similarity];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300",
        "opacity-0 animate-fade-in-up",
        index === 0 && "animation-delay-100",
        index === 1 && "animation-delay-200",
        index === 2 && "animation-delay-300"
      )}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl font-semibold text-foreground truncate">
            {product.name}
          </h3>
          <a
            href={product.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mt-1 group"
          >
            <span className="truncate max-w-[200px]">{product.website.replace(/^https?:\/\//, '')}</span>
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
        
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border flex-shrink-0",
          config.color
        )}>
          <Icon className="w-3.5 h-3.5" />
          {config.label}
        </div>
      </div>
      
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {product.description}
      </p>
      
      <div className="pt-4 border-t border-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Key Differentiator
        </span>
        <p className="text-foreground text-sm mt-1">
          {product.differentiator}
        </p>
      </div>
    </div>
  );
};
