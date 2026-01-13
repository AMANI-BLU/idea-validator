import { CheckCircle2, AlertCircle, XCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface OpportunitySummaryProps {
  summary: string;
  opportunity: {
    status: "yes" | "maybe" | "no";
    reason: string;
  };
}

const statusConfig = {
  yes: {
    label: "Opportunity Available",
    icon: CheckCircle2,
    color: "text-green-400",
    bgColor: "bg-green-400/10 border-green-400/30",
  },
  maybe: {
    label: "Potential Opportunity",
    icon: AlertCircle,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10 border-yellow-400/30",
  },
  no: {
    label: "Market Saturated",
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-400/10 border-red-400/30",
  },
};

export const OpportunitySummary = ({ summary, opportunity }: OpportunitySummaryProps) => {
  const config = statusConfig[opportunity.status];
  const Icon = config.icon;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Summary Card */}
      <div className="glass-card rounded-xl p-6 mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground mb-1">
              Market Analysis
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {summary}
            </p>
          </div>
        </div>
      </div>

      {/* Opportunity Status */}
      <div className={cn(
        "glass-card rounded-xl p-6 border",
        config.bgColor
      )}>
        <div className="flex items-start gap-3">
          <Icon className={cn("w-6 h-6 flex-shrink-0 mt-0.5", config.color)} />
          <div>
            <h3 className={cn("font-display font-semibold mb-1", config.color)}>
              {config.label}
            </h3>
            <p className="text-foreground/80 text-sm leading-relaxed">
              {opportunity.reason}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
