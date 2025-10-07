import { Request, Response } from 'express';
import { EtapaService } from '../services/EtapaService';
import { createEtapaSchema, updateEtapaSchema, etapaIdSchema, reordenarEtapaSchema } from './schemas';

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

    async atualizar(req: Request, res: Response) {
        try {
            const validatedParams = await etapaIdSchema.validate(req.params, { 
                abortEarly: false,
                stripUnknown: false 
            });
            const validatedData = await updateEtapaSchema.validate(req.body, { 
                abortEarly: false,
                stripUnknown: false 
            });
            
            const etapa = await this.etapaService.atualizarEtapa(validatedParams.id, validatedData);
            res.status(200).json(etapa);
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const errors = error.inner.map((err: any) => ({
                    field: err.path,
                    message: err.message
                }));
                return res.status(400).json({ message: 'Dados inválidos', errors });
            }
            const status = error.message === 'Etapa não encontrada' ? 404 : 400;
            res.status(status).json({ message: error.message });
        }
    }

    async listar(req: Request, res: Response) {
        try {
            const { id_board } = req.query;
            
            if (!id_board || typeof id_board !== 'string') {
                return res.status(400).json({ 
                    message: 'Parâmetros inválidos', 
                    errors: [{ field: 'id_board', message: 'ID do board é obrigatório' }]
                });
            }

            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id_board)) {
                return res.status(400).json({ 
                    message: 'Parâmetros inválidos', 
                    errors: [{ field: 'id_board', message: 'ID do board deve ser um UUID válido' }]
                });
            }
            
            const etapas = await this.etapaService.listarEtapasPorBoard(id_board);
            res.status(200).json(etapas);
        } catch (error: any) {
            const status = error.message === 'Board não encontrado' ? 404 : 500;
            res.status(status).json({ message: error.message });
        }
    }

    async deletar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!id || !uuidRegex.test(id)) {
                return res.status(400).json({ 
                    message: 'Parâmetros inválidos', 
                    errors: [{ field: 'id', message: 'ID deve ser um UUID válido' }]
                });
            }
            
            const resultado = await this.etapaService.desativarEtapa(id);
            res.status(200).json(resultado);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async reativar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!id || !uuidRegex.test(id)) {
                return res.status(400).json({ 
                    message: 'Parâmetros inválidos', 
                    errors: [{ field: 'id', message: 'ID deve ser um UUID válido' }]
                });
            }
            
            const resultado = await this.etapaService.reativarEtapa(id);
            res.status(200).json(resultado);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async reordenar(req: Request, res: Response) {
        try {
            const validatedParams = await etapaIdSchema.validate(req.params, { 
                abortEarly: false,
                stripUnknown: false 
            });
            const validatedData = await reordenarEtapaSchema.validate(req.body, { 
                abortEarly: false,
                stripUnknown: false 
            });
            
            const resultado = await this.etapaService.reordenarEtapas(validatedParams.id, validatedData.ordem);
            res.status(200).json(resultado);
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const errors = error.inner.map((err: any) => ({
                    field: err.path,
                    message: err.message
                }));
                return res.status(400).json({ message: 'Dados inválidos', errors });
            }
            const status = error.message === 'Etapa não encontrada' ? 404 : 400;
            console.log(error)
            res.status(status).json({ message: error.message });
        }
    }
}