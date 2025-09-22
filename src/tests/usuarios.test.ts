import axios from "axios";
import server from "../../server";
import { DatabaseFactory } from "../factories/DatabaseFactory";
import {
  createUsuarioSchema,
  updateUsuarioSchema,
  usuarioIdSchema,
  loginUsuarioSchema
} from '../controllers/schemas/usuarioSchema';

const BASE_URL = "http://localhost:4000";

describe("Testes da API de Usuários", () => {
    let usuarioId: string;
    let departamentoId: string;

    beforeAll(async () => {
        await DatabaseFactory.connect();
        
        // Obter um departamento existente para usar nos testes
        const departamentoResponse = await axios.get(`${BASE_URL}/departamentos`);
        if (departamentoResponse.data.length > 0) {
            departamentoId = departamentoResponse.data[0].id;
        } else {
            // Criar um departamento se não existir nenhum
            const novoDepartamento = {
                nome: "Departamento Teste",
                ativo: true
            };
            const createResponse = await axios.post(`${BASE_URL}/departamentos`, novoDepartamento);
            departamentoId = createResponse.data.id;
        }
        
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
        await new Promise<void>((resolve) => {
            server.close(() => {
                resolve();
            });
        });
        await DatabaseFactory.disconnect();
    }, 10000);

    it("Criar usuário com dados válidos", async () => {
        const novoUsuario = {
            nome: "João Silva",
            email: "joao.silva@email.com",
            celular: "(11) 99999-9999",
            senha: "123456",
            nivel: "user",
            id_departamento: departamentoId
        };

        const response = await axios.post(`${BASE_URL}/usuarios`, novoUsuario);
        
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty("id");
        expect(response.data.nome).toBe(novoUsuario.nome);
        expect(response.data.email).toBe(novoUsuario.email);
        expect(response.data.celular).toBe(novoUsuario.celular);
        expect(response.data.nivel).toBe(novoUsuario.nivel);
        expect(response.data).toHaveProperty("created_at");
        expect(response.data).toHaveProperty("updated_at");
        expect(response.data).not.toHaveProperty("senha");

        usuarioId = response.data.id;
    });

    it("Não criar usuário sem nome obrigatório", async () => {
        const usuarioInvalido = {
            email: "teste@email.com",
            celular: "(11) 99999-9999",
            senha: "123456",
            nivel: "user",
            id_departamento: departamentoId
        };

        try {
            await axios.post(`${BASE_URL}/usuarios`, usuarioInvalido);
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

    it("Não criar usuário sem email obrigatório", async () => {
        const usuarioInvalido = {
            nome: "João Silva",
            celular: "(11) 99999-9999",
            senha: "123456",
            nivel: "user",
            id_departamento: departamentoId
        };

        try {
            await axios.post(`${BASE_URL}/usuarios`, usuarioInvalido);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "email",
                        message: "Email é obrigatório"
                    })
                ])
            );
        }
    });

    it("Não aceitar email com formato inválido", async () => {
        const usuarioInvalido = {
            nome: "João Silva",
            email: "email-invalido",
            celular: "(11) 99999-9999",
            senha: "123456",
            nivel: "user",
            id_departamento: departamentoId
        };

        try {
            await axios.post(`${BASE_URL}/usuarios`, usuarioInvalido);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "email",
                        message: "Email deve ter um formato válido"
                    })
                ])
            );
        }
    });

    it("Não aceitar celular com formato inválido", async () => {
        const usuarioInvalido = {
            nome: "João Silva",
            email: "joao@email.com",
            celular: "11999999999",
            senha: "123456",
            nivel: "user",
            id_departamento: departamentoId
        };

        try {
            await axios.post(`${BASE_URL}/usuarios`, usuarioInvalido);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "celular",
                        message: "Celular deve estar no formato (XX) XXXXX-XXXX"
                    })
                ])
            );
        }
    });

    it("Não aceitar senha com menos de 6 caracteres", async () => {
        const usuarioInvalido = {
            nome: "João Silva",
            email: "joao@email.com",
            celular: "(11) 99999-9999",
            senha: "123",
            nivel: "user",
            id_departamento: departamentoId
        };

        try {
            await axios.post(`${BASE_URL}/usuarios`, usuarioInvalido);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "senha",
                        message: "Senha deve ter pelo menos 6 caracteres"
                    })
                ])
            );
        }
    });

    it("Não aceitar nível inválido", async () => {
        const usuarioInvalido = {
            nome: "João Silva",
            email: "joao@email.com",
            celular: "(11) 99999-9999",
            senha: "123456",
            nivel: "invalid",
            id_departamento: departamentoId
        };

        try {
            await axios.post(`${BASE_URL}/usuarios`, usuarioInvalido);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: "nivel",
                        message: "Nível deve ser admin ou user"
                    })
                ])
            );
        }
    });

    it("Não aceitar campos extras na criação", async () => {
        const usuarioComCamposExtras = {
            nome: "João Silva",
            email: "joao@email.com",
            celular: "(11) 99999-9999",
            senha: "123456",
            nivel: "user",
            id_departamento: departamentoId,
            campoExtra: "não permitido"
        };

        try {
            await axios.post(`${BASE_URL}/usuarios`, usuarioComCamposExtras);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        message: "Campos não permitidos foram enviados"
                    })
                ])
            );
        }
    });

    it("Listar todos os usuários", async () => {
        const response = await axios.get(`${BASE_URL}/usuarios`);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
        
        // Verificar se a senha não é retornada
        response.data.forEach((usuario: any) => {
            expect(usuario).not.toHaveProperty("senha");
        });
    });

    it("Buscar usuário por ID válido", async () => {
        const response = await axios.get(`${BASE_URL}/usuarios/${usuarioId}`);
        
        expect(response.status).toBe(200);
        expect(response.data.id).toBe(usuarioId);
        expect(response.data).toHaveProperty("nome");
        expect(response.data).toHaveProperty("email");
        expect(response.data).not.toHaveProperty("senha");
    });

    it("Não aceitar ID que não seja UUID", async () => {
        try {
            await axios.get(`${BASE_URL}/usuarios/id-invalido`);
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

    it("Retornar 404 para usuário inexistente", async () => {
        try {
            await axios.get(`${BASE_URL}/usuarios/123e4567-e89b-12d3-a456-426614174000`);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
        }
    });

    it("Atualizar usuário existente", async () => {
        const dadosAtualizacao = {
            nome: "João Silva Atualizado",
            celular: "(11) 88888-8888"
        };

        const response = await axios.put(`${BASE_URL}/usuarios/${usuarioId}`, dadosAtualizacao);
        
        expect(response.status).toBe(200);
        expect(response.data.id).toBe(usuarioId);
        expect(response.data.nome).toBe(dadosAtualizacao.nome);
        expect(response.data.celular).toBe(dadosAtualizacao.celular);
        expect(response.data).not.toHaveProperty("senha");
    });

    it("Não atualizar usuário que não existe", async () => {
        const dadosAtualizacao = {
            nome: "Usuário Teste"
        };

        try {
            await axios.put(`${BASE_URL}/usuarios/123e4567-e89b-12d3-a456-426614174000`, dadosAtualizacao);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
        }
    });

    it("Não atualizar com dados inválidos", async () => {
        const dadosInvalidos = {
            nome: "A",
            email: "email-invalido",
            campoExtra: "não permitido"
        };

        try {
            await axios.put(`${BASE_URL}/usuarios/${usuarioId}`, dadosInvalidos);
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
                        field: "email",
                        message: "Email deve ter um formato válido"
                    }),
                    expect.objectContaining({
                        message: "Campos não permitidos foram enviados"
                    })
                ])
            );
        }
    });

    it("Deletar usuário existente", async () => {
        const response = await axios.delete(`${BASE_URL}/usuarios/${usuarioId}`);
        
        expect(response.status).toBe(200);
        expect(response.data.message).toContain("deletado");
    });

    it("Confirmar que usuário foi deletado", async () => {
        try {
            await axios.get(`${BASE_URL}/usuarios/${usuarioId}`);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
        }
    });

    it("Não deletar usuário que não existe", async () => {
        try {
            await axios.delete(`${BASE_URL}/usuarios/123e4567-e89b-12d3-a456-426614174000`);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
        }
    });

    it("Não deletar com ID inválido", async () => {
        try {
            await axios.delete(`${BASE_URL}/usuarios/id-invalido`);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.message).toBe("Parâmetros inválidos");
        }
    });
});

