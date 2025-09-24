import { PrismaClient } from '@prisma/client';
import { Board } from '../models/Board';
import { DatabaseFactory } from '../factories/DatabaseFactory';

export class BoardRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = DatabaseFactory.getInstance();
    }

    async create(data: { nome: string; ativo?: boolean }): Promise<Board> {
        return await this.prisma.board.create({
            data
        });
    }

    async findAll(ativo?: boolean): Promise<Board[]> {
        const where = ativo !== undefined ? { ativo } : { ativo: true };
        return await this.prisma.board.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });
    }

    async findById(id: string): Promise<Board | null> {
        return await this.prisma.board.findUnique({
            where: { id }
        });
    }

    async update(id: string, data: { nome: string }): Promise<Board> {
        return await this.prisma.board.update({
            where: { id },
            data
        });
    }

    async updateStatus(id: string, ativo: boolean): Promise<Board> {
        return await this.prisma.board.update({
            where: { id },
            data: { ativo }
        });
    }
}