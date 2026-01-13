import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  onSearch: (idea: string) => void;
  isLoading?: boolean;
}

export const SearchInput = ({ onSearch, isLoading = false }: SearchInputProps) => {
  const [idea, setIdea] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim() && !isLoading) {
      onSearch(idea.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />
        
        {/* Input container */}
        <div className="relative flex items-center glass-card rounded-xl overflow-hidden">
          <div className="absolute left-4 text-muted-foreground">
            <Search className="w-5 h-5" />
          </div>
          
          <input
            type="text"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your startup idea..."
            className="w-full py-4 pl-12 pr-32 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={!idea.trim() || isLoading}
            className={cn(
              "absolute right-2 flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-300",
              "bg-primary text-primary-foreground",
              "hover:shadow-glow hover:scale-[1.02]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none",
              isLoading && "animate-pulse"
            )}
          >
            <Sparkles className="w-4 h-4" />
            {isLoading ? "Searching..." : "Check"}
          </button>
        </div>
      </div>
      
      <p className="text-center text-muted-foreground text-sm mt-3">
        Enter any idea to discover existing solutions and market opportunities
      </p>
    </form>
  );
};
