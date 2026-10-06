import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Sparkles, ExternalLink, Check, AlertCircle, Trash2 } from "lucide-react";
import { getGeminiApiKey, setGeminiApiKey, isDemoModeEnabled, setDemoModeEnabled } from "@/services/aiValidator";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeySaved?: () => void;
}

export const ApiKeyModal = ({ open, onOpenChange, onApiKeySaved }: ApiKeyModalProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const existingKey = getGeminiApiKey();
      setApiKey(existingKey);
      setHasStoredKey(Boolean(existingKey));
      setIsDemo(isDemoModeEnabled());
    }
  }, [open]);

  const handleSave = () => {
    setGeminiApiKey(apiKey.trim());
    setDemoModeEnabled(isDemo);
    setHasStoredKey(Boolean(apiKey.trim()));

    toast({
      title: apiKey.trim() ? "API Key saved successfully" : "Settings updated",
      description: apiKey.trim()
        ? "Now running directly with Google Gemini AI."
        : "Using Demo Mode with simulated analysis.",
    });

    if (onApiKeySaved) onApiKeySaved();
    onOpenChange(false);
  };

  const handleClear = () => {
    setGeminiApiKey("");
    setApiKey("");
    setHasStoredKey(false);
    toast({
      title: "API Key removed",
      description: "Reverted to Demo Mode.",
    });
  };

  const handleToggleDemo = () => {
    const nextState = !isDemo;
    setIsDemo(nextState);
    setDemoModeEnabled(nextState);
    toast({
      title: nextState ? "Demo Mode Activated" : "Demo Mode Deactivated",
      description: nextState
        ? "Queries will use instant sample data without calling Gemini API."
        : "Queries will use your Gemini API key.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border text-foreground">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <KeyRound className="w-5 h-5" />
            </div>
            <DialogTitle className="text-xl font-display">AI Provider Settings</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Powered by <strong>Google Gemini API</strong> directly in your browser. No backend or Supabase server required!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status Banner */}
          <div className="p-3 rounded-lg border border-border bg-secondary/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  hasStoredKey && !isDemo ? "bg-green-500 animate-pulse" : "bg-yellow-500"
                }`}
              />
              <span className="font-medium text-foreground">
                {hasStoredKey && !isDemo ? "Live Gemini AI Active" : "Demo Mode Active"}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleToggleDemo}
              className="h-7 text-xs text-primary hover:text-primary/80 px-2"
            >
              {isDemo ? "Switch to Live Key" : "Force Demo Mode"}
            </Button>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between">
              <span>Gemini API Key</span>
              {hasStoredKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-destructive hover:underline inline-flex items-center gap-1 font-normal"
                >
                  <Trash2 className="w-3 h-3" /> Clear key
                </button>
              )}
            </label>
            <Input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-secondary/70 border-border font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span>Your key is stored securely in your browser's localStorage.</span>
            </p>
          </div>

          {/* How to get a free key */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-primary">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Get a free key (100% Free)
              </span>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 underline hover:text-primary/80"
              >
                Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              1. Sign in with Google on Google AI Studio.<br />
              2. Click "Get API key" &rarr; "Create API key".<br />
              3. Paste the key above. No credit card required!
            </p>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            size="sm"
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          >
            <Check className="w-4 h-4 mr-1.5" /> Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
