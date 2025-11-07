import { supabase } from '../integrations/supabase/client';
import type { AppUser, Role, Client, Vehicle, Service, Transaction, AuditLog } from '../types';
import { ServiceStatus, TransactionType, TransactionStatus } from '../types';

// --- Audit Log Functions ---

/**
 * Registra uma ação na tabela de auditoria.
 * @param action A ação realizada (ex: 'CLIENT_CREATED').
 * @param entityInfo O tipo e ID da entidade relacionada.
 * @param details Detalhes adicionais em formato JSON.
 */
export const logAction = async (
    action: string,
    entityInfo: { type: string; id: string | number },
    details?: Record<string, any>
): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.warn('LogAction chamada sem um usuário autenticado.');
        return;
    }

    const { error } = await supabase.from('audit_log').insert({
        user_id: user.id,
        action: action,
        entity_type: entityInfo.type,
        entity_id: String(entityInfo.id),
        details: details || {},
    });

    if (error) {
        console.error('Erro ao registrar ação de auditoria:', error);
    }
};

/**
 * Busca os logs de auditoria para uma entidade específica.
 * @param entityType O tipo da entidade (ex: 'client').
 * @param entityId O ID da entidade.
 * @returns Uma lista de logs de auditoria.
 */
export const fetchAuditLogsForEntity = async (entityType: string, entityId: string | number): Promise<AuditLog[]> => {
    const { data, error } = await supabase.rpc('get_audit_logs_for_entity', {
        p_entity_type: entityType,
        p_entity_id: String(entityId)
    });

    if (error) {
        console.error('Erro ao buscar logs de auditoria:', error);
        throw error;
    }
    return data as AuditLog[];
};


// --- Auth & User Management Functions ---

export const createUserWithProfile = async (
    email: string,
    password: string,
    userData: { fullName: string; role: Role },
    avatarFile: File | null
): Promise<{ user: AppUser | null; error: Error | null }> => {
    const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        userData.fullName
    )}&background=0D47A1&color=fff`;

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
    
    await logAction('USER_CREATED', { type: 'user', id: user.id }, { email: user.email, role: userData.role });

    const appUser: AppUser = {
        id: user.id,
        fullName: userData.fullName,
        email: user.email!,
        role: userData.role,
        avatarUrl: finalAvatarUrl,
    };
    return { user: appUser, error: null };
};


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
    
    await logAction('USER_UPDATED', { type: 'user', id: userId }, { email: userData.email, role: userData.role });

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

type ClientPayload = Omit<Client, 'id' | 'user_id' | 'created_at'>;

export const createClient = async (clientData: ClientPayload, avatarFile: File | null): Promise<Client> => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Usuário não autenticado.");
    const userId = user.data.user.id;

    let avatar_url = clientData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(clientData.name)}&background=0D47A1&color=fff`;

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
        doc_status: clientData.doc_status, 
        avatar_url,
    };

    const { data, error } = await supabase
        .from('clients')
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    
    await logAction('CLIENT_CREATED', { type: 'client', id: data.id }, { name: data.name, cpf_cnpj: data.cpf_cnpj });

    return data as Client;
};

export const updateClient = async (clientId: number, clientData: Partial<ClientPayload>, avatarFile: File | null): Promise<Client> => {
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

    const payload: Partial<ClientPayload> = { ...clientData, avatar_url };

    const { data, error } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', clientId)
        .select()
        .single();

    if (error) throw error;
    
    await logAction('CLIENT_UPDATED', { type: 'client', id: data.id }, { name: data.name });

    return data as Client;
};

export const deleteClient = async (clientId: number): Promise<void> => {
    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

    if (error) throw error;
    
    await logAction('CLIENT_DELETED', { type: 'client', id: clientId });
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
    
    await logAction('VEHICLE_CREATED', { type: 'vehicle', id: data.id }, { plate: data.plate, owner_id: data.owner_id });

    return data as Vehicle;
};

