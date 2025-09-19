import axios from "axios";
import server from "../../server";
import { DatabaseFactory } from "../factories/DatabaseFactory";
import { JwtService } from "../services/JwtService";

const BASE_URL = "http://localhost:4000";

describe("Testes de Permissões", () => {
    let adminToken: string;
    let userToken: string;

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
    }, 10000);

    afterAll(async () => {
        await new Promise<void>((resolve) => {
            server.close(() => {
                resolve();
            });
        });
        await DatabaseFactory.disconnect();
    }, 10000);

    describe("Rotas de Usuários", () => {
        it("Admin deve acessar rota GET /usuarios", async () => {
            const response = await axios.get(`${BASE_URL}/usuarios`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            expect(response.status).toBe(200);
        });

        it("User não deve acessar rota GET /usuarios", async () => {
            try {
                await axios.get(`${BASE_URL}/usuarios`, {
                    headers: { Authorization: `Bearer ${userToken}` }
                });
            } catch (error: any) {
                expect(error.response.status).toBe(403);
                expect(error.response.data.message).toBe('Acesso negado. Apenas administradores podem acessar esta rota.');
            }
        });

        it("User não deve acessar rota POST /usuarios", async () => {
            const novoUsuario = {
                nome: "Teste",
                email: "teste@email.com",
                celular: "(11) 99999-9999",
                senha: "123456",
                nivel: "user"
            };

            try {
                await axios.post(`${BASE_URL}/usuarios`, novoUsuario, {
                    headers: { Authorization: `Bearer ${userToken}` }
                });
            } catch (error: any) {
                expect(error.response.status).toBe(403);
                expect(error.response.data.message).toBe('Acesso negado. Apenas administradores podem acessar esta rota.');
            }
        });
    });

    describe("Rotas de Departamentos", () => {
        it("Admin deve acessar rota GET /departamentos", async () => {
            const response = await axios.get(`${BASE_URL}/departamentos`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            expect(response.status).toBe(200);
        });

        it("User não deve acessar rota GET /departamentos", async () => {
            try {
                await axios.get(`${BASE_URL}/departamentos`, {
                    headers: { Authorization: `Bearer ${userToken}` }
                });
            } catch (error: any) {
                expect(error.response.status).toBe(403);
                expect(error.response.data.message).toBe('Acesso negado. Apenas administradores podem acessar esta rota.');
            }
        });

        it("User não deve acessar rota POST /departamentos", async () => {
            const novoDepartamento = {
                nome: "Teste",
                ativo: true
            };

            try {
                await axios.post(`${BASE_URL}/departamentos`, novoDepartamento, {
                    headers: { Authorization: `Bearer ${userToken}` }
                });
            } catch (error: any) {
                expect(error.response.status).toBe(403);
                expect(error.response.data.message).toBe('Acesso negado. Apenas administradores podem acessar esta rota.');
            }
        });
    });

    describe("Sem Token", () => {
        it("Deve retornar 401 sem token de autorização", async () => {
            try {
                await axios.get(`${BASE_URL}/usuarios`);
            } catch (error: any) {
                expect(error.response.status).toBe(401);
            }
        });
    });
});