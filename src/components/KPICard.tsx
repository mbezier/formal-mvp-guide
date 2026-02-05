import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  tooltipContent?: {
    description: string;
    formula: string;
  };
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger';
  };
}

export const KPICard = ({ title, value, change, icon: Icon, trend, tooltipContent, badge }: KPICardProps) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUp className="h-3 w-3" />;
    if (trend === 'down') return <ArrowDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getBadgeStyles = () => {
    if (!badge) return '';
    switch (badge.variant) {
      case 'success':
        return 'bg-success/20 text-success border-success/30';
      case 'warning':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'danger':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return '';
    }
  };

  return (
    <Card className="border border-border hover:border-foreground/20 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {title}
              </p>
              {tooltipContent && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="ml-1">
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-2">
                        <p className="text-sm">{tooltipContent.description}</p>
                        <p className="text-xs text-muted-foreground font-mono">{tooltipContent.formula}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {badge && (
                <Badge className={`text-[10px] px-1.5 py-0.5 ${getBadgeStyles()}`}>
                  {badge.text}
                </Badge>
              )}
            </div>
            {change !== undefined && (
              <div className={`flex items-center space-x-1 text-sm font-medium ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{Math.abs(change).toFixed(1)}% MoM</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
