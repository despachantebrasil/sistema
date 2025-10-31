import { supabase } from '../integrations/supabase/client';
import type { Client, Vehicle, Service, Transaction } from '../types';

// --- Utility Functions ---

const getUserId = async (): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated.");
    }
    return user.id;
};

const handleSupabaseError = (error: any, operation: string) => {
    console.error(`Supabase Error during ${operation}:`, error);
    throw new Error(`Falha ao ${operation} no Supabase: ${error.message}`);
};

// --- Storage Operations ---

export const uploadAvatar = async (file: File): Promise<string> => {
    try {
        const user_id = await getUserId();
        const fileExt = file.name.split('.').pop();
        const filePath = `${user_id}/avatars/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            handleSupabaseError(uploadError, 'fazer upload do avatar');
        }

        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (e) {
        throw e;
    }
};

export const uploadVehicleImage = async (file: File, plate: string): Promise<string> => {
    try {
        const user_id = await getUserId();
        const fileExt = file.name.split('.').pop();
        // Use plate and timestamp for unique path
        const filePath = `${user_id}/${plate}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('vehicle_images')
            .upload(filePath, file);

        if (uploadError) {
            handleSupabaseError(uploadError, 'fazer upload da imagem do veículo');
        }

        const { data } = supabase.storage
            .from('vehicle_images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (e) {
        throw e;
    }
};


// --- Client Operations ---

export const fetchClients = async (): Promise<Client[]> => {
    try {
        const user_id = await getUserId();
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });

        if (error) handleSupabaseError(error, 'buscar clientes');
        
        // Ensure IDs are numbers for compatibility with existing frontend logic
        return (data as Client[]).map(c => ({ ...c, id: c.id }));
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const saveClient = async (clientData: Omit<Client, 'id' | 'docStatus'>, existingId?: number): Promise<Client> => {
    try {
        const user_id = await getUserId();
        
        // Map clientData (camelCase) to payload (snake_case for DB)
        const payload = {
            user_id,
            name: clientData.name,
            cpf_cnpj: clientData.cpfCnpj,
            email: clientData.email,
            phone: clientData.phone,
            address: clientData.address,
            avatar_url: clientData.avatarUrl,
            doc_status: 'Pendente', // Always default to 'Pendente' on creation/update via form
            client_type: clientData.clientType,
            marital_status: clientData.maritalStatus,
            profession: clientData.profession,
            nationality: clientData.nationality,
            naturalness: clientData.naturalness,
            cnh_expiration_date: clientData.cnhExpirationDate,
            trade_name: clientData.tradeName,
            contact_name: clientData.contactName,
        };

        let result;
        if (existingId) {
            result = await supabase
                .from('clients')
                .update(payload)
                .eq('id', existingId)
                .select()
                .single();
        } else {
            result = await supabase
                .from('clients')
                .insert(payload)
                .select()
                .single();
        }

        if (result.error) handleSupabaseError(result.error, existingId ? 'atualizar cliente' : 'inserir cliente');
        
        const savedClient = result.data as any;
        // Map back to Client type (camelCase)
        return { 
            ...savedClient, 
            id: savedClient.id,
            cpfCnpj: savedClient.cpf_cnpj,
            avatarUrl: savedClient.avatar_url,
            docStatus: savedClient.doc_status,
            clientType: savedClient.client_type,
            maritalStatus: savedClient.marital_status,
            profession: savedClient.profession,
            nationality: savedClient.nationality,
            naturalness: savedClient.naturalness,
            cnhExpirationDate: savedClient.cnh_expiration_date,
            tradeName: savedClient.trade_name,
            contactName: savedClient.contact_name,
        } as Client;
    } catch (e) {
        throw e;
    }
};

export const deleteClient = async (id: number): Promise<void> => {
    try {
        const user_id = await getUserId();
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id)
            .eq('user_id', user_id);

        if (error) handleSupabaseError(error, 'excluir cliente');
    } catch (e) {
        throw e;
    }
};

// --- Vehicle Operations ---

export const fetchVehicles = async (): Promise<Vehicle[]> => {
    try {
        const user_id = await getUserId();
        const { data, error } = await supabase
            .from('vehicles')
            .select('*, owner:clients(name)') // Join to get owner name
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });

        if (error) handleSupabaseError(error, 'buscar veículos');

        return (data as any[]).map(v => ({
            ...v,
            id: v.id,
            ownerName: v.owner?.name || 'Desconhecido',
            ownerId: v.owner_id,
            imageUrls: v.image_urls || [],
            yearManufacture: v.year_manufacture,
            yearModel: v.year_model,
            licensingExpirationDate: v.licensing_expiration_date,
        })) as Vehicle[];
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const saveVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'ownerName'>, existingId?: number): Promise<Vehicle> => {
    try {
        const user_id = await getUserId();
        const payload = {
            ...vehicleData,
            user_id,
            owner_id: vehicleData.ownerId,
            image_urls: vehicleData.imageUrls,
            year_manufacture: vehicleData.yearManufacture,
            year_model: vehicleData.yearModel,
            licensing_expiration_date: vehicleData.licensingExpirationDate,
        };

        let result;
        if (existingId) {
            result = await supabase
                .from('vehicles')
                .update(payload)
                .eq('id', existingId)
                .select('*, owner:clients(name)')
                .single();
        } else {
            result = await supabase
                .from('vehicles')
                .insert(payload)
                .select('*, owner:clients(name)')
                .single();
        }

        if (result.error) handleSupabaseError(result.error, existingId ? 'atualizar veículo' : 'inserir veículo');
        
        const savedVehicle = result.data as any;
        return { 
            ...savedVehicle, 
            id: savedVehicle.id,
            ownerName: savedVehicle.owner?.name || 'Desconhecido',
            ownerId: savedVehicle.owner_id,
            imageUrls: savedVehicle.image_urls || [],
            yearManufacture: savedVehicle.year_manufacture,
            yearModel: savedVehicle.year_model,
            licensingExpirationDate: savedVehicle.licensing_expiration_date,
        } as Vehicle;
    } catch (e) {
        throw e;
    }
};

