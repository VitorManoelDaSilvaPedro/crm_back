import { PrismaClient } from '@prisma/client';
import { Usuario } from '../models/Usuario';
import { DatabaseFactory } from '../factories/DatabaseFactory';

export class UsuarioRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = DatabaseFactory.getInstance();
    }

    async create(data: { nome: string; foto?: string | null; email: string; celular: string; senha: string; nivel: string; codigo?: string | null; id_departamento: string }): Promise<Usuario> {
        const usuario = await this.prisma.usuario.create({
            data
        });
        return usuario as Usuario;
    }

    async findAll(): Promise<Usuario[]> {
        const usuarios = await this.prisma.usuario.findMany({
            include: {
                departamento: true
            }
        });
        return usuarios as Usuario[];
    }

    async findById(id: string): Promise<Usuario | null> {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id }
        });
        return usuario as Usuario | null;
    }

    async findByEmail(email: string): Promise<Usuario | null> {
        const usuario = await this.prisma.usuario.findUnique({
            where: { email }
        });
        return usuario as Usuario | null;
    }

    async update(id: string, data: { nome?: string; foto?: string | null; email?: string; celular?: string; senha?: string; nivel?: string; codigo?: string | null; id_departamento?: string }): Promise<Usuario> {
        const usuario = await this.prisma.usuario.update({
            where: { id },
            data
        });
        return usuario as Usuario;
    }

    async delete(id: string): Promise<Usuario> {
        const usuario = await this.prisma.usuario.update({
            where: { id },
            data: { ativo: false }
        });
        return usuario as Usuario;
    }

    async reativar(id: string): Promise<Usuario> {
        const usuario = await this.prisma.usuario.update({
            where: { id },
            data: { ativo: true }
        });
        return usuario as Usuario;
    }
}