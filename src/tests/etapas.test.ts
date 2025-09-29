import axios from "axios";
import server from "../../server";
import { DatabaseFactory } from "../factories/DatabaseFactory";
import { createEtapaSchema } from '../controllers/schemas/etapaSchema';

const BASE_URL = "http://localhost:4000";

describe("Testes da API de Etapas", () => {
    let boardId: string;
    let etapaId: string;
    let createdEtapaIds: string[] = [];

    beforeAll(async () => {
        await DatabaseFactory.connect();
        
        await new Promise<void>((resolve) => {
            if (server.listening) {
                resolve();
            } else {
                server.on("listening", () => {
                    resolve();
                });
            }
        });

        // Criar um board para usar nos testes
        const prisma = DatabaseFactory.getInstance();
        const board = await prisma.board.create({
            data: {
                nome: 'Board Teste Etapas'
            }
        });
        boardId = board.id;
    }, 10000);

    afterAll(async () => {
        // Limpar dados de teste
        const prisma = DatabaseFactory.getInstance();
        try {
            if (createdEtapaIds.length > 0) {
                await prisma.etapa.deleteMany({
                    where: {
                        id: { in: createdEtapaIds }
                    }
                });
            }
            await prisma.board.delete({
                where: { id: boardId }
            });
        } catch (error) {
            console.log("Erro ao limpar dados de teste:", error);
        }

        await new Promise<void>((resolve) => {
            server.close(() => {
                resolve();
            });
        });
        await DatabaseFactory.disconnect();
    }, 10000);

    it("Criar etapa com dados válidos", async () => {
        const novaEtapa = {
            nome: "Nova Etapa",
            ordem: 1,
            id_board: boardId
        };

        const response = await axios.post(`${BASE_URL}/etapas`, novaEtapa);
        
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty("id");
        expect(response.data.nome).toBe(novaEtapa.nome);
        expect(response.data.ordem).toBe(novaEtapa.ordem);
        expect(response.data.id_board).toBe(novaEtapa.id_board);
        expect(response.data.ativo).toBe(true);
        expect(response.data).toHaveProperty("created_at");
        expect(response.data).toHaveProperty("updated_at");

        etapaId = response.data.id;
        createdEtapaIds.push(response.data.id);
    });

    it("Não criar etapa sem nome obrigatório", async () => {
        const etapaInvalida = {
            ordem: 2,
            id_board: boardId
        };

        try {
            await axios.post(`${BASE_URL}/etapas`, etapaInvalida);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe("Dados inválidos");
            expect(error.response.data.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "nome",
                        message: "Nome é obrigatório"
                    })
                ])
            );
        }
    });

    it("Não criar etapa com board inexistente", async () => {
        const etapaInvalida = {
            nome: "Etapa Teste",
            ordem: 1,
            id_board: "550e8400-e29b-41d4-a716-446655440000"
        };

        try {
            await axios.post(`${BASE_URL}/etapas`, etapaInvalida);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
            expect(error.response.data.message).toBe("Board não encontrado");
        }
    });

    it("Não criar etapa com ordem duplicada no mesmo board", async () => {
        // Criar primeira etapa
        const primeiraEtapa = await axios.post(`${BASE_URL}/etapas`, {
            nome: "Primeira Etapa",
            ordem: 3,
            id_board: boardId
        });
        
        createdEtapaIds.push(primeiraEtapa.data.id);

        // Tentar criar segunda etapa com mesma ordem
        try {
            await axios.post(`${BASE_URL}/etapas`, {
                nome: "Segunda Etapa",
                ordem: 3,
                id_board: boardId
            });
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe("Já existe uma etapa com esta ordem neste board");
        }
    });



    it("Não aceitar campos extras na criação", async () => {
        const etapaComCamposExtras = {
            nome: "Etapa Teste",
            ordem: 6,
            id_board: boardId,
            campoExtra: "não permitido"
        };

        try {
            await axios.post(`${BASE_URL}/etapas`, etapaComCamposExtras);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe("Dados inválidos");
            expect(error.response.data.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        message: "Campos não permitidos foram enviados"
                    })
                ])
            );
        }
    });
});

describe('Validação de Dados - Etapa', () => {
    describe('Validação para criar etapa', () => {
        it('Aceitar dados válidos', async () => {
            const dadosValidos = {
                nome: 'Etapa Teste',
                ordem: 1,
                id_board: '550e8400-e29b-41d4-a716-446655440000'
            };

            const resultado = await createEtapaSchema.validate(dadosValidos);
            expect(resultado).toEqual(dadosValidos);
        });

        it('Rejeitar quando nome não for enviado', async () => {
            const dadosInvalidos = { 
                ordem: 1,
                id_board: '550e8400-e29b-41d4-a716-446655440000'
            };

            await expect(createEtapaSchema.validate(dadosInvalidos))
                .rejects.toThrow('Nome é obrigatório');
        });

        it('Rejeitar nome com 1 caractere', async () => {
            const dadosInvalidos = { 
                nome: 'A',
                ordem: 1,
                id_board: '550e8400-e29b-41d4-a716-446655440000'
            };

            await expect(createEtapaSchema.validate(dadosInvalidos))
                .rejects.toThrow('Nome deve ter pelo menos 2 caracteres');
        });

        it('Rejeitar quando ordem não for enviada', async () => {
            const dadosInvalidos = {
                nome: 'Etapa Teste',
                id_board: '550e8400-e29b-41d4-a716-446655440000'
            };

            await expect(createEtapaSchema.validate(dadosInvalidos))
                .rejects.toThrow('Ordem é obrigatória');
        });

        it('Rejeitar ordem menor que 1', async () => {
            const dadosInvalidos = {
                nome: 'Etapa Teste',
                ordem: 0,
                id_board: '550e8400-e29b-41d4-a716-446655440000'
            };

            await expect(createEtapaSchema.validate(dadosInvalidos))
                .rejects.toThrow('Ordem deve ser maior que 0');
        });

        it('Rejeitar quando id_board não for enviado', async () => {
            const dadosInvalidos = {
                nome: 'Etapa Teste',
                ordem: 1
            };

            await expect(createEtapaSchema.validate(dadosInvalidos))
                .rejects.toThrow('ID do board é obrigatório');
        });

        it('Rejeitar id_board inválido', async () => {
            const dadosInvalidos = {
                nome: 'Etapa Teste',
                ordem: 1,
                id_board: 'uuid-invalido'
            };

            await expect(createEtapaSchema.validate(dadosInvalidos))
                .rejects.toThrow('ID do board deve ser um UUID válido');
        });

        it('Rejeitar campos extras', async () => {
            const dadosInvalidos = {
                nome: 'Etapa Teste',
                ordem: 1,
                id_board: '550e8400-e29b-41d4-a716-446655440000',
                campoExtra: 'não permitido'
            };

            await expect(createEtapaSchema.validate(dadosInvalidos, { stripUnknown: false }))
                .rejects.toThrow('Campos não permitidos foram enviados');
        });
    });
});