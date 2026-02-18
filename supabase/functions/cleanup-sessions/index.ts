import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Delete members of expired sessions first (foreign key)
    const { data: expired } = await supabase
      .from("sessions")
      .select("id")
      .lt("expires_at", new Date().toISOString());

    if (expired && expired.length > 0) {
      const ids = expired.map((s) => s.id);

      await supabase
        .from("session_members")
        .delete()
        .in("session_id", ids);

      await supabase
        .from("sessions")
        .delete()
        .in("id", ids);
    }

    return new Response(
      JSON.stringify({ cleaned: expired?.length ?? 0 }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
