import { UsuarioService } from '../services/UsuarioService';
import { UsuarioRepository } from '../repositories/UsuarioRepository';
import { JwtService } from '../services/JwtService';
import { Usuario, NivelUsuario } from '../models/Usuario';
import bcrypt from 'bcrypt';

// Mock das dependências
jest.mock('../repositories/UsuarioRepository');
jest.mock('../services/JwtService');
jest.mock('bcrypt');

describe('UsuarioService - Login', () => {
    let usuarioService: UsuarioService;
    let mockUsuarioRepository: jest.Mocked<UsuarioRepository>;
    let mockBcrypt: jest.Mocked<typeof bcrypt>;
    let mockJwtService: jest.Mocked<typeof JwtService>;

    beforeEach(() => {
        // Limpar todos os mocks
        jest.clearAllMocks();
        
        // Criar instância do service
        usuarioService = new UsuarioService();
        
        // Obter referências dos mocks
        mockUsuarioRepository = UsuarioRepository.prototype as jest.Mocked<UsuarioRepository>;
        mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
        mockJwtService = JwtService as jest.Mocked<typeof JwtService>;
    });

    describe('login', () => {
        const usuarioMock: Usuario = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            nome: 'João Silva',
            email: 'joao@teste.com',
            celular: '(11) 99999-9999',
            senha: 'hashedPassword',
            nivel: 'user' as NivelUsuario,
            id_departamento: '456e7890-e89b-12d3-a456-426614174000',
            ativo: true,
            created_at: new Date(),
            updated_at: new Date()
        };

        const tokensMock = {
            accessToken: 'access-token',
            refreshToken: 'refresh-token'
        };

        it('deve permitir login de usuário ativo com credenciais válidas', async () => {
            // Arrange
            mockUsuarioRepository.findByEmail.mockResolvedValue(usuarioMock);
            mockBcrypt.compare.mockResolvedValue(true as never);
            mockJwtService.generateTokens.mockReturnValue(tokensMock);

            // Act
            const resultado = await usuarioService.login('joao@teste.com', 'senha123');

            // Assert
            expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith('joao@teste.com');
            expect(mockBcrypt.compare).toHaveBeenCalledWith('senha123', 'hashedPassword');
            expect(mockJwtService.generateTokens).toHaveBeenCalledWith({
                userId: usuarioMock.id,
                email: usuarioMock.email,
                nivel: usuarioMock.nivel
            });
            expect(resultado).toEqual({
                accessToken: tokensMock.accessToken,
                refreshToken: tokensMock.refreshToken,
                usuario: {
                    id: usuarioMock.id,
                    nome: usuarioMock.nome,
                    email: usuarioMock.email,
                    celular: usuarioMock.celular,
                    nivel: usuarioMock.nivel,
                    id_departamento: usuarioMock.id_departamento,
                    ativo: usuarioMock.ativo,
                    created_at: usuarioMock.created_at,
                    updated_at: usuarioMock.updated_at
                }
            });
        });

        it('deve impedir login de usuário desativado', async () => {
            // Arrange
            const usuarioDesativado = { ...usuarioMock, ativo: false };
            mockUsuarioRepository.findByEmail.mockResolvedValue(usuarioDesativado);

            // Act & Assert
            await expect(usuarioService.login('joao@teste.com', 'senha123'))
                .rejects.toThrow('Usuário desativado');
            
            expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith('joao@teste.com');
            expect(mockBcrypt.compare).not.toHaveBeenCalled();
            expect(mockJwtService.generateTokens).not.toHaveBeenCalled();
        });

        it('deve impedir login com email inexistente', async () => {
            // Arrange
            mockUsuarioRepository.findByEmail.mockResolvedValue(null);

            // Act & Assert
            await expect(usuarioService.login('inexistente@teste.com', 'senha123'))
                .rejects.toThrow('Credenciais inválidas');
            
            expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith('inexistente@teste.com');
            expect(mockBcrypt.compare).not.toHaveBeenCalled();
            expect(mockJwtService.generateTokens).not.toHaveBeenCalled();
        });

        it('deve impedir login com senha incorreta', async () => {
            // Arrange
            mockUsuarioRepository.findByEmail.mockResolvedValue(usuarioMock);
            mockBcrypt.compare.mockResolvedValue(false as never);

            // Act & Assert
            await expect(usuarioService.login('joao@teste.com', 'senhaerrada'))
                .rejects.toThrow('Credenciais inválidas');
            
            expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith('joao@teste.com');
            expect(mockBcrypt.compare).toHaveBeenCalledWith('senhaerrada', 'hashedPassword');
            expect(mockJwtService.generateTokens).not.toHaveBeenCalled();
        });

        it('não deve retornar a senha no resultado do login', async () => {
            // Arrange
            mockUsuarioRepository.findByEmail.mockResolvedValue(usuarioMock);
            mockBcrypt.compare.mockResolvedValue(true as never);
            mockJwtService.generateTokens.mockReturnValue(tokensMock);

            // Act
            const resultado = await usuarioService.login('joao@teste.com', 'senha123');

            // Assert
            expect(resultado.usuario).not.toHaveProperty('senha');
        });
    });
});