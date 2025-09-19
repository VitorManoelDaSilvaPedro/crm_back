export interface Usuario {
    id: string;
    
    nome: string;
    foto?: string | null;
    email: string;
    celular: string;
    senha: string;
    nivel: string;
    codigo?: string | null;

    created_at: Date;
    updated_at: Date;
}