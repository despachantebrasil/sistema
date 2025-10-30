import type { AppUser, Role } from '../types';
import { mockUsers } from '../data/mockData';

/**
 * Simula a criação de um novo usuário.
 */
export const createUserWithProfile = async (
    email: string,
    _password: string, // Corrigido: prefixado com _
    userData: { fullName: string; role: Role },
    avatarFile: File | null
): Promise<{ user: AppUser | null; error: Error | null }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newId = `mock-user-${Date.now()}`;
    const avatarUrl = avatarFile ? URL.createObjectURL(avatarFile) : `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName)}&background=random&color=fff`;

    const newUser: AppUser = {
        id: newId,
        fullName: userData.fullName,
        email: email,
        role: userData.role,
        avatarUrl: avatarUrl,
    };
    
    // Em um ambiente real, você adicionaria isso a um estado global ou banco de dados.
    console.log('Mock: User created', newUser);
    return { user: newUser, error: null };
};


/**
 * Simula a atualização de um usuário existente.
 */
export const updateUserWithProfile = async (
    userId: string,
    userData: { fullName: string; email: string; role: Role; avatarUrl?: string },
    _password?: string | null, // Corrigido: prefixado com _
    avatarFile?: File | null
): Promise<{ user: AppUser | null; error: Error | null }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let newAvatarUrl = userData.avatarUrl;
    if (avatarFile) {
        newAvatarUrl = URL.createObjectURL(avatarFile);
    }

    const updatedUser: AppUser = {
        id: userId,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
        avatarUrl: newAvatarUrl,
    };
    
    console.log('Mock: User updated', updatedUser);
    return { user: updatedUser, error: null };
};

/**
 * Busca todos os usuários mockados.
 */
export const fetchAllUsers = async (): Promise<{ users: AppUser[] | null; error: Error | null }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { users: mockUsers, error: null };
};

/**
 * Simula a exclusão de um usuário.
 */
export const deleteUser = async (userId: string): Promise<{ error: Error | null }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Mock: User ${userId} deleted`);
    return { error: null };
};