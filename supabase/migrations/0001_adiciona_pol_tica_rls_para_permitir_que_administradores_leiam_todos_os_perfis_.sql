CREATE POLICY "Administrators can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.is_admin());