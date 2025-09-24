import axios from "axios";
import server from "../../server";
import { DatabaseFactory } from "../factories/DatabaseFactory";
import { createBoardSchema, updateBoardSchema, updateBoardStatusSchema, listBoardsQuerySchema } from '../controllers/schemas/boardSchema';
import { JwtService } from '../services/JwtService';

const BASE_URL = "http://localhost:4000";

describe("Testes da API de Boards", () => {
    let boardId: string;
    let adminToken: string;
    let userToken: string;
    let createdBoardIds: string[] = [];

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

        // Gerar tokens para testes
        adminToken = JwtService.generateTokens({
            userId: 'admin-test-id',
            email: 'admin@test.com',
            nivel: 'admin'
        }).accessToken;

        userToken = JwtService.generateTokens({
            userId: 'user-test-id',
            email: 'user@test.com',
            nivel: 'user'
        }).accessToken;
    }, 30000);

    afterAll(async () => {
        // Limpar boards criados durante os testes
        const prisma = DatabaseFactory.getInstance();
        if (createdBoardIds.length > 0) {
            await prisma.board.deleteMany({
                where: {
                    id: {
                        in: createdBoardIds
                    }
                }
            });
        }
        await new Promise<void>((resolve) => {
            server.close(() => {
                resolve();
            });
        });
        await DatabaseFactory.disconnect();
    }, 30000);

    it("Criar board com dados válidos (admin)", async () => {
        const novoBoard = {
            nome: "Pipeline Vendas",
            ativo: true
        };

        const response = await axios.post(`${BASE_URL}/boards`, novoBoard, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty("id");
        expect(response.data.nome).toBe(novoBoard.nome);
        expect(response.data.ativo).toBe(true);
        expect(response.data).toHaveProperty("created_at");
        expect(response.data).toHaveProperty("updated_at");

        boardId = response.data.id;
        createdBoardIds.push(boardId);
    });

    it("Não criar board sem nome obrigatório", async () => {
        const boardInvalido = {
            ativo: true
        };

        try {
            await axios.post(`${BASE_URL}/boards`, boardInvalido, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
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

    it("Não aceitar campos extras na criação", async () => {
        const boardComCamposExtras = {
            nome: "Board Teste",
            ativo: true,
            campoExtra: "não permitido"
        };

        try {
            await axios.post(`${BASE_URL}/boards`, boardComCamposExtras, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
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

    it("Usuário não-admin não deve criar board", async () => {
        const novoBoard = {
            nome: "Board Teste",
            ativo: true
        };

        try {
            await axios.post(`${BASE_URL}/boards`, novoBoard, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
        } catch (error: any) {
            expect(error.response.status).toBe(403);
            expect(error.response.data.message).toBe('Acesso negado. Apenas administradores podem acessar esta rota.');
        }
    });

    it("Deve retornar 401 sem token de autorização", async () => {
        const novoBoard = {
            nome: "Board Teste",
            ativo: true
        };

        try {
            await axios.post(`${BASE_URL}/boards`, novoBoard);
        } catch (error: any) {
            expect(error.response.status).toBe(401);
        }
    });

    it("Atualizar board com dados válidos (admin)", async () => {
        const dadosAtualizacao = {
            nome: "Pipeline Vendas Atualizado"
        };

        const response = await axios.put(`${BASE_URL}/boards/${boardId}`, dadosAtualizacao, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        expect(response.status).toBe(200);
        expect(response.data.id).toBe(boardId);
        expect(response.data.nome).toBe(dadosAtualizacao.nome);
        expect(response.data.ativo).toBe(true);
        expect(response.data.updated_at).not.toBe(response.data.created_at);
    });

    it("Não atualizar board que não existe", async () => {
        const dadosAtualizacao = {
            nome: "Board Teste"
        };

        try {
            await axios.put(`${BASE_URL}/boards/123e4567-e89b-12d3-a456-426614174000`, dadosAtualizacao, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
        } catch (error: any) {
            expect(error.response.status).toBe(404);
            expect(error.response.data.message).toBe('Board não encontrado');
        }
    });

    it("Não atualizar board com nome inválido", async () => {
        const dadosInvalidos = {
            nome: "A"
        };

        try {
            await axios.put(`${BASE_URL}/boards/${boardId}`, dadosInvalidos, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe("Dados inválidos");
            expect(error.response.data.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "nome",
                        message: "Nome deve ter pelo menos 2 caracteres"
                    })
                ])
            );
        }
    });

    it("Não aceitar campos extras na atualização", async () => {
        const dadosInvalidos = {
            nome: "Board Teste",
            campoExtra: "não permitido"
        };

        try {
            await axios.put(`${BASE_URL}/boards/${boardId}`, dadosInvalidos, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
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

    it("Usuário não-admin não deve atualizar board", async () => {
        const dadosAtualizacao = {
            nome: "Board Teste"
        };

        try {
            await axios.put(`${BASE_URL}/boards/${boardId}`, dadosAtualizacao, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
        } catch (error: any) {
            expect(error.response.status).toBe(403);
            expect(error.response.data.message).toBe('Acesso negado. Apenas administradores podem acessar esta rota.');
        }
    });

    it("Não atualizar com ID inválido", async () => {
        const dadosAtualizacao = {
            nome: "Board Teste"
        };

        try {
            await axios.put(`${BASE_URL}/boards/id-invalido`, dadosAtualizacao, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe("Dados inválidos");
            expect(error.response.data.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "id",
                        message: "ID deve ser um UUID válido"
                    })
                ])
            );
        }
    });

    it("Alterar status do board para inativo (admin)", async () => {
        const dadosStatus = {
            ativo: false
        };

        const response = await axios.patch(`${BASE_URL}/boards/${boardId}/status`, dadosStatus, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        expect(response.status).toBe(200);
        expect(response.data.id).toBe(boardId);
        expect(response.data.ativo).toBe(false);
        expect(response.data.updated_at).not.toBe(response.data.created_at);
    });

    it("Alterar status do board para ativo (admin)", async () => {
        const dadosStatus = {
            ativo: true
        };

        const response = await axios.patch(`${BASE_URL}/boards/${boardId}/status`, dadosStatus, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        expect(response.status).toBe(200);
        expect(response.data.id).toBe(boardId);
        expect(response.data.ativo).toBe(true);
    });

    it("Não alterar status de board que não existe", async () => {
        const dadosStatus = {
            ativo: false
        };

        try {
            await axios.patch(`${BASE_URL}/boards/123e4567-e89b-12d3-a456-426614174000/status`, dadosStatus, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
        } catch (error: any) {
            expect(error.response.status).toBe(404);
            expect(error.response.data.message).toBe('Board não encontrado');
        }
    });

    it("Não alterar status sem campo ativo obrigatório", async () => {
        const dadosInvalidos = {};

        try {
            await axios.patch(`${BASE_URL}/boards/${boardId}/status`, dadosInvalidos, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe("Dados inválidos");
            expect(error.response.data.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "ativo",
                        message: "Status ativo é obrigatório"
                    })
                ])
            );
        }
    });

    it("Aceitar campos extras na alteração de status (ignorados)", async () => {
        const dadosComExtras = {
            ativo: true,
            campoExtra: "ignorado"
        };

        const response = await axios.patch(`${BASE_URL}/boards/${boardId}/status`, dadosComExtras, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        expect(response.status).toBe(200);
        expect(response.data.ativo).toBe(true);
    });

    it("Usuário não-admin não deve alterar status do board", async () => {
        const dadosStatus = {
            ativo: false
        };

        try {
            await axios.patch(`${BASE_URL}/boards/${boardId}/status`, dadosStatus, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
        } catch (error: any) {
            expect(error.response.status).toBe(403);
            expect(error.response.data.message).toBe('Acesso negado. Apenas administradores podem acessar esta rota.');
        }
    });

    it("Não alterar status com ID inválido", async () => {
        const dadosStatus = {
            ativo: false
        };

        try {
            await axios.patch(`${BASE_URL}/boards/id-invalido/status`, dadosStatus, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe("Dados inválidos");
            expect(error.response.data.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "id",
                        message: "ID deve ser um UUID válido"
                    })
                ])
            );
        }
    });

    it("Listar todos os boards (admin)", async () => {
        const response = await axios.get(`${BASE_URL}/boards`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
        expect(response.data[0]).toHaveProperty('id');
        expect(response.data[0]).toHaveProperty('nome');
        expect(response.data[0]).toHaveProperty('ativo');
    });

    it("Filtrar apenas boards ativos", async () => {
        const response = await axios.get(`${BASE_URL}/boards?ativo=true`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        response.data.forEach((board: any) => {
            expect(board.ativo).toBe(true);
        });
    });

    it("Filtrar apenas boards inativos", async () => {
        const response = await axios.get(`${BASE_URL}/boards?ativo=false`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
    });

    it("Não aceitar valor inválido no filtro ativo", async () => {
        try {
            await axios.get(`${BASE_URL}/boards?ativo=invalido`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe("Parâmetros inválidos");
            expect(error.response.data.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "ativo",
                        message: 'Parâmetro ativo deve ser "true" ou "false"'
                    })
                ])
            );
        }
    });

    it("Aceitar parâmetros extras na consulta (ignorados)", async () => {
        const response = await axios.get(`${BASE_URL}/boards?ativo=true&extra=ignorado`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
    });

    it("Usuário não-admin não deve listar boards", async () => {
        try {
            await axios.get(`${BASE_URL}/boards`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
        } catch (error: any) {
            expect(error.response.status).toBe(403);
            expect(error.response.data.message).toBe('Acesso negado. Apenas administradores podem acessar esta rota.');
        }
    });

    it("Buscar board por ID válido (admin)", async () => {
        const response = await axios.get(`${BASE_URL}/boards/${boardId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        expect(response.status).toBe(200);
        expect(response.data.id).toBe(boardId);
        expect(response.data).toHaveProperty('nome');
        expect(response.data).toHaveProperty('ativo');
        expect(response.data).toHaveProperty('created_at');
        expect(response.data).toHaveProperty('updated_at');
    });

    it("Não encontrar board que não existe", async () => {
        try {
            await axios.get(`${BASE_URL}/boards/123e4567-e89b-12d3-a456-426614174000`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
        } catch (error: any) {
            expect(error.response.status).toBe(404);
            expect(error.response.data.message).toBe('Board não encontrado');
        }
    });

    it("Não aceitar ID que não seja UUID na busca", async () => {
        try {
            await axios.get(`${BASE_URL}/boards/id-invalido`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe("Parâmetros inválidos");
            expect(error.response.data.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "id",
                        message: "ID deve ser um UUID válido"
                    })
                ])
            );
        }
    });

    it("Usuário não-admin não deve buscar board por ID", async () => {
        try {
            await axios.get(`${BASE_URL}/boards/${boardId}`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
        } catch (error: any) {
            expect(error.response.status).toBe(403);
            expect(error.response.data.message).toBe('Acesso negado. Apenas administradores podem acessar esta rota.');
        }
    });

    it("Desativar board existente (admin)", async () => {
        const response = await axios.delete(`${BASE_URL}/boards/${boardId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        expect(response.status).toBe(200);
        expect(response.data.message).toBe('Board desativado com sucesso');
    });

    it("Confirmar que board foi desativado", async () => {
        const response = await axios.get(`${BASE_URL}/boards/${boardId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        expect(response.status).toBe(200);
        expect(response.data.ativo).toBe(false);
    });

    it("Não desativar board que não existe", async () => {
        try {
            await axios.delete(`${BASE_URL}/boards/123e4567-e89b-12d3-a456-426614174000`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
        } catch (error: any) {
            expect(error.response.status).toBe(404);
            expect(error.response.data.message).toBe('Board não encontrado');
        }
    });

    it("Não desativar com ID inválido", async () => {
        try {
            await axios.delete(`${BASE_URL}/boards/id-invalido`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe("Parâmetros inválidos");
            expect(error.response.data.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "id",
                        message: "ID deve ser um UUID válido"
                    })
                ])
            );
        }
    });

    it("Usuário não-admin não deve desativar board", async () => {
        try {
            await axios.delete(`${BASE_URL}/boards/${boardId}`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
        } catch (error: any) {
            expect(error.response.status).toBe(403);
            expect(error.response.data.message).toBe('Acesso negado. Apenas administradores podem acessar esta rota.');
        }
    });
});

describe('Validação de Dados - Board', () => {
  describe('Validação para criar board', () => {
    it('Aceitar dados válidos', async () => {
      const dadosValidos = {
        nome: 'Pipeline Vendas',
        ativo: true
      };

      const resultado = await createBoardSchema.validate(dadosValidos);
      expect(resultado).toEqual(dadosValidos);
    });

    it('Rejeitar quando nome não for enviado', async () => {
      const dadosInvalidos = { ativo: true };

      await expect(createBoardSchema.validate(dadosInvalidos))
        .rejects.toThrow('Nome é obrigatório');
    });

    it('Rejeitar nome com 1 caractere', async () => {
      const dadosInvalidos = { nome: 'A', ativo: true };

      await expect(createBoardSchema.validate(dadosInvalidos))
        .rejects.toThrow('Nome deve ter pelo menos 2 caracteres');
    });
  });

  describe('Validação para atualizar board', () => {
    it('Aceitar dados válidos para atualização', async () => {
      const dadosValidos = {
        nome: 'Pipeline Atualizado'
      };

      const resultado = await updateBoardSchema.validate(dadosValidos);
      expect(resultado).toEqual(dadosValidos);
    });

    it('Rejeitar quando nome não for enviado na atualização', async () => {
      const dadosInvalidos = {};

      await expect(updateBoardSchema.validate(dadosInvalidos))
        .rejects.toThrow('Nome é obrigatório');
    });

    it('Rejeitar campos extras na atualização', async () => {
      const dadosInvalidos = {
        nome: 'Teste',
        campoExtra: 'não permitido'
      };

      await expect(updateBoardSchema.validate(dadosInvalidos, { stripUnknown: false }))
        .rejects.toThrow('Campos não permitidos foram enviados');
    });
  });

  describe('Validação para alterar status do board', () => {
    it('Aceitar dados válidos para alteração de status', async () => {
      const dadosValidos = {
        ativo: false
      };

      const resultado = await updateBoardStatusSchema.validate(dadosValidos);
      expect(resultado).toEqual(dadosValidos);
    });

    it('Rejeitar quando status ativo não for enviado', async () => {
      const dadosInvalidos = {};

      await expect(updateBoardStatusSchema.validate(dadosInvalidos))
        .rejects.toThrow('Status ativo é obrigatório');
    });

    it('Rejeitar campos extras na alteração de status', async () => {
      const dadosInvalidos = {
        ativo: true,
        campoExtra: 'não permitido'
      };

      await expect(updateBoardStatusSchema.validate(dadosInvalidos, { stripUnknown: false }))
        .rejects.toThrow('Campos não permitidos foram enviados');
    });
  });

  describe('Validação para listar boards', () => {
    it('Aceitar listagem sem filtros', async () => {
      const queryVazia = {};

      const resultado = await listBoardsQuerySchema.validate(queryVazia);
      expect(resultado).toEqual(queryVazia);
    });

    it('Aceitar filtro ativo=true', async () => {
      const queryValida = { ativo: 'true' };

      const resultado = await listBoardsQuerySchema.validate(queryValida);
      expect(resultado).toEqual(queryValida);
    });

    it('Aceitar filtro ativo=false', async () => {
      const queryValida = { ativo: 'false' };

      const resultado = await listBoardsQuerySchema.validate(queryValida);
      expect(resultado).toEqual(queryValida);
    });

    it('Rejeitar valor diferente de true/false no filtro ativo', async () => {
      const queryInvalida = { ativo: 'invalido' };

      await expect(listBoardsQuerySchema.validate(queryInvalida))
        .rejects.toThrow('Parâmetro ativo deve ser "true" ou "false"');
    });

    it('Rejeitar filtros que não existem', async () => {
      const queryInvalida = { 
        ativo: 'true',
        extra: 'não permitido'
      };

      await expect(listBoardsQuerySchema.validate(queryInvalida, { stripUnknown: false }))
        .rejects.toThrow('Parâmetros de consulta não permitidos foram enviados');
    });
  });
});