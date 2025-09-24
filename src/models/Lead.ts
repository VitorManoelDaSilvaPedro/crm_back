export interface Lead {
    id: string;
    id_empresa: string;
    origem: 'automacao' | 'marketing' | 'manual';
    nome: string;
    email?: string;
    telefone?: string;
    ativo: boolean;
    motivo_arquivamento?: string; // o lead pode ser arquivado

    created_at?: any;
    updated_at?: any;
}