import axios from "axios";
import server from "../../server";
import { DatabaseFactory } from "../factories/DatabaseFactory";

const BASE_URL = "http://localhost:4000";

describe("CRUD Departamentos", () => {
    let departamentoId: string;

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
        await new Promise<void>((resolve) => {
            server.close(() => {
                resolve();
            });
        });
        await DatabaseFactory.disconnect();
    }, 10000);

    it("1. Deve criar um novo departamento", async () => {
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
    });

    it("2. Deve retornar erro 400 ao tentar criar departamento sem nome", async () => {
        const departamentoInvalido = {
            icone: "💼",
            ativo: true
        };

        try {
            await axios.post(`${BASE_URL}/departamentos`, departamentoInvalido);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data).toHaveProperty("message");
        }
    });

    it("3. Deve listar todos os departamentos", async () => {
        const response = await axios.get(`${BASE_URL}/departamentos`);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
    });

    it("4. Deve listar apenas departamentos ativos", async () => {
        const response = await axios.get(`${BASE_URL}/departamentos?ativo=true`);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        response.data.forEach((dept: any) => {
            expect(dept.ativo).toBe(true);
        });
    });

    it("5. Deve buscar um departamento por ID", async () => {
        const response = await axios.get(`${BASE_URL}/departamentos/${departamentoId}`);
        
        expect(response.status).toBe(200);
        expect(response.data.id).toBe(departamentoId);
        expect(response.data).toHaveProperty("nome");
        expect(response.data).toHaveProperty("ativo");
    });

    it("6. Deve retornar erro 404 para departamento inexistente", async () => {
        try {
            await axios.get(`${BASE_URL}/departamentos/id-inexistente`);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
            expect(error.response.data).toHaveProperty("message");
        }
    });

    it("7. Deve atualizar um departamento existente", async () => {
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

    it("8. Deve retornar erro 404 ao tentar atualizar departamento inexistente", async () => {
        const dadosAtualizacao = {
            nome: "Departamento Teste",
            ativo: true
        };

        try {
            await axios.put(`${BASE_URL}/departamentos/id-inexistente`, dadosAtualizacao);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
        }
    });

    it("9. Deve retornar erro 400 ao tentar atualizar com dados inválidos", async () => {
        const dadosInvalidos = {
            nome: "",
            ativo: "string-invalida"
        };

        try {
            await axios.put(`${BASE_URL}/departamentos/${departamentoId}`, dadosInvalidos);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
        }
    });

    it("10. Deve desativar um departamento (soft delete)", async () => {
        const response = await axios.delete(`${BASE_URL}/departamentos/${departamentoId}`);
        
        expect(response.status).toBe(200);
        expect(response.data.message).toContain("desativado");
    });

    it("11. Deve confirmar que o departamento foi desativado", async () => {
        const response = await axios.get(`${BASE_URL}/departamentos/${departamentoId}`);
        
        expect(response.status).toBe(200);
        expect(response.data.ativo).toBe(false);
    });

    it("12. Deve retornar erro 404 ao tentar deletar departamento inexistente", async () => {
        try {
            await axios.delete(`${BASE_URL}/departamentos/id-inexistente`);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
        }
    });
});