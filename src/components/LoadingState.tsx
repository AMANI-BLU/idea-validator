import { Search } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col items-center justify-center py-16">
        {/* Animated search icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="relative p-4 rounded-full bg-secondary border border-border animate-pulse-glow">
            <Search className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
          Analyzing your idea...
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
          Searching through thousands of products and startups to find similar solutions
        </p>

        {/* Skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="glass-card rounded-xl p-6 animate-pulse"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-secondary rounded w-3/4 mb-2" />
                  <div className="h-4 bg-secondary rounded w-1/2" />
                </div>
                <div className="h-6 bg-secondary rounded-full w-24" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-secondary rounded w-full" />
                <div className="h-4 bg-secondary rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