export const updateVehicle = async (vehicleId: number, vehicleData: Partial<Omit<Vehicle, 'user_id' | 'created_at' | 'image_urls'>>, newImageFiles: File[], existingImageUrls: string[]): Promise<Vehicle> => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Usuário não autenticado.");
    const userId = user.data.user.id;
    
    const imageUrls: string[] = [...existingImageUrls];

    // Upload new images
    for (const file of newImageFiles) {
        // Use the vehicle's plate for the path, assuming it hasn't changed significantly
        const plate = vehicleData.plate || (await supabase.from('vehicles').select('plate').eq('id', vehicleId).single()).data?.plate || 'unknown';
        const filePath = `${userId}/vehicles/${plate}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
            .from('vehicle_images')
            .upload(filePath, file);

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('vehicle_images')
                .getPublicUrl(filePath);
            imageUrls.push(publicUrl);
        } else {
            console.error('Erro ao fazer upload da nova imagem do veículo:', uploadError);
        }
    }

    const payload = {
        ...vehicleData,
        image_urls: imageUrls,
    };

    const { data, error } = await supabase
        .from('vehicles')
        .update(payload)
        .eq('id', vehicleId)
        .select()
        .single();

    if (error) throw error;
    
    await logAction('VEHICLE_UPDATED', { type: 'vehicle', id: data.id }, { plate: data.plate });

    return data as Vehicle;
};

export const deleteVehicle = async (vehicleId: number): Promise<void> => {
    const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

    if (error) throw error;
    
    await logAction('VEHICLE_DELETED', { type: 'vehicle', id: vehicleId });
};

export const transferVehicle = async (
    vehicle: Vehicle,
    sellerId: number, // Novo: ID do cliente que está vendendo/contratando
    newOwnerId: number,
    price: number,
    dueDate: string,
    payerId: number,
    agentName: string,
    detranScheduleTime: string,
    contactPhone: string,
    paymentStatus: 'Pago' | 'Pendente',
    situationNotes: string
): Promise<void> => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Usuário não autenticado.");
    const userId = user.data.user.id;

    // 1. Create the transfer service
    const servicePayload = {
        user_id: userId,
        client_id: sellerId, // O serviço é criado em nome do VENDEDOR
        vehicle_id: vehicle.id,
        name: 'Transferência de Propriedade',
        status: ServiceStatus.TODO,
        due_date: dueDate,
        price: price,
        payer_client_id: payerId,
        agent_name: agentName,
        detran_schedule_time: detranScheduleTime || null,
        contact_phone: contactPhone || null,
        payment_status: paymentStatus,
        situation_notes: situationNotes || null,
    };
    const { data: newService, error: serviceError } = await supabase
        .from('services')
        .insert(servicePayload)
        .select()
        .single();

    if (serviceError) throw serviceError;

    // 2. Create the financial transaction
    const transactionDescription = `Serviço: Transferência de Propriedade - ${vehicle.plate}${agentName ? ` (Resp: ${agentName})` : ''}`;
    const transactionPayload = {
        user_id: userId,
        description: transactionDescription,
        category: 'Receita de Serviço',
        transaction_date: new Date().toISOString().split('T')[0],
        amount: price,
        type: TransactionType.REVENUE,
        status: TransactionStatus.PENDING,
        due_date: dueDate,
        service_id: newService.id,
        client_id: payerId, // The transaction is linked to the payer
    };
    const { error: transactionError } = await supabase.from('transactions').insert(transactionPayload);

    if (transactionError) {
        // Rollback service creation if transaction fails? For now, we'll just throw.
        throw transactionError;
    }

    // 3. Update the vehicle's owner
    const { error: vehicleUpdateError } = await supabase
        .from('vehicles')
        .update({ owner_id: newOwnerId })
        .eq('id', vehicle.id);

    if (vehicleUpdateError) throw vehicleUpdateError;

    // 4. Log the action
    await logAction('VEHICLE_TRANSFERRED', { type: 'vehicle', id: vehicle.id }, {
        from_owner_id: vehicle.owner_id,
        seller_id: sellerId,
        to_owner_id: newOwnerId,
        service_id: newService.id,
        agent: agentName,
    });
};


// --- Service CRUD Operations ---

export const fetchServices = async (): Promise<Service[]> => {
    const { data, error } = await supabase
        .from('services')
        .select('*, client:clients(name, cpf_cnpj, phone), vehicle:vehicles(plate), payer:clients!payer_client_id(name)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Mapeia os dados aninhados para o formato ServiceWithDetails
    return data.map((s: any) => ({
        ...s,
        payer_client_name: s.payer?.name,
        clientName: s.client?.name,
        clientCpfCnpj: s.client?.cpf_cnpj,
        clientPhone: s.client?.phone,
        vehiclePlate: s.vehicle?.plate,
    })) as Service[];
};

export const createService = async (serviceData: Omit<Service, 'id' | 'user_id' | 'created_at' | 'status'>): Promise<Service> => {
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
    
    await logAction('SERVICE_CREATED', { type: 'service', id: data.id }, { name: data.name, client_id: data.client_id, vehicle_id: data.vehicle_id });

    return data as Service;
};

type ServiceUpdatePayload = Partial<Omit<Service, 'id' | 'user_id' | 'created_at' | 'client_id' | 'vehicle_id' | 'price'>>;

export const updateService = async (serviceId: number, serviceData: ServiceUpdatePayload): Promise<Service> => {
    const { data, error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', serviceId)
        .select()
        .single();

    if (error) throw error;
    
    await logAction('SERVICE_UPDATED', { type: 'service', id: data.id }, { status: data.status });

    return data as Service;
};

export const deleteService = async (serviceId: number): Promise<void> => {
    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

    if (error) throw error;
    
    await logAction('SERVICE_DELETED', { type: 'service', id: serviceId });
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
    
    await logAction('TRANSACTION_CREATED', { type: 'transaction', id: data.id }, { description: data.description, amount: data.amount, type: data.type });

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
    
    await logAction('TRANSACTION_UPDATED', { type: 'transaction', id: data.id });

    return data as Transaction;
};

export const deleteTransaction = async (transactionId: number): Promise<void> => {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

    if (error) throw error;
    
    await logAction('TRANSACTION_DELETED', { type: 'transaction', id: transactionId });
};

// --- KPI/Report Functions ---

export const fetchDashboardKpis = async () => {
    const { count: clientCount, error: clientError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

    if (clientError) throw clientError;

    const { count: activeServiceCount, error: serviceError } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .in('status', [ServiceStatus.IN_PROGRESS, ServiceStatus.WAITING_DOCS, ServiceStatus.TODO]);

    if (serviceError) throw serviceError;

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

    const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, cnh_expiration_date');
    
    const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, plate, licensing_expiration_date');

    if (clientsError || vehiclesError) {
        console.error("Error fetching data for alerts:", clientsError || vehiclesError);
    }
    
    return {
        clientCount: clientCount || 0,
        activeServiceCount: activeServiceCount || 0,
        totalRevenue: totalRevenue,
        clients: clients || [],
        vehicles: vehicles || [],
    };
};