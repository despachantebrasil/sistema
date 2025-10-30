import { supabase } from '../integrations/supabase/client';
import type { AppUser, Role } from '../types';

/**
 * Cria um novo usuário, seu perfil e faz o upload do avatar.
 * @param email O e-mail do usuário.
 * @param password A senha do usuário.
 * @param userData Os metadados do usuário (nome completo e perfil).
 * @param avatarFile O arquivo de imagem do avatar (opcional).
 * @returns Os dados do usuário criado ou um erro.
 */
export const createUserWithProfile = async (
    email: string,
    password: string,
    userData: { fullName: string; role: Role },
    avatarFile: File | null
): Promise<{ user: AppUser | null; error: Error | null }> => {
    const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        userData.fullName
    )}&background=random&color=fff`;

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: userData.fullName,
                role: userData.role,
                avatar_url: defaultAvatarUrl,
            },
        },
    });

    if (signUpError) {
        console.error('Erro ao criar usuário:', signUpError.message);
        return { user: null, error: signUpError };
    }
    if (!authData.user) {
        return { user: null, error: new Error('Usuário não foi criado.') };
    }

    const user = authData.user;
    let finalAvatarUrl = defaultAvatarUrl;

    if (avatarFile) {
        const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
        // Nota: O bucket 'avatars' deve ser criado manualmente no Supabase Storage.
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile);

        if (uploadError) {
            console.error('Erro ao fazer upload do avatar:', uploadError);
        } else {
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
            finalAvatarUrl = publicUrl;
            // Atualiza o perfil com a URL pública do avatar
            await supabase.from('profiles').update({ avatar_url: finalAvatarUrl }).eq('id', user.id);
        }
    }

    const appUser: AppUser = {
        id: user.id,
        fullName: userData.fullName,
        email: user.email!,
        role: userData.role,
        avatarUrl: finalAvatarUrl,
    };
    return { user: appUser, error: null };
};


/**
 * Atualiza um usuário existente, seu perfil e, opcionalmente, seu avatar.
 * @param userId O ID do usuário a ser atualizado.
 * @param userData Os novos dados do usuário.
 * @param password A nova senha (opcional).
 * @param avatarFile O novo arquivo de avatar (opcional).
 * @returns Os dados do usuário atualizado ou um erro.
 */
export const updateUserWithProfile = async (
    userId: string,
    userData: { fullName: string; email: string; role: Role; avatarUrl?: string },
    password?: string | null,
    avatarFile?: File | null
): Promise<{ user: AppUser | null; error: Error | null }> => {
    let newAvatarUrl = userData.avatarUrl;

    if (avatarFile) {
        const filePath = `${userId}/${Date.now()}_${avatarFile.name}`;
        // Nota: O bucket 'avatars' deve ser criado manualmente no Supabase Storage.
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
            console.error('Erro ao fazer upload do novo avatar:', uploadError);
            return { user: null, error: uploadError };
        }
        
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        newAvatarUrl = publicUrl;
    }

    // Invoca a função Edge para atualizar o usuário (requer chave de serviço)
    const { data, error } = await supabase.functions.invoke('update-user', {
        body: {
            user_id: userId,
            full_name: userData.fullName,
            email: userData.email,
            role: userData.role,
            avatar_url: newAvatarUrl,
            password: password,
        },
    });

    if (error) {
        console.error('Erro ao invocar a função update-user:', error);
        return { user: null, error };
    }

    return { user: data.user as AppUser, error: null };
};

/**
 * Busca todos os usuários e seus perfis usando a função Edge (requer permissão de administrador).
 * @returns Uma lista de AppUser ou um erro.
 */
export const fetchAllUsers = async (): Promise<{ users: AppUser[] | null; error: Error | null }> => {
    const { data, error } = await supabase.functions.invoke('fetch-users');

    if (error) {
        console.error('Erro ao invocar a função fetch-users:', error);
        return { users: null, error };
    }

    return { users: data.users as AppUser[], error: null };
};

/**
 * Deleta um usuário e seu perfil usando a função Edge (requer permissão de administrador).
 * @param userId O ID do usuário a ser deletado.
 * @returns Um objeto de sucesso ou erro.
 */
export const deleteUser = async (userId: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: userId },
    });

    if (error) {
        console.error('Erro ao invocar a função delete-user:', error);
        return { error };
    }

    return { error: null };
};