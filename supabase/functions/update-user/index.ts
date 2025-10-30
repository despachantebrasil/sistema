/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, email, password, full_name, role, avatar_url } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'O ID do usuário é obrigatório' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Atualiza os dados de autenticação (e-mail, senha)
    const authUpdatePayload: any = {};
    if (email) authUpdatePayload.email = email;
    if (password) authUpdatePayload.password = password;
    
    // Adiciona os metadados do usuário que também ficam na tabela auth.users
    authUpdatePayload.data = { full_name, role, avatar_url };

    if (Object.keys(authUpdatePayload).length > 0) {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(user_id, authUpdatePayload);
        if (authError) throw authError;
    }

    // 2. Atualiza a tabela de perfis
    const profileUpdatePayload: any = {};
    if (full_name) profileUpdatePayload.full_name = full_name;
    if (role) profileUpdatePayload.role = role;
    if (avatar_url) profileUpdatePayload.avatar_url = avatar_url;
    if (Object.keys(profileUpdatePayload).length > 0) {
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update(profileUpdatePayload)
            .eq('id', user_id);
        if (profileError) throw profileError;
    }

    // 3. Busca e retorna o perfil atualizado para a UI
    const { data: updatedProfile, error: fetchError } = await supabaseAdmin
        .from('user_profiles_view')
        .select('id, full_name, role, email, avatar_url')
        .eq('id', user_id)
        .single();
    
    if (fetchError) throw fetchError;

    const responseUser = {
        id: updatedProfile.id,
        fullName: updatedProfile.full_name,
        email: updatedProfile.email,
        role: updatedProfile.role,
        avatarUrl: updatedProfile.avatar_url,
    };

    return new Response(JSON.stringify({ message: 'Usuário atualizado com sucesso', user: responseUser }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('Erro inesperado:', e)
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})