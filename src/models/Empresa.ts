export interface Empresa {
    id: string;
    nome: string;
    cnpj?: string;
    origem: 'automacao' | 'marketing' | 'manual';

    created_at?: any;
    updated_at?: any;
}