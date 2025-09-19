import { Request, Response, NextFunction } from 'express';

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