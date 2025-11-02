import { supabase } from '../integrations/supabase/client';
import type { AppUser, Role, Client, Vehicle, Service, Transaction } from '../types';
import { ClientDocStatus, ServiceStatus, TransactionType, TransactionStatus } from '../types';

// --- Auth & User Management Functions ---

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
        const filePath = `${userId}/clients/${Date.now()}_${avatarFile.name}`;
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
            console.error('Erro ao fazer upload do novo avatar do cliente:', uploadError);
            return { user: null, error: uploadError };
        }
        
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        newAvatarUrl = publicUrl;
    }

    const updatePayload: any = {
        user_id: userId,
        full_name: userData.fullName,
        email: userData.email,
        role: userData.role,
        avatar_url: newAvatarUrl,
    };
    if (password) {
        updatePayload.password = password;
    }

    const { data, error } = await supabase.functions.invoke('update-user', {
        body: updatePayload,
    });

    if (error) {
        console.error('Erro ao invocar a função update-user:', error);
        return { user: null, error };
    }

    return { user: data.user, error: null };
};

// --- Client CRUD Operations ---

export const fetchClients = async (): Promise<Client[]> => {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Client[];
};

export const createClient = async (clientData: Omit<Client, 'id' | 'user_id' | 'doc_status' | 'created_at'>, avatarFile: File | null): Promise<Client> => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Usuário não autenticado.");
    const userId = user.data.user.id;

    let avatar_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(clientData.name)}&background=0D47A1&color=fff`;

    if (avatarFile) {
        const filePath = `${userId}/clients/${Date.now()}_${avatarFile.name}`;
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile);

        if (uploadError) {
            console.error('Erro ao fazer upload do avatar do cliente:', uploadError);
        } else {
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
            avatar_url = publicUrl;
        }
    }

    const payload = {
        ...clientData,
        user_id: userId,
        doc_status: ClientDocStatus.PENDING,
        avatar_url,
    };

    const { data, error } = await supabase
        .from('clients')
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data as Client;
};

export const updateClient = async (clientId: number, clientData: Partial<Omit<Client, 'user_id' | 'created_at'>>, avatarFile: File | null): Promise<Client> => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Usuário não autenticado.");
    const userId = user.data.user.id;

    let avatar_url = clientData.avatar_url;

    if (avatarFile) {
        const filePath = `${userId}/clients/${Date.now()}_${avatarFile.name}`;
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
            console.error('Erro ao fazer upload do novo avatar do cliente:', uploadError);
        } else {
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            avatar_url = publicUrl;
        }
    }

    const payload = { ...clientData, avatar_url };

    const { data, error } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', clientId)
        .select()
        .single();

    if (error) throw error;
    return data as Client;
};

export const deleteClient = async (clientId: number): Promise<void> => {
    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

    if (error) throw error;
};

// --- Vehicle CRUD Operations ---

export const fetchVehicles = async (): Promise<Vehicle[]> => {
    const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Vehicle[];
};

export const createVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'user_id' | 'created_at'>, imageFiles: File[]): Promise<Vehicle> => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Usuário não autenticado.");
    const userId = user.data.user.id;
    
    const imageUrls: string[] = [];

    for (const file of imageFiles) {
        const filePath = `${userId}/vehicles/${vehicleData.plate}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
            .from('vehicle_images')
            .upload(filePath, file);

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('vehicle_images')
                .getPublicUrl(filePath);
            imageUrls.push(publicUrl);
        } else {
            console.error('Erro ao fazer upload da imagem do veículo:', uploadError);
        }
    }

    const payload = {
        ...vehicleData,
        user_id: userId,
        image_urls: imageUrls,
    };

    const { data, error } = await supabase
        .from('vehicles')
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data as Vehicle;
};

export const deleteVehicle = async (vehicleId: number): Promise<void> => {
    const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

    if (error) throw error;
};

// --- Service CRUD Operations ---

export const fetchServices = async (): Promise<Service[]> => {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Service[];
};

export const createService = async (serviceData: Omit<Service, 'id' | 'user_id' | 'status' | 'created_at'>): Promise<Service> => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Usuário não autenticado.");
    const userId = user.data.user.id;

    const payload = {
        ...serviceData,
        user_id: userId,
        status: ServiceStatus.TODO,
    };

    const { data, error } = await supabase
        .from('services')
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data as Service;
};

// --- Transaction CRUD Operations ---

export const fetchTransactions = async (): Promise<Transaction[]> => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data as Transaction[];
};

export const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Usuário não autenticado.");
    const userId = user.data.user.id;

    const payload = {
        ...transactionData,
        user_id: userId,
    };

    const { data, error } = await supabase
        .from('transactions')
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data as Transaction;
};

export const updateTransaction = async (transactionId: number, transactionData: Partial<Omit<Transaction, 'user_id' | 'created_at'>>): Promise<Transaction> => {
    const { data, error } = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', transactionId)
        .select()
        .single();

    if (error) throw error;
    return data as Transaction;
};

export const deleteTransaction = async (transactionId: number): Promise<void> => {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

    if (error) throw error;
};

// --- KPI/Report Functions ---

export const fetchDashboardKpis = async () => {
    // 1. Total Clients
    const { count: clientCount, error: clientError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

    if (clientError) throw clientError;

    // 2. Active Services (In Progress, Waiting Docs, To Do)
    const { count: activeServiceCount, error: serviceError } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .in('status', [ServiceStatus.IN_PROGRESS, ServiceStatus.WAITING_DOCS, ServiceStatus.TODO]);

    if (serviceError) throw serviceError;

    // 3. Monthly Revenue (Paid transactions this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfMonthISO = startOfMonth.toISOString().split('T')[0];

    const { data: revenueData, error: revenueError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', TransactionType.REVENUE)
        .eq('status', TransactionStatus.PAID)
        .gte('transaction_date', startOfMonthISO);

    if (revenueError) throw revenueError;
    
    const totalRevenue = revenueData.reduce((sum, t) => sum + t.amount, 0);

    // 4. Pending Alerts (CNH/Licensing expiring soon or expired)
    // This requires fetching all clients and vehicles to calculate alerts on the client side, 
    // as complex date logic is easier in JS than in a single Supabase query.
    const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, cnh_expiration_date');
    
    const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, plate, licensing_expiration_date');

    if (clientsError || vehiclesError) {
        console.error("Error fetching data for alerts:", clientsError || vehiclesError);
        // Continue with 0 alerts if fetching fails
    }
    
    // The actual alert calculation logic will remain in the Header component for now, 
    // but we return the raw data needed for it.

    return {
        clientCount: clientCount || 0,
        activeServiceCount: activeServiceCount || 0,
        totalRevenue: totalRevenue,
        clients: clients || [],
        vehicles: vehicles || [],
    };
};