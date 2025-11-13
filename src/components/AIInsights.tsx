import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { KPIMetrics } from "@/lib/excel-utils";
import { useToast } from "@/hooks/use-toast";

interface AIInsightsProps {
  kpis: KPIMetrics;
}

export const AIInsights = ({ kpis }: AIInsightsProps) => {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('generate-insights', {
          body: { kpis }
        });

        if (error) {
          console.error("Error fetching insights:", error);
          toast({
            title: "Failed to generate insights",
            description: "Unable to generate AI insights at this time.",
            variant: "destructive",
          });
          setInsights("Unable to generate insights. Please try refreshing the page.");
          return;
        }

        setInsights(data.insights);
      } catch (error) {
        console.error("Error:", error);
        setInsights("Unable to generate insights. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [kpis, toast]);

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>AI-Powered Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Generating insights...</span>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground whitespace-pre-wrap">{insights}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
