import React from 'react';
import type { AppUser } from '../types';

export const PrintableUserDetails: React.FC<{ user: AppUser }> = ({ user }) => {
    const avatarUrl = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=0D47A1&color=fff`;
    
    return (
        <div className="p-6 space-y-6 printable-card">
            <div className="flex justify-between items-start border-b pb-4 mb-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-dark-text uppercase">{user.fullName}</h1>
                    <p className="text-lg text-primary font-medium">{user.role}</p>
                </div>
                <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300" 
                />
            </div>

            <h2 className="text-xl font-semibold text-primary border-b pb-2">Informações de Contato</h2>
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <p className="text-sm text-gray-500">E-mail</p>
                    <p className="font-semibold text-dark-text">{user.email}</p>
                </div>
            </div>
            
            <p className="text-xs text-gray-500 pt-4 border-t">Usuário do sistema URTECH DESPACHANTES</p>
        </div>
    );
};

export default PrintableUserDetails;