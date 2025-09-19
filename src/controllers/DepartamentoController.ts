import { Request, Response } from 'express';
import { DepartamentoService } from '../services/DepartamentoService';
import { 
  createDepartamentoSchema, 
  updateDepartamentoSchema,
  departamentoIdSchema,
  listDepartamentosQuerySchema 
} from './schemas';

export class DepartamentoController {
    private departamentoService: DepartamentoService;

    constructor() {
        this.departamentoService = new DepartamentoService();
    }

    async criar(req: Request, res: Response) {
        try {
            const validatedData = await createDepartamentoSchema.validate(req.body, { 
                abortEarly: false,
                stripUnknown: false 
            });
            const createData: { nome: string; icone?: string; ativo: boolean } = {
                nome: validatedData.nome,
                ativo: validatedData.ativo
            };
            if (validatedData.icone) {
                createData.icone = validatedData.icone;
            }
            const departamento = await this.departamentoService.criarDepartamento(createData);
            res.status(201).json(departamento);
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
            const validatedQuery = await listDepartamentosQuerySchema.validate(req.query, { 
                abortEarly: false,
                stripUnknown: false 
            });
            const ativo = validatedQuery.ativo === 'true' ? true : validatedQuery.ativo === 'false' ? false : undefined;
            const departamentos = await this.departamentoService.listarDepartamentos(ativo);
            res.status(200).json(departamentos);
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const errors = error.inner.map((err: any) => ({
                    field: err.path,
                    message: err.message
                }));
                return res.status(400).json({ message: 'Parâmetros inválidos', errors });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async buscarPorId(req: Request, res: Response) {
        try {
            const validatedParams = await departamentoIdSchema.validate(req.params, { 
                abortEarly: false,
                stripUnknown: false 
            });
            const departamento = await this.departamentoService.buscarDepartamentoPorId(validatedParams.id);
            res.status(200).json(departamento);
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const errors = error.inner.map((err: any) => ({
                    field: err.path,
                    message: err.message
                }));
                return res.status(400).json({ message: 'Parâmetros inválidos', errors });
            }
            res.status(404).json({ message: error.message });
        }
    }

    async atualizar(req: Request, res: Response) {
        try {
            const validatedParams = await departamentoIdSchema.validate(req.params, { 
                abortEarly: false,
                stripUnknown: false 
            });
            const validatedData = await updateDepartamentoSchema.validate(req.body, { 
                abortEarly: false,
                stripUnknown: false 
            });
            const updateData: { nome?: string; icone?: string; ativo?: boolean } = {};
            if (validatedData.nome !== undefined) updateData.nome = validatedData.nome;
            if (validatedData.icone !== undefined) updateData.icone = validatedData.icone;
            if (validatedData.ativo !== undefined) updateData.ativo = validatedData.ativo;
            const departamento = await this.departamentoService.atualizarDepartamento(validatedParams.id, updateData);
            res.status(200).json(departamento);
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const errors = error.inner.map((err: any) => ({
                    field: err.path,
                    message: err.message
                }));
                return res.status(400).json({ message: 'Dados inválidos', errors });
            }
            const status = error.message === 'Departamento não encontrado' ? 404 : 400;
            res.status(status).json({ message: error.message });
        }
    }

    async deletar(req: Request, res: Response) {
        try {
            const validatedParams = await departamentoIdSchema.validate(req.params, { 
                abortEarly: false,
                stripUnknown: false 
            });
            const resultado = await this.departamentoService.desativarDepartamento(validatedParams.id);
            res.status(200).json(resultado);
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const errors = error.inner.map((err: any) => ({
                    field: err.path,
                    message: err.message
                }));
                return res.status(400).json({ message: 'Parâmetros inválidos', errors });
            }
            res.status(404).json({ message: error.message });
        }
    }
}