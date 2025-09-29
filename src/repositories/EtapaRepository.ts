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
            where: { id_board, ativo: true },
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
}