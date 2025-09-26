import axios from "axios";
import server from "../../server";
import { DatabaseFactory } from "../factories/DatabaseFactory";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const BASE_URL = "http://localhost:4000";
const prisma = new PrismaClient();

describe("Testes de Integração - Autenticação", () => {
    let departamentoId: string;
    let usuarioAtivoEmail: string;
    let usuarioDesativadoEmail: string;
    let usuarioAtivoId: string;
    let usuarioDesativadoId: string;

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

        // Criar departamento diretamente no banco
        const departamento = await prisma.departamento.create({
            data: {
                nome: "Departamento Teste Auth",
                ativo: true
            }
        });
        departamentoId = departamento.id;

        // Criar usuário ativo diretamente no banco
        usuarioAtivoEmail = `ativo.${Date.now()}@teste.com`;
        const senhaHash = await bcrypt.hash("123456", 10);
        
        const usuarioAtivo = await prisma.usuario.create({
            data: {
                nome: "Usuário Ativo Teste",
                email: usuarioAtivoEmail,
                celular: "(11) 99999-9999",
                senha: senhaHash,
                nivel: "user",
                id_departamento: departamentoId,
                ativo: true
            }
        });
        usuarioAtivoId = usuarioAtivo.id;

        // Criar usuário desativado diretamente no banco
        usuarioDesativadoEmail = `desativado.${Date.now()}@teste.com`;
        
        const usuarioDesativado = await prisma.usuario.create({
            data: {
                nome: "Usuário Desativado Teste",
                email: usuarioDesativadoEmail,
                celular: "(11) 88888-8888",
                senha: senhaHash,
                nivel: "user",
                id_departamento: departamentoId,
                ativo: false
            }
        });
        usuarioDesativadoId = usuarioDesativado.id;
    }, 15000);

    afterAll(async () => {
        // Limpar dados de teste
        try {
            await prisma.usuario.deleteMany({
                where: {
                    id: {
                        in: [usuarioAtivoId, usuarioDesativadoId]
                    }
                }
            });
            await prisma.departamento.delete({
                where: { id: departamentoId }
            });
        } catch (error) {
            console.log("Erro ao limpar dados de teste:", error);
        }

        await prisma.$disconnect();
        
        await new Promise<void>((resolve) => {
            server.close(() => {
                resolve();
            });
        });
        await DatabaseFactory.disconnect();
    }, 10000);

    it("Deve permitir login de usuário ativo", async () => {
        const credenciais = {
            email: usuarioAtivoEmail,
            senha: "123456"
        };

        const response = await axios.post(`${BASE_URL}/auth/login`, credenciais);
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("accessToken");
        expect(response.data).toHaveProperty("refreshToken");
        expect(response.data).toHaveProperty("usuario");
        expect(response.data.usuario.email).toBe(usuarioAtivoEmail);
        expect(response.data.usuario.ativo).toBe(true);
        expect(response.data.usuario).not.toHaveProperty("senha");
    });

    it("Deve impedir login de usuário desativado", async () => {
        const credenciais = {
            email: usuarioDesativadoEmail,
            senha: "123456"
        };

        try {
            await axios.post(`${BASE_URL}/auth/login`, credenciais);
            fail("Login deveria ter falhado para usuário desativado");
        } catch (error: any) {
            expect(error.response.status).toBe(401);
            expect(error.response.data.message).toBe("Usuário desativado");
        }
    });

    it("Deve permitir login após reativar usuário", async () => {
        // Reativar usuário diretamente no banco
        await prisma.usuario.update({
            where: { id: usuarioDesativadoId },
            data: { ativo: true }
        });

        const credenciais = {
            email: usuarioDesativadoEmail,
            senha: "123456"
        };

        const response = await axios.post(`${BASE_URL}/auth/login`, credenciais);
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("accessToken");
        expect(response.data).toHaveProperty("refreshToken");
        expect(response.data).toHaveProperty("usuario");
        expect(response.data.usuario.email).toBe(usuarioDesativadoEmail);
    });

    it("Deve impedir login com credenciais inválidas", async () => {
        const credenciais = {
            email: "inexistente@teste.com",
            senha: "senhaerrada"
        };

        try {
            await axios.post(`${BASE_URL}/auth/login`, credenciais);
            fail("Login deveria ter falhado para credenciais inválidas");
        } catch (error: any) {
            expect(error.response.status).toBe(401);
            expect(error.response.data.message).toBe("Credenciais inválidas");
        }
    });

    it("Deve impedir login com senha incorreta", async () => {
        const credenciais = {
            email: usuarioAtivoEmail,
            senha: "senhaerrada"
        };

        try {
            await axios.post(`${BASE_URL}/auth/login`, credenciais);
            fail("Login deveria ter falhado para senha incorreta");
        } catch (error: any) {
            expect(error.response.status).toBe(401);
            expect(error.response.data.message).toBe("Credenciais inválidas");
        }
    });
});