
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Check if user is authenticated and show toast if not
 */
export const ensureAuthenticated = (): boolean => {
  const user = supabase.auth.getUser();
  if (!user) {
    toast({
      title: "Authentication required",
      description: "You must be signed in to perform this action",
      variant: "destructive"
    });
    return false;
  }
  return true;
};

/**
 * Handle API errors consistently
 */
export const handleError = (error: any, operation: string): void => {
  console.error(`Error ${operation}:`, error);
  toast({
    title: "Operation failed",
    description: `Failed to ${operation}. Please try again.`,
    variant: "destructive"
  });
};
