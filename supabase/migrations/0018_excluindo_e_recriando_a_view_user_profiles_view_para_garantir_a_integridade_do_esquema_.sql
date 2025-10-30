-- Excluir a view se ela existir
DROP VIEW IF EXISTS public.user_profiles_view;

-- Recriar a view combinando dados de auth.users e public.profiles
CREATE VIEW public.user_profiles_view AS
SELECT
    p.id,
    p.full_name,
    p.role,
    a.email,
    p.avatar_url
FROM
    public.profiles p
JOIN
    auth.users a ON p.id = a.id;