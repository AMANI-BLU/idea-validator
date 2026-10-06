import { useState } from "react";
import { SearchInput } from "@/components/SearchInput";
import { ResultCard } from "@/components/ResultCard";
import { OpportunitySummary } from "@/components/OpportunitySummary";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { validateIdea, type ValidationResult } from "@/services/aiValidator";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [searchedIdea, setSearchedIdea] = useState("");
  const { toast } = useToast();

  const handleSearch = async (idea: string) => {
    setIsLoading(true);
    setResult(null);
    setSearchedIdea(idea);

    try {
      const data = await validateIdea(idea);
      setResult(data);
    } catch (error) {
      console.error("Error validating idea:", error);
      toast({
        title: "Validation error",
        description:
          error instanceof Error ? error.message : "Failed to analyze your idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-glow pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-glow opacity-50 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {/* Top Navbar */}
        <div className="flex justify-between items-center mb-10 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold tracking-tight text-xl text-foreground">
              Idea<span className="text-primary">Validator</span>
            </span>
          </div>
        </div>

        {/* Header */}
        <header className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm text-muted-foreground">AI-Powered Startup Research</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Is This </span>
            <span className="text-gradient">Built?</span>
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Enter your startup idea and discover existing products, competitors, and market opportunities in seconds.
          </p>
        </header>

        {/* Search Input */}
        <div className="mb-12">
          <SearchInput onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Content */}
        <main>
          {isLoading && <LoadingState />}

          {!isLoading && result && (
            <>
              {/* Searched idea badge */}
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-sm">
                  <span className="text-muted-foreground">Showing results for:</span>
                  <span className="text-foreground font-medium truncate max-w-[300px]">
                    "{searchedIdea}"
                  </span>
                </span>
              </div>

              {/* Summary */}
              <OpportunitySummary
                summary={result.summary}
                opportunity={result.opportunity}
              />

              {/* Results grid */}
              {result.products.length > 0 ? (
                <div className="w-full max-w-4xl mx-auto">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Similar Products Found ({result.products.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.products.map((product, index) => (
                      <ResultCard key={index} product={product} index={index} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No similar products found. This could be a unique opportunity!
                  </p>
                </div>
              )}
            </>
          )}

          {!isLoading && !result && <EmptyState onExampleClick={handleSearch} />}
        </main>

        {/* Footer */}
        <footer className="mt-20 text-center">
          <p className="text-muted-foreground text-sm">
            Powered by AI • Built for Founders
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
