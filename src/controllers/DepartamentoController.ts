import { Request, Response } from 'express';
import { DepartamentoService } from '../services/DepartamentoService';

export class DepartamentoController {
    private departamentoService: DepartamentoService;

    constructor() {
        this.departamentoService = new DepartamentoService();
    }

    async criar(req: Request, res: Response): Promise<void> {
        try {
            const departamento = await this.departamentoService.criarDepartamento(req.body);
            res.status(201).json(departamento);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async listar(req: Request, res: Response): Promise<void> {
        try {
            const ativo = req.query.ativo === 'true' ? true : req.query.ativo === 'false' ? false : undefined;
            const departamentos = await this.departamentoService.listarDepartamentos(ativo);
            res.status(200).json(departamentos);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async buscarPorId(req: Request, res: Response): Promise<void> {
        try {
            const departamento = await this.departamentoService.buscarDepartamentoPorId(req.params.id as string);
            res.status(200).json(departamento);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async atualizar(req: Request, res: Response): Promise<void> {
        try {
            const departamento = await this.departamentoService.atualizarDepartamento(req.params.id as string, req.body);
            res.status(200).json(departamento);
        } catch (error: any) {
            const status = error.message === 'Departamento não encontrado' ? 404 : 400;
            res.status(status).json({ message: error.message });
        }
    }

    async deletar(req: Request, res: Response): Promise<void> {
        try {
            const resultado = await this.departamentoService.desativarDepartamento(req.params.id as string);
            res.status(200).json(resultado);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }
}