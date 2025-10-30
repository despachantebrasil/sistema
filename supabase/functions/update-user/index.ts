import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, content-length',
}

declare const Deno: any; 

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { user_id, full_name, email, role, avatar_url, password } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Atualiza o perfil
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ full_name, role, avatar_url })
      .eq('id', user_id);

    if (profileError) throw profileError;

    // 2. Atualiza o usuário na tabela auth.users
    const userUpdate: any = { email };
    if (password) {
      userUpdate.password = password;
    }
    userUpdate.data = { full_name, role, avatar_url };

    const { data: userData, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      userUpdate
    );

    if (authError) throw authError;

    const updatedUser = {
        id: userData.user.id,
        fullName: full_name,
        email: userData.user.email,
        role: role,
        avatarUrl: avatar_url,
    };

    return new Response(JSON.stringify({ user: updatedUser }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('Erro inesperado em update-user:', e)
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})