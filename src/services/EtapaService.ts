import { Etapa } from '../models/Etapa';
import { EtapaRepository } from '../repositories/EtapaRepository';
import { BoardRepository } from '../repositories/BoardRepository';

export class EtapaService {
    private etapaRepository: EtapaRepository;
    private boardRepository: BoardRepository;

    constructor() {
        this.etapaRepository = new EtapaRepository();
        this.boardRepository = new BoardRepository();
    }

    async criarEtapa(data: { nome: string; ordem: number; id_board: string }): Promise<Etapa> {
        const board = await this.boardRepository.findById(data.id_board);
        if (!board) {
            throw new Error('Board não encontrado');
        }

        // Se ordem já existe, incrementar todas >= ordem
        const etapaExistente = await this.etapaRepository.findByOrdemAndBoard(data.ordem, data.id_board);
        if (etapaExistente) {
            await this.etapaRepository.incrementOrdem(data.id_board, data.ordem);
        }

        return await this.etapaRepository.create(data);
    }

    async atualizarEtapa(id: string, data: { nome: string }): Promise<Etapa> {
        const etapa = await this.etapaRepository.findById(id);
        if (!etapa) {
            throw new Error('Etapa não encontrada');
        }

        return await this.etapaRepository.update(id, data);
    }

    async listarEtapasPorBoard(id_board: string): Promise<Etapa[]> {
        const board = await this.boardRepository.findById(id_board);
        if (!board) {
            throw new Error('Board não encontrado');
        }

        return await this.etapaRepository.findByBoardId(id_board);
    }

    async desativarEtapa(id: string): Promise<{ message: string }> {
        const etapa = await this.etapaRepository.findById(id);
        if (!etapa) {
            throw new Error('Etapa não encontrada');
        }

        await this.etapaRepository.updateStatus(id, false);
        
        // Decrementar ordem das etapas posteriores
        await this.etapaRepository.decrementOrdem(etapa.id_board, etapa.ordem + 1);
        
        return { message: 'Etapa desativada com sucesso' };
    }

    async reativarEtapa(id: string): Promise<{ message: string }> {
        const etapa = await this.etapaRepository.findById(id);
        if (!etapa) {
            throw new Error('Etapa não encontrada');
        }

        await this.etapaRepository.updateStatus(id, true);
        return { message: 'Etapa reativada com sucesso' };
    }

    async reordenarEtapas(id: string, novaOrdem: number): Promise<{ message: string; etapas: Etapa[] }> {
        const etapa = await this.etapaRepository.findById(id);
        if (!etapa) {
            throw new Error('Etapa não encontrada');
        }

        if (novaOrdem < 1) {
            throw new Error('Ordem deve ser maior que 0');
        }

        const ordemAtual = etapa.ordem;
        
        if (ordemAtual === novaOrdem) {
            const etapas = await this.etapaRepository.findByBoardId(etapa.id_board);
            return { message: 'Etapa já está nesta posição', etapas };
        }

        // Mover para cima (ordem menor)
        if (novaOrdem < ordemAtual) {
            await this.etapaRepository.incrementOrdem(etapa.id_board, novaOrdem, ordemAtual - 1);
        }
        // Mover para baixo (ordem maior)
        else {
            await this.etapaRepository.decrementOrdem(etapa.id_board, ordemAtual + 1, novaOrdem);
        }

        // Atualizar ordem da etapa movida
        await this.etapaRepository.updateOrdem(id, novaOrdem);

        const etapas = await this.etapaRepository.findByBoardId(etapa.id_board);
        return { message: 'Etapa reordenada com sucesso', etapas: etapas.filter(e => e.ativo) };
    }
}