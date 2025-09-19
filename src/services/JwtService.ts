import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface JwtPayload {
    userId: string;
    email: string;
    nivel: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export class JwtService {
    private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || crypto.randomBytes(64).toString('hex');
    private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex');
    private static readonly ACCESS_TOKEN_EXPIRES_IN = '1h';
    private static readonly REFRESH_TOKEN_EXPIRES_IN = '1d';

    static generateTokens(payload: JwtPayload): TokenPair {
        const accessToken = jwt.sign(
            payload,
            this.ACCESS_TOKEN_SECRET,
            {
                expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
                issuer: 'crm-api',
                audience: 'crm-client',
                algorithm: 'HS256'
            }
        );

        const refreshToken = jwt.sign(
            { userId: payload.userId },
            this.REFRESH_TOKEN_SECRET,
            {
                expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
                issuer: 'crm-api',
                audience: 'crm-client',
                algorithm: 'HS256'
            }
        );

        return { accessToken, refreshToken };
    }

    static verifyAccessToken(token: string): JwtPayload {
        try {
            const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
                issuer: 'crm-api',
                audience: 'crm-client',
                algorithms: ['HS256']
            }) as JwtPayload;
            
            return decoded;
        } catch (error) {
            throw new Error('Token inválido ou expirado');
        }
    }

    static verifyRefreshToken(token: string): { userId: string } {
        try {
            const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
                issuer: 'crm-api',
                audience: 'crm-client',
                algorithms: ['HS256']
            }) as { userId: string };
            
            return decoded;
        } catch (error) {
            throw new Error('Refresh token inválido ou expirado');
        }
    }

    static extractTokenFromHeader(authHeader: string | undefined): string {
        if (!authHeader) {
            throw new Error('Token de autorização não fornecido');
        }

        if (!authHeader.startsWith('Bearer ')) {
            throw new Error('Formato de token inválido');
        }

        const token = authHeader.substring(7);
        if (!token) {
            throw new Error('Token não encontrado');
        }

        return token;
    }
}