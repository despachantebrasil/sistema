-- 1. Remover a política que depende da função is_admin
DROP POLICY IF EXISTS "Administrators can view all profiles" ON public.profiles;

-- 2. Excluir a view e a função is_admin (se existirem)
DROP VIEW IF EXISTS public.user_profiles_view;
DROP FUNCTION IF EXISTS public.is_admin;

-- 3. Recriar a função is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'Administrador'
  );
$function$;

-- 4. Recriar a view user_profiles_view (combina auth.users e public.profiles)
CREATE OR REPLACE VIEW public.user_profiles_view AS
 SELECT p.id,
    p.full_name,
    p.role,
    a.email,
    p.avatar_url
   FROM public.profiles p
     JOIN auth.users a ON p.id = a.id;

-- 5. Garantir que a tabela profiles tenha RLS e políticas corretas
-- Remover políticas existentes (exceto a que já removemos no passo 1)
DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_policy ON public.profiles;

-- Recriar todas as políticas de RLS
CREATE POLICY "profiles_select_policy" ON public.profiles 
FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" ON public.profiles 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles 
FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_delete_policy" ON public.profiles 
FOR DELETE TO authenticated USING (auth.uid() = id);

-- Recriar a política que depende da função is_admin
CREATE POLICY "Administrators can view all profiles" ON public.profiles 
FOR SELECT TO authenticated USING (is_admin());