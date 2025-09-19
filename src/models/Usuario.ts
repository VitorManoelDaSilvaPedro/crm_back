export type NivelUsuario = 'admin' | 'user';

export interface Usuario {
    id: string;
    
    nome: string;
    foto?: string | null;
    email: string;
    celular: string;
    senha: string;
    nivel: NivelUsuario;
    codigo?: string | null;

    created_at: Date;
    updated_at: Date;
}