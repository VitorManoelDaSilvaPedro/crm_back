export interface Usuario {
    id: number;
    
    nome: string;
    foto?: string | null;
    email: string;
    celular: string;
    senha: string;
    nivel: string;
    codigo?: string | null;

    createdAt: Date;
    updatedAt: Date;
}