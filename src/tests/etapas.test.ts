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
            if (boardId) {
                await prisma.board.delete({
                    where: { id: boardId }
                });
            }
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

    it("Listar etapas de um board", async () => {
        const response = await axios.get(`${BASE_URL}/etapas?id_board=${boardId}`);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
    });

    it("Não listar etapas sem id_board", async () => {
        try {
            await axios.get(`${BASE_URL}/etapas`);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe('Parâmetros inválidos');
        }
    });

    it("Não listar etapas de board inexistente", async () => {
        try {
            await axios.get(`${BASE_URL}/etapas?id_board=550e8400-e29b-41d4-a716-446655440000`);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
            expect(error.response.data.message).toBe('Board não encontrado');
        }
    });

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



    it("Atualizar etapa com dados válidos", async () => {
        const dadosAtualizacao = {
            nome: "Etapa Atualizada"
        };

        const response = await axios.put(`${BASE_URL}/etapas/${etapaId}`, dadosAtualizacao);
        
        expect(response.status).toBe(200);
        expect(response.data.id).toBe(etapaId);
        expect(response.data.nome).toBe(dadosAtualizacao.nome);
        expect(response.data.updated_at).not.toBe(response.data.created_at);
    });

    it("Não atualizar etapa que não existe", async () => {
        const dadosAtualizacao = {
            nome: "Etapa Teste"
        };

        try {
            await axios.put(`${BASE_URL}/etapas/123e4567-e89b-12d3-a456-426614174000`, dadosAtualizacao);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
            expect(error.response.data.message).toBe('Etapa não encontrada');
        }
    });

    it("Desativar etapa existente", async () => {
        const response = await axios.delete(`${BASE_URL}/etapas/${etapaId}`);
        
        expect(response.status).toBe(200);
        expect(response.data.message).toBe('Etapa desativada com sucesso');
    });

    it("Listar deve incluir etapas desativadas", async () => {
        const response = await axios.get(`${BASE_URL}/etapas?id_board=${boardId}`);
        
        expect(response.status).toBe(200);
        const etapaDesativada = response.data.find((e: any) => e.id === etapaId);
        expect(etapaDesativada).toBeDefined();
        expect(etapaDesativada.ativo).toBe(false);
    });

    it("Reativar etapa existente", async () => {
        const response = await axios.patch(`${BASE_URL}/etapas/${etapaId}/reativar`);
        
        expect(response.status).toBe(200);
        expect(response.data.message).toBe('Etapa reativada com sucesso');
    });

    it("Não reativar etapa que não existe", async () => {
        try {
            await axios.patch(`${BASE_URL}/etapas/123e4567-e89b-12d3-a456-426614174000/reativar`);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
            expect(error.response.data.message).toBe('Etapa não encontrada');
        }
    });

    it("Não desativar etapa que não existe", async () => {
        try {
            await axios.delete(`${BASE_URL}/etapas/123e4567-e89b-12d3-a456-426614174000`);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
            expect(error.response.data.message).toBe('Etapa não encontrada');
        }
    });

    it("Reordenar etapa para cima", async () => {
        // Criar etapas para testar reordenamento
        const etapa1 = await axios.post(`${BASE_URL}/etapas`, {
            nome: "Etapa Ordem 1",
            ordem: 20,
            id_board: boardId
        });
        const etapa2 = await axios.post(`${BASE_URL}/etapas`, {
            nome: "Etapa Ordem 2",
            ordem: 21,
            id_board: boardId
        });
        const etapa3 = await axios.post(`${BASE_URL}/etapas`, {
            nome: "Etapa Ordem 3",
            ordem: 22,
            id_board: boardId
        });
        
        createdEtapaIds.push(etapa1.data.id, etapa2.data.id, etapa3.data.id);

        // Mover etapa3 (ordem 22) para ordem 20
        const response = await axios.patch(`${BASE_URL}/etapas/${etapa3.data.id}/reordenar`, {
            ordem: 20
        });

        expect(response.status).toBe(200);
        expect(response.data.message).toBe('Etapa reordenada com sucesso');
        expect(response.data.etapas).toBeDefined();
        
        const etapaMovida = response.data.etapas.find((e: any) => e.id === etapa3.data.id);
        expect(etapaMovida.ordem).toBe(20);
    });

    it("Reordenar etapa para baixo", async () => {
        const etapas = await axios.get(`${BASE_URL}/etapas?id_board=${boardId}`);
        const primeiraEtapa = etapas.data.find((e: any) => e.ordem === 20);

        // Mover primeira etapa para ordem 22
        const response = await axios.patch(`${BASE_URL}/etapas/${primeiraEtapa.id}/reordenar`, {
            ordem: 22
        });

        expect(response.status).toBe(200);
        const etapaMovida = response.data.etapas.find((e: any) => e.id === primeiraEtapa.id);
        expect(etapaMovida.ordem).toBe(22);
    });

    it("Não reordenar com ordem inválida", async () => {
        try {
            await axios.patch(`${BASE_URL}/etapas/${etapaId}/reordenar`, {
                ordem: 0
            });
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe('Dados inválidos');
        }
    });

    it("Criar etapa com ordem existente deve reordenar automaticamente", async () => {
        const etapasAntes = await axios.get(`${BASE_URL}/etapas?id_board=${boardId}`);
        const quantidadeAntes = etapasAntes.data.length;

        // Criar etapa com ordem que já existe
        const novaEtapa = await axios.post(`${BASE_URL}/etapas`, {
            nome: "Etapa Inserida",
            ordem: 21,
            id_board: boardId
        });
        
        createdEtapaIds.push(novaEtapa.data.id);

        const etapasDepois = await axios.get(`${BASE_URL}/etapas?id_board=${boardId}`);
        expect(etapasDepois.data.length).toBe(quantidadeAntes + 1);
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