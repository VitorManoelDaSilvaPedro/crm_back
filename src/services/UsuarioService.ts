import { Usuario } from '../models/Usuario';
import { UsuarioRepository } from '../repositories/UsuarioRepository';
import { JwtService, TokenPair } from './JwtService';
import bcrypt from 'bcrypt';

type CreateUsuarioData = {
    nome: string;
    foto?: string | null | undefined;
    email: string;
    celular: string;
    senha: string;
    nivel: string;
    codigo?: string | null | undefined;
};

type UpdateUsuarioData = {
    nome?: string | undefined;
    foto?: string | null | undefined;
    email?: string | undefined;
    celular?: string | undefined;
    senha?: string | undefined;
    nivel?: string | undefined;
    codigo?: string | null | undefined;
};

export class UsuarioService {
    private usuarioRepository: UsuarioRepository;

    constructor() {
        this.usuarioRepository = new UsuarioRepository();
    }

    async criarUsuario(data: CreateUsuarioData): Promise<Omit<Usuario, 'senha'>> {
        // Hash da senha
        const senhaHash = await bcrypt.hash(data.senha, 10);
        
        const createData: any = {
            nome: data.nome,
            email: data.email,
            celular: data.celular,
            senha: senhaHash,
            nivel: data.nivel
        };
        
        if (data.foto !== undefined) createData.foto = data.foto;
        if (data.codigo !== undefined) createData.codigo = data.codigo;
        
        const usuario = await this.usuarioRepository.create(createData);

        // Remove a senha do retorno
        const { senha, ...usuarioSemSenha } = usuario;
        return usuarioSemSenha;
    }

    async listarUsuarios(): Promise<Omit<Usuario, 'senha'>[]> {
        const usuarios = await this.usuarioRepository.findAll();
        
        // Remove a senha de todos os usuários
        return usuarios.map(({ senha, ...usuario }) => usuario);
    }

    async buscarUsuarioPorId(id: string): Promise<Omit<Usuario, 'senha'>> {
        const usuario = await this.usuarioRepository.findById(id);
        
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        const { senha, ...usuarioSemSenha } = usuario;
        return usuarioSemSenha;
    }

    async atualizarUsuario(id: string, data: UpdateUsuarioData): Promise<Omit<Usuario, 'senha'>> {
        const usuarioExiste = await this.usuarioRepository.findById(id);
        
        if (!usuarioExiste) {
            throw new Error('Usuário não encontrado');
        }

        const updateData: any = {};
        if (data.nome !== undefined) updateData.nome = data.nome;
        if (data.foto !== undefined) updateData.foto = data.foto;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.celular !== undefined) updateData.celular = data.celular;
        if (data.nivel !== undefined) updateData.nivel = data.nivel;
        if (data.codigo !== undefined) updateData.codigo = data.codigo;
        if (data.senha !== undefined) {
            updateData.senha = await bcrypt.hash(data.senha, 10);
        }

        const usuario = await this.usuarioRepository.update(id, updateData);
        
        const { senha, ...usuarioSemSenha } = usuario;
        return usuarioSemSenha;
    }

    async deletarUsuario(id: string): Promise<{ message: string }> {
        const usuarioExiste = await this.usuarioRepository.findById(id);
        
        if (!usuarioExiste) {
            throw new Error('Usuário não encontrado');
        }

        await this.usuarioRepository.delete(id);
        return { message: 'Usuário deletado com sucesso' };
    }

    async login(email: string, senha: string): Promise<{ accessToken: string; refreshToken: string; usuario: Omit<Usuario, 'senha'> }> {
        const usuario = await this.usuarioRepository.findByEmail(email);
        
        if (!usuario) {
            throw new Error('Credenciais inválidas');
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        
        if (!senhaValida) {
            throw new Error('Credenciais inválidas');
        }

        const tokens = JwtService.generateTokens({
            userId: usuario.id,
            email: usuario.email,
            nivel: usuario.nivel
        });
        
        const { senha: _, ...usuarioSemSenha } = usuario;
        return { 
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            usuario: usuarioSemSenha 
        };
    }
}