export const deleteVehicle = async (id: number): Promise<void> => {
    try {
        const user_id = await getUserId();
        const { error } = await supabase
            .from('vehicles')
            .delete()
            .eq('id', id)
            .eq('user_id', user_id);

        if (error) handleSupabaseError(error, 'excluir veículo');
    } catch (e) {
        throw e;
    }
};

// --- Service Operations ---

export const fetchServices = async (): Promise<Service[]> => {
    try {
        const user_id = await getUserId();
        const { data, error } = await supabase
            .from('services')
            .select('*, client:clients(name), vehicle:vehicles(plate)')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });

        if (error) handleSupabaseError(error, 'buscar serviços');

        return (data as any[]).map(s => ({
            ...s,
            id: s.id,
            clientName: s.client?.name || 'Desconhecido',
            vehiclePlate: s.vehicle?.plate || 'Desconhecido',
            dueDate: s.due_date,
        })) as Service[];
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const saveService = async (serviceData: Omit<Service, 'id' | 'clientName' | 'vehiclePlate'> & { clientId: number, vehicleId: number }, existingId?: number): Promise<Service> => {
    try {
        const user_id = await getUserId();
        const payload = {
            ...serviceData,
            user_id,
            client_id: serviceData.clientId,
            vehicle_id: serviceData.vehicleId,
            due_date: serviceData.dueDate,
        };

        let result;
        if (existingId) {
            result = await supabase
                .from('services')
                .update(payload)
                .eq('id', existingId)
                .select('*, client:clients(name), vehicle:vehicles(plate)')
                .single();
        } else {
            result = await supabase
                .from('services')
                .insert(payload)
                .select('*, client:clients(name), vehicle:vehicles(plate)')
                .single();
        }

        if (result.error) handleSupabaseError(result.error, existingId ? 'atualizar serviço' : 'inserir serviço');
        
        const savedService = result.data as any;
        return { 
            ...savedService, 
            id: savedService.id,
            clientName: savedService.client?.name || 'Desconhecido',
            vehiclePlate: savedService.vehicle?.plate || 'Desconhecido',
            dueDate: savedService.due_date,
        } as Service;
    } catch (e) {
        throw e;
    }
};

export const deleteService = async (id: number): Promise<void> => {
    try {
        const user_id = await getUserId();
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id)
            .eq('user_id', user_id);

        if (error) handleSupabaseError(error, 'excluir serviço');
    } catch (e) {
        throw e;
    }
};

// --- Transaction Operations ---

export const fetchTransactions = async (): Promise<Transaction[]> => {
    try {
        const user_id = await getUserId();
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });

        if (error) handleSupabaseError(error, 'buscar transações');

        return (data as any[]).map(t => ({
            ...t,
            id: t.id,
            dueDate: t.due_date,
            clientId: t.client_id,
            serviceId: t.service_id,
        })) as Transaction[];
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const saveTransaction = async (transactionData: Omit<Transaction, 'id'>, existingId?: number): Promise<Transaction> => {
    try {
        const user_id = await getUserId();
        const payload = {
            ...transactionData,
            user_id,
            due_date: transactionData.dueDate,
            client_id: transactionData.clientId,
            service_id: transactionData.serviceId,
        };

        let result;
        if (existingId) {
            result = await supabase
                .from('transactions')
                .update(payload)
                .eq('id', existingId)
                .select()
                .single();
        } else {
            result = await supabase
                .from('transactions')
                .insert(payload)
                .select()
                .single();
        }

        if (result.error) handleSupabaseError(result.error, existingId ? 'atualizar transação' : 'inserir transação');
        
        const savedTransaction = result.data as any;
        return { 
            ...savedTransaction, 
            id: savedTransaction.id,
            dueDate: savedTransaction.due_date,
            clientId: savedTransaction.client_id,
            serviceId: savedTransaction.service_id,
        } as Transaction;
    } catch (e) {
        throw e;
    }
};

export const deleteTransaction = async (id: number): Promise<void> => {
    try {
        const user_id = await getUserId();
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)
            .eq('user_id', user_id);

        if (error) handleSupabaseError(error, 'excluir transação');
    } catch (e) {
        throw e;
    }
};

// --- Realtime Subscriptions (Simplified for now, full implementation in pages) ---

export const subscribeToClients = (callback: (payload: any) => void) => {
    return supabase
        .channel('clients_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, callback)
        .subscribe();
};

export const subscribeToVehicles = (callback: (payload: any) => void) => {
    return supabase
        .channel('vehicles_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, callback)
        .subscribe();
};

export const subscribeToServices = (callback: (payload: any) => void) => {
    return supabase
        .channel('services_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, callback)
        .subscribe();
};

export const subscribeToTransactions = (callback: (payload: any) => void) => {
    return supabase
        .channel('transactions_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, callback)
        .subscribe();
};