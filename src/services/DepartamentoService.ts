import { Departamento } from '../models/Departamento';
import { DepartamentoRepository } from '../repositories/DepartamentoRepository';

export class DepartamentoService {
    private departamentoRepository: DepartamentoRepository;

    constructor() {
        this.departamentoRepository = new DepartamentoRepository();
    }

    async criarDepartamento(data: { nome: string; icone?: string; ativo: boolean }): Promise<Departamento> {
        if (!data.nome || data.nome.trim() === '') {
            throw new Error('Nome é obrigatório');
        }

        return await this.departamentoRepository.create(data);
    }

    async listarDepartamentos(ativo?: boolean): Promise<Departamento[]> {
        return await this.departamentoRepository.findAll(ativo);
    }

    async buscarDepartamentoPorId(id: string): Promise<Departamento> {
        const departamento = await this.departamentoRepository.findById(id);
        
        if (!departamento) {
            throw new Error('Departamento não encontrado');
        }

        return departamento;
    }

    async atualizarDepartamento(id: string, data: { nome?: string; icone?: string; ativo?: boolean }): Promise<Departamento> {
        const departamentoExiste = await this.departamentoRepository.findById(id);
        
        if (!departamentoExiste) {
            throw new Error('Departamento não encontrado');
        }

        if (data.nome !== undefined && (!data.nome || data.nome.trim() === '')) {
            throw new Error('Nome não pode ser vazio');
        }

        return await this.departamentoRepository.update(id, data);
    }

    async desativarDepartamento(id: string): Promise<{ message: string }> {
        const departamentoExiste = await this.departamentoRepository.findById(id);
        
        if (!departamentoExiste) {
            throw new Error('Departamento não encontrado');
        }

        await this.departamentoRepository.softDelete(id);
        return { message: 'Departamento desativado com sucesso' };
    }
}