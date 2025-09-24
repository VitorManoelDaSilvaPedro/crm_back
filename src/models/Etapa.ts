export interface Etapa {
    id: string;
    id_board: string;
    ativo: boolean;
    nome: string;
    ordem: number;
    tipo: string;
    created_at?: any;
    updated_at?: any;
}