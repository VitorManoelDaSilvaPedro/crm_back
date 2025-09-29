import { Request, Response } from 'express';
import { EtapaService } from '../services/EtapaService';
import { createEtapaSchema } from './schemas';

export class EtapaController {
    private etapaService: EtapaService;

    constructor() {
        this.etapaService = new EtapaService();
    }

    async criar(req: Request, res: Response) {
        try {
            const validatedData = await createEtapaSchema.validate(req.body, { 
                abortEarly: false,
                stripUnknown: false 
            });
            
            const etapa = await this.etapaService.criarEtapa(validatedData);
            res.status(201).json(etapa);
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const errors = error.inner.map((err: any) => ({
                    field: err.path,
                    message: err.message
                }));
                return res.status(400).json({ message: 'Dados inválidos', errors });
            }
            const status = error.message === 'Board não encontrado' ? 404 : 400;
            res.status(status).json({ message: error.message });
        }
    }
}