describe('Validação de Dados - Usuário', () => {
  
  describe('Validação para criar usuário', () => {
    it('Aceitar dados válidos', async () => {
      const dadosValidos = {
        nome: 'João Silva',
        email: 'joao@email.com',
        celular: '(11) 99999-9999',
        senha: '123456',
        nivel: 'user',
        id_departamento: '123e4567-e89b-12d3-a456-426614174000'
      };

      const resultado = await createUsuarioSchema.validate(dadosValidos);
      expect(resultado).toEqual(dadosValidos);
    });

    it('Aceitar dados válidos com campos opcionais', async () => {
      const dadosValidos = {
        nome: 'João Silva',
        foto: 'https://exemplo.com/foto.jpg',
        email: 'joao@email.com',
        celular: '(11) 99999-9999',
        senha: '123456',
        nivel: 'admin',
        codigo: 'ABC123',
        id_departamento: '123e4567-e89b-12d3-a456-426614174000'
      };

      const resultado = await createUsuarioSchema.validate(dadosValidos);
      expect(resultado).toEqual(dadosValidos);
    });

    it('Rejeitar quando nome não for enviado', async () => {
      const dadosInvalidos = {
        email: 'joao@email.com',
        celular: '(11) 99999-9999',
        senha: '123456',
        nivel: 'user',
        id_departamento: '123e4567-e89b-12d3-a456-426614174000'
      };

      await expect(createUsuarioSchema.validate(dadosInvalidos))
        .rejects.toThrow('Nome é obrigatório');
    });

    it('Rejeitar nome com 1 caractere', async () => {
      const dadosInvalidos = {
        nome: 'A',
        email: 'joao@email.com',
        celular: '(11) 99999-9999',
        senha: '123456',
        nivel: 'user',
        id_departamento: '123e4567-e89b-12d3-a456-426614174000'
      };

      await expect(createUsuarioSchema.validate(dadosInvalidos))
        .rejects.toThrow('Nome deve ter pelo menos 2 caracteres');
    });

    it('Rejeitar quando email não for enviado', async () => {
      const dadosInvalidos = {
        nome: 'João Silva',
        celular: '(11) 99999-9999',
        senha: '123456',
        nivel: 'user',
        id_departamento: '123e4567-e89b-12d3-a456-426614174000'
      };

      await expect(createUsuarioSchema.validate(dadosInvalidos))
        .rejects.toThrow('Email é obrigatório');
    });

    it('Rejeitar email com formato inválido', async () => {
      const dadosInvalidos = {
        nome: 'João Silva',
        email: 'email-invalido',
        celular: '(11) 99999-9999',
        senha: '123456',
        nivel: 'user',
        id_departamento: '123e4567-e89b-12d3-a456-426614174000'
      };

      await expect(createUsuarioSchema.validate(dadosInvalidos))
        .rejects.toThrow('Email deve ter um formato válido');
    });

    it('Rejeitar celular com formato inválido', async () => {
      const dadosInvalidos = {
        nome: 'João Silva',
        email: 'joao@email.com',
        celular: '11999999999',
        senha: '123456',
        nivel: 'user',
        id_departamento: '123e4567-e89b-12d3-a456-426614174000'
      };

      await expect(createUsuarioSchema.validate(dadosInvalidos))
        .rejects.toThrow('Celular deve estar no formato (XX) XXXXX-XXXX');
    });

    it('Rejeitar senha muito curta', async () => {
      const dadosInvalidos = {
        nome: 'João Silva',
        email: 'joao@email.com',
        celular: '(11) 99999-9999',
        senha: '123',
        nivel: 'user',
        id_departamento: '123e4567-e89b-12d3-a456-426614174000'
      };

      await expect(createUsuarioSchema.validate(dadosInvalidos))
        .rejects.toThrow('Senha deve ter pelo menos 6 caracteres');
    });

    it('Rejeitar nível inválido', async () => {
      const dadosInvalidos = {
        nome: 'João Silva',
        email: 'joao@email.com',
        celular: '(11) 99999-9999',
        senha: '123456',
        nivel: 'invalid',
        id_departamento: '123e4567-e89b-12d3-a456-426614174000'
      };

      await expect(createUsuarioSchema.validate(dadosInvalidos))
        .rejects.toThrow('Nível deve ser admin ou user');
    });

    it('Rejeitar campos que não existem no schema', async () => {
      const dadosInvalidos = {
        nome: 'João Silva',
        email: 'joao@email.com',
        celular: '(11) 99999-9999',
        senha: '123456',
        nivel: 'user',
        id_departamento: '123e4567-e89b-12d3-a456-426614174000',
        campoExtra: 'não permitido'
      };

      await expect(createUsuarioSchema.validate(dadosInvalidos, { stripUnknown: false }))
        .rejects.toThrow('Campos não permitidos foram enviados');
    });

    it('Rejeitar quando id_departamento não for enviado', async () => {
      const dadosInvalidos = {
        nome: 'João Silva',
        email: 'joao@email.com',
        celular: '(11) 99999-9999',
        senha: '123456',
        nivel: 'user'
      };

      await expect(createUsuarioSchema.validate(dadosInvalidos))
        .rejects.toThrow('Departamento é obrigatório');
    });

    it('Rejeitar id_departamento com formato inválido', async () => {
      const dadosInvalidos = {
        nome: 'João Silva',
        email: 'joao@email.com',
        celular: '(11) 99999-9999',
        senha: '123456',
        nivel: 'user',
        id_departamento: 'id-invalido'
      };

      await expect(createUsuarioSchema.validate(dadosInvalidos))
        .rejects.toThrow('ID do departamento deve ser um UUID válido');
    });
  });

  describe('Validação para atualizar usuário', () => {
    it('Aceitar dados válidos para atualização', async () => {
      const dadosValidos = {
        nome: 'Nome Atualizado',
        email: 'novo@email.com'
      };

      const resultado = await updateUsuarioSchema.validate(dadosValidos);
      expect(resultado).toEqual(dadosValidos);
    });

    it('Aceitar atualização sem nenhum campo', async () => {
      const dadosVazios = {};

      const resultado = await updateUsuarioSchema.validate(dadosVazios);
      expect(resultado).toEqual(dadosVazios);
    });

    it('Rejeitar campos extras na atualização', async () => {
      const dadosInvalidos = {
        nome: 'Teste',
        campoExtra: 'não permitido'
      };

      await expect(updateUsuarioSchema.validate(dadosInvalidos, { stripUnknown: false }))
        .rejects.toThrow('Campos não permitidos foram enviados');
    });
  });

  describe('Validação de ID do usuário', () => {
    it('Aceitar ID UUID válido', async () => {
      const idValido = { id: '123e4567-e89b-12d3-a456-426614174000' };

      const resultado = await usuarioIdSchema.validate(idValido);
      expect(resultado).toEqual(idValido);
    });

    it('Rejeitar ID que não é UUID', async () => {
      const idInvalido = { id: 'id-invalido' };

      await expect(usuarioIdSchema.validate(idInvalido))
        .rejects.toThrow('ID deve ser um UUID válido');
    });

    it('Rejeitar ID inválido', async () => {
      const idInvalido = { id: 'not-a-uuid' };

      await expect(usuarioIdSchema.validate(idInvalido))
        .rejects.toThrow('ID deve ser um UUID válido');
    });

    it('Rejeitar quando ID não for enviado', async () => {
      const dadosVazios = {};

      await expect(usuarioIdSchema.validate(dadosVazios))
        .rejects.toThrow('ID é obrigatório');
    });
  });

  describe('Validação de login', () => {
    it('Aceitar credenciais válidas', async () => {
      const credenciaisValidas = {
        email: 'usuario@email.com',
        senha: 'minhasenha'
      };

      const resultado = await loginUsuarioSchema.validate(credenciaisValidas);
      expect(resultado).toEqual(credenciaisValidas);
    });

    it('Rejeitar login sem email', async () => {
      const credenciaisInvalidas = {
        senha: 'minhasenha'
      };

      await expect(loginUsuarioSchema.validate(credenciaisInvalidas))
        .rejects.toThrow('Email é obrigatório');
    });

    it('Rejeitar login sem senha', async () => {
      const credenciaisInvalidas = {
        email: 'usuario@email.com'
      };

      await expect(loginUsuarioSchema.validate(credenciaisInvalidas))
        .rejects.toThrow('Senha é obrigatória');
    });

    it('Rejeitar email com formato inválido no login', async () => {
      const credenciaisInvalidas = {
        email: 'email-invalido',
        senha: 'minhasenha'
      };

      await expect(loginUsuarioSchema.validate(credenciaisInvalidas))
        .rejects.toThrow('Email deve ter um formato válido');
    });

    it('Rejeitar campos extras no login', async () => {
      const credenciaisInvalidas = {
        email: 'usuario@email.com',
        senha: 'minhasenha',
        campoExtra: 'não permitido'
      };

      await expect(loginUsuarioSchema.validate(credenciaisInvalidas, { stripUnknown: false }))
        .rejects.toThrow('Campos não permitidos foram enviados');
    });
  });
});