import { PrismaClient } from '@prisma/client';
import { Usuario } from '../models/Usuario';
import { DatabaseFactory } from '../factories/DatabaseFactory';

export class UsuarioRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = DatabaseFactory.getInstance();
    }

    async create(data: { nome: string; foto?: string | null; email: string; celular: string; senha: string; nivel: string; codigo?: string | null }): Promise<Usuario> {
        return await this.prisma.usuario.create({
            data
        });
    }

    async findAll(): Promise<Usuario[]> {
        return await this.prisma.usuario.findMany();
    }

    async findById(id: string): Promise<Usuario | null> {
        return await this.prisma.usuario.findUnique({
            where: { id }
        });
    }

    async findByEmail(email: string): Promise<Usuario | null> {
        return await this.prisma.usuario.findUnique({
            where: { email }
        });
    }

    async update(id: string, data: { nome?: string; foto?: string | null; email?: string; celular?: string; senha?: string; nivel?: string; codigo?: string | null }): Promise<Usuario> {
        return await this.prisma.usuario.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<Usuario> {
        return await this.prisma.usuario.delete({
            where: { id }
        });
    }
}