CREATE OR REPLACE VIEW public.user_profiles_view AS
SELECT
    p.id,
    p.full_name,
    p.role,
    u.email,
    p.avatar_url
FROM
    public.profiles p
JOIN
    auth.users u ON p.id = u.id;

-- Garantir que usuários autenticados possam ler a view
GRANT SELECT ON public.user_profiles_view TO authenticated;