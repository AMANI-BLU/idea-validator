import { useState, useEffect } from "react";
import { SearchInput } from "@/components/SearchInput";
import { ResultCard } from "@/components/ResultCard";
import { OpportunitySummary } from "@/components/OpportunitySummary";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { useToast } from "@/hooks/use-toast";
import {
  validateIdea,
  getGeminiApiKey,
  isDemoModeEnabled,
  type ValidationResult,
} from "@/services/aiValidator";
import { Settings, Sparkles, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [searchedIdea, setSearchedIdea] = useState("");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { toast } = useToast();

  const checkApiStatus = () => {
    setHasApiKey(Boolean(getGeminiApiKey()));
    setIsDemoMode(isDemoModeEnabled());
  };

  useEffect(() => {
    checkApiStatus();
  }, []);

  const handleSearch = async (idea: string) => {
    setIsLoading(true);
    setResult(null);
    setSearchedIdea(idea);

    try {
      const data = await validateIdea(idea);
      setResult(data);
    } catch (error) {
      console.error("Error validating idea:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to analyze your idea. Please try again.";
      
      toast({
        title: "Validation error",
        description: errorMessage,
        variant: "destructive",
      });

      if (errorMessage.toLowerCase().includes("api key")) {
        setIsApiKeyModalOpen(true);
      }
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
        {/* Top Navbar / Settings */}
        <div className="flex justify-between items-center mb-10 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold tracking-tight text-lg text-foreground">
              Idea<span className="text-primary">Validator</span>
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsApiKeyModalOpen(true)}
            className="border-border bg-secondary/60 hover:bg-secondary text-xs flex items-center gap-2 text-foreground transition-all shadow-sm"
          >
            {hasApiKey && !isDemoMode ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-medium">Gemini AI Active</span>
              </>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                <span>Demo Mode (Configure Key)</span>
              </>
            )}
            <Settings className="w-3.5 h-3.5 ml-1 opacity-70" />
          </Button>
        </div>

        {/* Header */}
        <header className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm text-muted-foreground">AI-Powered Idea Validation</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Is This </span>
            <span className="text-gradient">Built?</span>
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Enter your startup idea and discover existing products, competitors, and market opportunities in seconds.
          </p>
        </header>

        {/* Search */}
        <div className="mb-12">
          <SearchInput onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Content */}
        <main>
          {isLoading && <LoadingState />}

          {!isLoading && result && (
            <>
              {/* Demo Mode Notice if result was generated in demo mode */}
              {result.isDemo && (
                <div className="max-w-4xl mx-auto mb-6 p-3 rounded-xl border border-primary/30 bg-primary/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-foreground">
                    <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>
                      Running in <strong>Demo Mode</strong> with instant simulated insights.
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsApiKeyModalOpen(true)}
                    className="h-7 text-xs bg-primary/20 hover:bg-primary/30 text-primary font-medium px-3"
                  >
                    Add Free Gemini API Key &rarr;
                  </Button>
                </div>
              )}

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
            Powered by Google Gemini AI • Direct Client-Side (No Supabase required)
          </p>
        </footer>
      </div>

      {/* Settings Dialog */}
      <ApiKeyModal
        open={isApiKeyModalOpen}
        onOpenChange={setIsApiKeyModalOpen}
        onApiKeySaved={checkApiStatus}
      />
    </div>
  );
};

export default Index;
