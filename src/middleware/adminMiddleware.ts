import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Verificar se o usuário está autenticado
        if (!req.user) {
            return res.status(401).json({
                message: 'Usuário não autenticado'
            });
        }

        // Verificar se o usuário é admin
        if (req.user.nivel !== 'admin') {
            return res.status(403).json({
                message: 'Acesso negado. Apenas administradores podem acessar esta rota.'
            });
        }

        next();
    } catch (error: any) {
        return res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};