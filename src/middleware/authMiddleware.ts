import { Request, Response, NextFunction } from 'express';
import { JwtService, JwtPayload } from '../services/JwtService';

// Estender a interface Request para incluir o usuário
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = JwtService.extractTokenFromHeader(req.headers.authorization);
        const payload = JwtService.verifyAccessToken(token);
        
        req.user = payload;
        next();
    } catch (error: any) {
        return res.status(401).json({
            message: 'Não autorizado',
            error: error.message
        });
    }
};

export const basicAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
        return res.status(401).json({ message: 'Acesso negado. Autenticação necessária.' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    if (!base64Credentials) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
        return res.status(401).json({ message: 'Credenciais malformadas.' });
    }
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (username === 'admin' && password === 'admin123') {
        return next();
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
    return res.status(401).json({ message: 'Credenciais inválidas.' });
};