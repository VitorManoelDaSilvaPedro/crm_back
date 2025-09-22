import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from './authMiddleware';
import { UsuarioRepository } from '../repositories/UsuarioRepository';

export const conditionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Durante testes, verificar se há token JWT válido primeiro
    if (process.env.NODE_ENV === 'test') {
        // Se há header de autorização, usar autenticação JWT normal
        if (req.headers.authorization) {
            return authMiddleware(req, res, next);
        }
        // Senão, simular usuário admin para testes legados
        req.user = {
            userId: 'test-admin-id',
            email: 'admin@test.com',
            nivel: 'admin'
        };
        return next();
    }
    
    // Rotas públicas que não precisam de autenticação
    if (req.path.startsWith('/api-docs')) {
        return next();
    }
    
    // Se for POST /usuarios, verificar se já existem usuários (apenas em desenvolvimento)
    if (req.method === 'POST' && req.path === '/usuarios' && process.env.NODE_ENV === 'development') {
        try {
            const usuarioRepository = new UsuarioRepository();
            const usuarios = await usuarioRepository.findAll();
            
            // Se não há usuários, permitir criação sem autenticação
            if (usuarios.length === 0) {
                return next();
            }
        } catch (error) {
            // Em caso de erro, aplicar autenticação normal
        }
    }
    
    // Para todos os outros casos, aplicar autenticação
    return authMiddleware(req, res, next);
};