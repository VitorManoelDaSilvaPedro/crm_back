import axios from "axios";
import server from "../../server";
import { DatabaseFactory } from "../factories/DatabaseFactory";
import {
  createDepartamentoSchema,
  updateDepartamentoSchema,
  departamentoIdSchema,
  listDepartamentosQuerySchema
} from '../controllers/schemas/departamentoSchema';

const BASE_URL = "http://localhost:4000";

describe("Testes da API de Departamentos", () => {
    let departamentoId: string;
    let createdDepartmentIds: string[] = [];

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
    }, 10000);

    afterAll(async () => {
        // Limpar dados de teste criados
        const prisma = DatabaseFactory.getInstance();
        try {
            if (createdDepartmentIds.length > 0) {
                await prisma.departamento.deleteMany({
                    where: {
                        id: { in: createdDepartmentIds }
                    }
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

    it("Criar departamento com dados válidos", async () => {
        const novoDepartamento = {
            nome: "Recursos Humanos",
            icone: "👥",
            ativo: true
        };

        const response = await axios.post(`${BASE_URL}/departamentos`, novoDepartamento);
        
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty("id");
        expect(response.data.nome).toBe(novoDepartamento.nome);
        expect(response.data.icone).toBe(novoDepartamento.icone);
        expect(response.data.ativo).toBe(true);
        expect(response.data).toHaveProperty("created_at");
        expect(response.data).toHaveProperty("updated_at");

        departamentoId = response.data.id;
        createdDepartmentIds.push(departamentoId);
    });

    it("Não criar departamento sem nome obrigatório", async () => {
        const departamentoInvalido = {
            icone: "💼",
            ativo: true
        };

        try {
            await axios.post(`${BASE_URL}/departamentos`, departamentoInvalido);
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
        const departamentoComCamposExtras = {
            nome: "Departamento Teste",
            ativo: true,
            campoExtra: "não permitido",
            outroExtra: 123
        };

        try {
            await axios.post(`${BASE_URL}/departamentos`, departamentoComCamposExtras);
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

    it("Não aceitar nome com menos de 2 caracteres", async () => {
        const departamentoNomeCurto = {
            nome: "A",
            ativo: true
        };

        try {
            await axios.post(`${BASE_URL}/departamentos`, departamentoNomeCurto);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
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

    it("Não criar departamento sem campo ativo", async () => {
        const departamentoSemAtivo = {
            nome: "Departamento Teste"
        };

        try {
            await axios.post(`${BASE_URL}/departamentos`, departamentoSemAtivo);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
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

    it("Listar todos os departamentos", async () => {
        const response = await axios.get(`${BASE_URL}/departamentos`);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
    });

    it("Filtrar apenas departamentos ativos", async () => {
        const response = await axios.get(`${BASE_URL}/departamentos?ativo=true`);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        response.data.forEach((dept: any) => {
            expect(dept.ativo).toBe(true);
        });
    });

    it("Não aceitar valor inválido no filtro ativo", async () => {
        try {
            await axios.get(`${BASE_URL}/departamentos?ativo=invalido`);
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

    it("Não aceitar parâmetros extras na consulta", async () => {
        try {
            await axios.get(`${BASE_URL}/departamentos?ativo=true&extra=nao-permitido`);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        message: "Parâmetros de consulta não permitidos foram enviados"
                    })
                ])
            );
        }
    });

    it("Buscar departamento por ID válido", async () => {
        const response = await axios.get(`${BASE_URL}/departamentos/${departamentoId}`);
        
        expect(response.status).toBe(200);
        expect(response.data.id).toBe(departamentoId);
        expect(response.data).toHaveProperty("nome");
        expect(response.data).toHaveProperty("ativo");
    });

    it("Não aceitar ID que não seja UUID", async () => {
        try {
            await axios.get(`${BASE_URL}/departamentos/id-invalido`);
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

    it("Atualizar departamento existente", async () => {
        const dadosAtualizacao = {
            nome: "Recursos Humanos Atualizado",
            icone: "🏢",
            ativo: true
        };

        const response = await axios.put(`${BASE_URL}/departamentos/${departamentoId}`, dadosAtualizacao);
        
        expect(response.status).toBe(200);
        expect(response.data.id).toBe(departamentoId);
        expect(response.data.nome).toBe(dadosAtualizacao.nome);
        expect(response.data.icone).toBe(dadosAtualizacao.icone);
        expect(response.data.updated_at).not.toBe(response.data.created_at);
    });

    it("Não atualizar departamento que não existe", async () => {
        const dadosAtualizacao = {
            nome: "Departamento Teste",
            ativo: true
        };

        try {
            await axios.put(`${BASE_URL}/departamentos/123e4567-e89b-12d3-a456-426614174000`, dadosAtualizacao);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
        }
    });

    it("Não atualizar com dados inválidos", async () => {
        const dadosInvalidos = {
            nome: "A",
            ativo: "string-invalida",
            campoExtra: "não permitido"
        };

        try {
            await axios.put(`${BASE_URL}/departamentos/${departamentoId}`, dadosInvalidos);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe("Dados inválidos");
            expect(error.response.data.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "nome",
                        message: "Nome deve ter pelo menos 2 caracteres"
                    }),
                    expect.objectContaining({
                        message: "Campos não permitidos foram enviados"
                    })
                ])
            );
        }
    });

    it("Desativar departamento existente", async () => {
        const response = await axios.delete(`${BASE_URL}/departamentos/${departamentoId}`);
        
        expect(response.status).toBe(200);
        expect(response.data.message).toContain("desativado");
    });

    it("Confirmar que departamento foi desativado", async () => {
        const response = await axios.get(`${BASE_URL}/departamentos/${departamentoId}`);
        
        expect(response.status).toBe(200);
        expect(response.data.ativo).toBe(false);
    });

    it("Não deletar com ID inválido", async () => {
        try {
            await axios.delete(`${BASE_URL}/departamentos/id-invalido`);
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
});

describe('Validação de Dados - Departamento', () => {
  
  describe('Validação para criar departamento', () => {
    it('Aceitar dados válidos', async () => {
      const dadosValidos = {
        nome: 'Recursos Humanos',
        icone: '👥',
        ativo: true
      };

      const resultado = await createDepartamentoSchema.validate(dadosValidos);
      expect(resultado).toEqual(dadosValidos);
    });

    it('Rejeitar quando nome não for enviado', async () => {
      const dadosInvalidos = { ativo: true };

      await expect(createDepartamentoSchema.validate(dadosInvalidos))
        .rejects.toThrow('Nome é obrigatório');
    });

    it('Rejeitar nome com 1 caractere', async () => {
      const dadosInvalidos = { nome: 'A', ativo: true };

      await expect(createDepartamentoSchema.validate(dadosInvalidos))
        .rejects.toThrow('Nome deve ter pelo menos 2 caracteres');
    });

    it('Rejeitar quando ativo não for enviado', async () => {
      const dadosInvalidos = { nome: 'Teste' };

      await expect(createDepartamentoSchema.validate(dadosInvalidos))
        .rejects.toThrow('Status ativo é obrigatório');
    });

    it('Rejeitar campos que não existem no schema', async () => {
      const dadosInvalidos = {
        nome: 'Teste',
        ativo: true,
        campoExtra: 'não permitido'
      };

      await expect(createDepartamentoSchema.validate(dadosInvalidos, { stripUnknown: false }))
        .rejects.toThrow('Campos não permitidos foram enviados');
    });
  });

  describe('Validação para atualizar departamento', () => {
    it('Aceitar dados válidos para atualização', async () => {
      const dadosValidos = {
        nome: 'Nome Atualizado',
        ativo: false
      };

      const resultado = await updateDepartamentoSchema.validate(dadosValidos);
      expect(resultado).toEqual(dadosValidos);
    });

    it('Aceitar atualização sem nenhum campo', async () => {
      const dadosVazios = {};

      const resultado = await updateDepartamentoSchema.validate(dadosVazios);
      expect(resultado).toEqual(dadosVazios);
    });

    it('Rejeitar campos extras na atualização', async () => {
      const dadosInvalidos = {
        nome: 'Teste',
        campoExtra: 'não permitido'
      };

      await expect(updateDepartamentoSchema.validate(dadosInvalidos, { stripUnknown: false }))
        .rejects.toThrow('Campos não permitidos foram enviados');
    });
  });

  describe('Validação de ID do departamento', () => {
    it('Aceitar ID no formato UUID válido', async () => {
      const idValido = { id: '123e4567-e89b-12d3-a456-426614174000' };

      const resultado = await departamentoIdSchema.validate(idValido);
      expect(resultado).toEqual(idValido);
    });

    it('Rejeitar ID que não é UUID', async () => {
      const idInvalido = { id: 'id-invalido' };

      await expect(departamentoIdSchema.validate(idInvalido))
        .rejects.toThrow('ID deve ser um UUID válido');
    });

    it('Rejeitar quando ID não for enviado', async () => {
      const dadosVazios = {};

      await expect(departamentoIdSchema.validate(dadosVazios))
        .rejects.toThrow('ID é obrigatório');
    });
  });

  describe('Validação de filtros na listagem', () => {
    it('Aceitar listagem sem filtros', async () => {
      const queryVazia = {};

      const resultado = await listDepartamentosQuerySchema.validate(queryVazia);
      expect(resultado).toEqual(queryVazia);
    });

    it('Aceitar filtro ativo=true', async () => {
      const queryValida = { ativo: 'true' };

      const resultado = await listDepartamentosQuerySchema.validate(queryValida);
      expect(resultado).toEqual(queryValida);
    });

    it('Aceitar filtro ativo=false', async () => {
      const queryValida = { ativo: 'false' };

      const resultado = await listDepartamentosQuerySchema.validate(queryValida);
      expect(resultado).toEqual(queryValida);
    });

    it('Rejeitar valor diferente de true/false no filtro ativo', async () => {
      const queryInvalida = { ativo: 'invalido' };

      await expect(listDepartamentosQuerySchema.validate(queryInvalida))
        .rejects.toThrow('Parâmetro ativo deve ser "true" ou "false"');
    });

    it('Rejeitar filtros que não existem', async () => {
      const queryInvalida = { 
        ativo: 'true',
        extra: 'não permitido'
      };

      await expect(listDepartamentosQuerySchema.validate(queryInvalida, { stripUnknown: false }))
        .rejects.toThrow('Parâmetros de consulta não permitidos foram enviados');
    });
  });
});