/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

// Define os cabeçalhos CORS para permitir requisições do seu app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Responde a requisições OPTIONS (pre-flight) para CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Cria um cliente Supabase com permissões de administrador usando a chave de serviço
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Extrai o ID do usuário do corpo da requisição
    const { user_id } = await req.json()
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'O ID do usuário é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Busca os detalhes do usuário para verificar o e-mail
    const { data: { user }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(user_id);

    if (getUserError) {
        console.error('Erro ao buscar usuário para verificação de exclusão:', getUserError);
        return new Response(JSON.stringify({ error: 'Não foi possível verificar o usuário.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Verifica se o usuário é o administrador protegido
    if (user && user.email === 'gilshikam@gmail.com') {
        return new Response(JSON.stringify({ error: 'Este administrador não pode ser removido.' }), {
            status: 403, // Forbidden
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Exclui o usuário usando o cliente de administrador
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(user_id)

    if (error) {
      console.error('Erro ao excluir usuário:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ message: 'Usuário excluído com sucesso', data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('Erro inesperado:', e)
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})