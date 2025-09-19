import { PrismaClient } from '@prisma/client';
import { Departamento } from '../models/Departamento';
import { DatabaseFactory } from '../factories/DatabaseFactory';

export class DepartamentoRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = DatabaseFactory.getInstance();
    }

    async create(data: { nome: string; icone?: string; ativo: boolean }): Promise<Departamento> {
        return await this.prisma.departamento.create({
            data
        });
    }

    async findAll(ativo?: boolean): Promise<Departamento[]> {
        return await this.prisma.departamento.findMany({
            where: {
                ativo: true
            }
        });
    }

    async findById(id: string): Promise<Departamento | null> {
        return await this.prisma.departamento.findUnique({
            where: { id }
        });
    }

    async update(id: string, data: { nome?: string; icone?: string; ativo?: boolean }): Promise<Departamento> {
        return await this.prisma.departamento.update({
            where: { id },
            data
        });
    }

    async softDelete(id: string): Promise<Departamento> {
        return await this.prisma.departamento.update({
            where: { id },
            data: {
                ativo: false
            }
        });
    }
}