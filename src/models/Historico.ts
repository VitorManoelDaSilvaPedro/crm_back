export interface Historico {
    id: string;
    dominio: string;
    id_usuario?: string;
    id_lead?: string;
    tipo_ator: 'usuario' | 'automacao';
    descricao: string;
    created_at?: any;
    updated_at?: any;
}