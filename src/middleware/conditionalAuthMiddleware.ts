import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from './authMiddleware';
import { UsuarioRepository } from '../repositories/UsuarioRepository';

export const conditionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Durante testes, desabilitar autenticação
    if (process.env.NODE_ENV === 'test') {
        return next();
    }
    
    // Rotas públicas que não precisam de autenticação
    if (req.path.startsWith('/api-docs')) {
        return next();
    }
    
    // Se for POST /usuarios, verificar se já existem usuários
    if (req.method === 'POST' && req.path === '/usuarios') {
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