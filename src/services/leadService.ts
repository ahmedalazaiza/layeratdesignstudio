import { supabase } from "../lib/supabase";

/**
 * Lead & Community Capture Service
 */
export const leadService = {
  /**
   * Captures guest email from gift modal
   */
  async captureGiftLead(email: string, source: string = "gift_modal"): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("gift_leads").insert({
        email: email.trim().toLowerCase(),
        source,
      });

      if (error && !error.message.includes("duplicate")) {
        throw error;
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to register email" };
    }
  },
};
