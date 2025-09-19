import { PrismaClient } from '@prisma/client';

export class DatabaseFactory {
    private static instance: PrismaClient;

    static getInstance(): PrismaClient {
        if (!DatabaseFactory.instance) {
            DatabaseFactory.instance = new PrismaClient();
        }
        return DatabaseFactory.instance;
    }

    static async connect(): Promise<void> {
        const prisma = DatabaseFactory.getInstance();
        await prisma.$connect();
    }

    static async disconnect(): Promise<void> {
        if (DatabaseFactory.instance) {
            await DatabaseFactory.instance.$disconnect();
        }
    }
}