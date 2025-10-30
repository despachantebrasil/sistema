import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient, type User } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Profile {
    id: string;
    full_name: string;
    role: string;
    avatar_url: string | null;
}

// Deno is available in the Edge Function runtime environment, but not locally in the TS compiler context.
declare const Deno: any; 

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Cria um cliente Supabase com permissões de administrador usando a chave de serviço
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Busca todos os usuários da tabela auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    const userIds = authUsers.users.map((u: User) => u.id);
    
    // 2. Busca os perfis correspondentes
    const { data: profiles, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .in('id', userIds) as { data: Profile[] | null, error: any };
    
    if (profileError) throw profileError;

    // 3. Combina os dados de autenticação (email) com os dados do perfil
    const usersMap = new Map(profiles?.map((p: Profile) => [p.id, p]));
    
    const combinedUsers = authUsers.users.map((authUser: User) => {
        const profile = usersMap.get(authUser.id);
        
        // Tipagem segura para user_metadata
        const userMetadata = authUser.user_metadata as { full_name?: string, role?: string, avatar_url?: string };

        return {
            id: authUser.id,
            fullName: profile?.full_name || userMetadata.full_name || 'Nome Desconhecido',
            email: authUser.email,
            role: profile?.role || userMetadata.role || 'Usuário',
            avatarUrl: profile?.avatar_url || userMetadata.avatar_url || null,
        };
    });

    return new Response(JSON.stringify({ users: combinedUsers }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('Erro inesperado em fetch-users:', e)
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})