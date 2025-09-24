import { Request, Response } from 'express';
import { BoardService } from '../services/BoardService';
import { createBoardSchema, updateBoardSchema, boardIdSchema } from './schemas';

export class BoardController {
    private boardService: BoardService;

    constructor() {
        this.boardService = new BoardService();
    }

    async criar(req: Request, res: Response) {
        try {
            const validatedData = await createBoardSchema.validate(req.body, { 
                abortEarly: false,
                stripUnknown: false 
            });
            
            const board = await this.boardService.criarBoard(validatedData);
            res.status(201).json(board);
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const errors = error.inner.map((err: any) => ({
                    field: err.path,
                    message: err.message
                }));
                return res.status(400).json({ message: 'Dados inválidos', errors });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async listar(req: Request, res: Response) {
        try {
            const { ativo } = req.query;
            
            // Validação simples do parâmetro ativo
            if (ativo && ativo !== 'true' && ativo !== 'false') {
                return res.status(400).json({ 
                    message: 'Parâmetros inválidos', 
                    errors: [{ field: 'ativo', message: 'Parâmetro ativo deve ser "true" ou "false"' }]
                });
            }
            
            const ativoBoolean = ativo === 'true' ? true : ativo === 'false' ? false : undefined;
            const boards = await this.boardService.listarBoards(ativoBoolean);
            res.status(200).json(boards);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async buscarPorId(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            // Validação de UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!id || !uuidRegex.test(id)) {
                return res.status(400).json({ 
                    message: 'Parâmetros inválidos', 
                    errors: [{ field: 'id', message: 'ID deve ser um UUID válido' }]
                });
            }
            
            const board = await this.boardService.buscarBoardPorId(id);
            res.status(200).json(board);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async atualizar(req: Request, res: Response) {
        try {
            const validatedParams = await boardIdSchema.validate(req.params, { 
                abortEarly: false,
                stripUnknown: false 
            });
            const validatedData = await updateBoardSchema.validate(req.body, { 
                abortEarly: false,
                stripUnknown: false 
            });
            
            const board = await this.boardService.atualizarBoard(validatedParams.id, validatedData);
            res.status(200).json(board);
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

    async alterarStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { ativo } = req.body;
            
            // Validação de UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!id || !uuidRegex.test(id)) {
                return res.status(400).json({ 
                    message: 'Dados inválidos', 
                    errors: [{ field: 'id', message: 'ID deve ser um UUID válido' }]
                });
            }
            
            if (typeof ativo !== 'boolean') {
                return res.status(400).json({ 
                    message: 'Dados inválidos', 
                    errors: [{ field: 'ativo', message: 'Status ativo é obrigatório' }]
                });
            }
            
            const board = await this.boardService.alterarStatusBoard(id, ativo);
            res.status(200).json(board);
        } catch (error: any) {
            const status = error.message === 'Board não encontrado' ? 404 : 400;
            res.status(status).json({ message: error.message });
        }
    }

    async deletar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            // Validação de UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!id || !uuidRegex.test(id)) {
                return res.status(400).json({ 
                    message: 'Parâmetros inválidos', 
                    errors: [{ field: 'id', message: 'ID deve ser um UUID válido' }]
                });
            }
            
            const resultado = await this.boardService.desativarBoard(id);
            res.status(200).json(resultado);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }
}