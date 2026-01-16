// Supabase Edge Function: check-email
// Checks for new emails via user-configured IMAP settings
// Deploy with: supabase functions deploy check-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ImapClient } from "https://deno.land/x/imap@v0.2.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Email {
  id: string;
  from: string;
  subject: string;
  date: string;
  preview: string;
  body?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the JWT token and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's email settings from profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("email_settings")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile?.email_settings) {
      return new Response(
        JSON.stringify({ error: "Email settings not configured. Please configure IMAP in Settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const settings = profile.email_settings;
    
    // Validate required IMAP settings
    if (!settings.imap_host || !settings.imap_port || !settings.imap_user || !settings.imap_pass) {
      return new Response(
        JSON.stringify({ error: "Incomplete IMAP settings. Please configure all IMAP fields." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const folder = url.searchParams.get("folder") || "INBOX";

    // Connect to IMAP server
    const client = new ImapClient({
      hostname: settings.imap_host,
      port: settings.imap_port,
      tls: settings.imap_secure !== false,
      username: settings.imap_user,
      password: settings.imap_pass,
    });

    await client.connect();
    await client.login();

    // Select mailbox
    const mailbox = await client.select(folder);
    
    // Get recent messages
    const emails: Email[] = [];
    const totalMessages = mailbox.exists || 0;
    const startIdx = Math.max(1, totalMessages - limit + 1);
    
    if (totalMessages > 0) {
      const messages = await client.fetch(`${startIdx}:*`, {
        envelope: true,
        bodyStructure: true,
        body: "HEADER.FIELDS (FROM SUBJECT DATE)",
        preview: true,
      });

      for (const msg of messages) {
        const envelope = msg.envelope;
        if (envelope) {
          const fromAddr = envelope.from?.[0];
          const fromStr = fromAddr 
            ? `${fromAddr.name || ""} <${fromAddr.mailbox}@${fromAddr.host}>`.trim()
            : "Unknown";
          
          emails.push({
            id: msg.uid?.toString() || msg.seq?.toString() || "",
            from: fromStr,
            subject: envelope.subject || "(No Subject)",
            date: envelope.date || "",
            preview: msg.preview || "",
          });
        }
      }
    }

    await client.logout();
    await client.close();

    // Reverse to show newest first
    emails.reverse();

    return new Response(
      JSON.stringify({ 
        success: true,
        folder,
        total: totalMessages,
        emails,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Email check error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to check email", 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
