-- Exclusão em ordem reversa devido a chaves estrangeiras
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;