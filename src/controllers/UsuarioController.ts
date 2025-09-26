import { Request, Response } from 'express';
import { UsuarioService } from '../services/UsuarioService';
import { 
  createUsuarioSchema, 
  updateUsuarioSchema,
  usuarioIdSchema,
  loginUsuarioSchema 
} from './schemas';

export class UsuarioController {
    private usuarioService: UsuarioService;

    constructor() {
        this.usuarioService = new UsuarioService();
    }

    async criar(req: Request, res: Response) {
        try {
            const validatedData = await createUsuarioSchema.validate(req.body, { 
                abortEarly: false,
                stripUnknown: true 
            });
            
            const usuario = await this.usuarioService.criarUsuario(validatedData);
            res.status(201).json(usuario);
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
            const usuarios = await this.usuarioService.listarUsuarios();
            res.status(200).json(usuarios);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async buscarPorId(req: Request, res: Response) {
        try {
            const validatedParams = await usuarioIdSchema.validate({
                id: req.params.id
            }, { 
                abortEarly: false,
                stripUnknown: false 
            });
            
            const usuario = await this.usuarioService.buscarUsuarioPorId(validatedParams.id);
            res.status(200).json(usuario);
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const errors = error.inner.map((err: any) => ({
                    field: err.path,
                    message: err.message
                }));
                return res.status(400).json({ message: 'Parâmetros inválidos', errors });
            }
            const status = error.message === 'Usuário não encontrado' ? 404 : 500;
            res.status(status).json({ message: error.message });
        }
    }

    async atualizar(req: Request, res: Response) {
        try {
            const validatedParams = await usuarioIdSchema.validate({
                id: req.params.id
            }, { 
                abortEarly: false,
                stripUnknown: false 
            });
            
            const validatedData = await updateUsuarioSchema.validate(req.body, { 
                abortEarly: false,
                stripUnknown: false 
            });
            
            const usuario = await this.usuarioService.atualizarUsuario(validatedParams.id, validatedData);
            res.status(200).json(usuario);
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const errors = error.inner.map((err: any) => ({
                    field: err.path,
                    message: err.message
                }));
                return res.status(400).json({ message: 'Dados inválidos', errors });
            }
            const status = error.message === 'Usuário não encontrado' ? 404 : 400;
            res.status(status).json({ message: error.message });
        }
    }

    async deletar(req: Request, res: Response) {
        try {
            const validatedParams = await usuarioIdSchema.validate({
                id: req.params.id
            }, { 
                abortEarly: false,
                stripUnknown: false 
            });
            
            const resultado = await this.usuarioService.deletarUsuario(validatedParams.id);
            res.status(200).json(resultado);
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const errors = error.inner.map((err: any) => ({
                    field: err.path,
                    message: err.message
                }));
                return res.status(400).json({ message: 'Parâmetros inválidos', errors });
            }
            const status = error.message === 'Usuário não encontrado' ? 404 : 500;
            res.status(status).json({ message: error.message });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const validatedData = await loginUsuarioSchema.validate(req.body, { 
                abortEarly: false,
                stripUnknown: false 
            });
            
            const resultado = await this.usuarioService.login(validatedData.email, validatedData.senha);
            res.status(200).json(resultado);
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const errors = error.inner.map((err: any) => ({
                    field: err.path,
                    message: err.message
                }));
                return res.status(400).json({ message: 'Dados inválidos', errors });
            }
            const status = error.message === 'Credenciais inválidas' || error.message === 'Usuário desativado' ? 401 : 500;
            res.status(status).json({ message: error.message });
        }
    }

    async reativar(req: Request, res: Response) {
        try {
            const validatedParams = await usuarioIdSchema.validate({
                id: req.params.id
            }, { 
                abortEarly: false,
                stripUnknown: false 
            });
            
            const resultado = await this.usuarioService.reativarUsuario(validatedParams.id);
            res.status(200).json(resultado);
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const errors = error.inner.map((err: any) => ({
                    field: err.path,
                    message: err.message
                }));
                return res.status(400).json({ message: 'Parâmetros inválidos', errors });
            }
            const status = error.message === 'Usuário não encontrado' ? 404 : 500;
            res.status(status).json({ message: error.message });
        }
    }
}