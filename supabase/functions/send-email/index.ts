// Supabase Edge Function: send-email
// Sends emails via user-configured SMTP settings
// Deploy with: supabase functions deploy send-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
  from?: string;
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
        JSON.stringify({ error: "Email settings not configured. Please configure SMTP in Settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const settings = profile.email_settings;
    
    // Validate required SMTP settings
    if (!settings.smtp_host || !settings.smtp_port || !settings.smtp_user || !settings.smtp_pass) {
      return new Response(
        JSON.stringify({ error: "Incomplete SMTP settings. Please configure all SMTP fields." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: SendEmailRequest = await req.json();
    
    if (!body.to || !body.subject || !body.body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: settings.smtp_host,
        port: settings.smtp_port,
        tls: settings.smtp_secure !== false,
        auth: {
          username: settings.smtp_user,
          password: settings.smtp_pass,
        },
      },
    });

    // Prepare recipients
    const recipients = Array.isArray(body.to) ? body.to : [body.to];
    const fromAddress = body.from || settings.smtp_user;

    // Send email
    await client.send({
      from: fromAddress,
      to: recipients,
      subject: body.subject,
      content: body.body,
      html: body.html,
    });

    await client.close();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sent to ${recipients.join(", ")}` 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Email send error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email", 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
