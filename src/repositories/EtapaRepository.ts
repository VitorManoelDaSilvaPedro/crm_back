import { PrismaClient } from '@prisma/client';
import { Etapa } from '../models/Etapa';
import { DatabaseFactory } from '../factories/DatabaseFactory';

export class EtapaRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = DatabaseFactory.getInstance();
    }

    async create(data: { nome: string; ordem: number; id_board: string }): Promise<Etapa> {
        return await this.prisma.etapa.create({
            data
        });
    }

    async findByBoardId(id_board: string): Promise<Etapa[]> {
        return await this.prisma.etapa.findMany({
            where: { id_board },
            orderBy: { ordem: 'asc' }
        });
    }

    async findById(id: string): Promise<Etapa | null> {
        return await this.prisma.etapa.findUnique({
            where: { id }
        });
    }

    async findByOrdemAndBoard(ordem: number, id_board: string): Promise<Etapa | null> {
        return await this.prisma.etapa.findFirst({
            where: { ordem, id_board, ativo: true }
        });
    }

    async update(id: string, data: { nome: string }): Promise<Etapa> {
        return await this.prisma.etapa.update({
            where: { id },
            data
        });
    }

    async updateOrdem(id: string, ordem: number): Promise<Etapa> {
        return await this.prisma.etapa.update({
            where: { id },
            data: { ordem }
        });
    }

    async updateStatus(id: string, ativo: boolean): Promise<Etapa> {
        return await this.prisma.etapa.update({
            where: { id },
            data: { ativo }
        });
    }

    async incrementOrdem(id_board: string, ordemMin: number, ordemMax?: number): Promise<void> {
        await this.prisma.etapa.updateMany({
            where: {
                id_board,
                ordem: ordemMax ? { gte: ordemMin, lte: ordemMax } : { gte: ordemMin }
            },
            data: {
                ordem: { increment: 1 }
            }
        });
    }

    async decrementOrdem(id_board: string, ordemMin: number, ordemMax?: number): Promise<void> {
        await this.prisma.etapa.updateMany({
            where: {
                id_board,
                ordem: ordemMax ? { gte: ordemMin, lte: ordemMax } : { gte: ordemMin }
            },
            data: {
                ordem: { decrement: 1 }
            }
        });
    }
}