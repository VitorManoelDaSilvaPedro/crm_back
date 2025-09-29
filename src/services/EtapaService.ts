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
        // Verificar se o board existe
        const board = await this.boardRepository.findById(data.id_board);
        if (!board) {
            throw new Error('Board não encontrado');
        }

        // Verificar se já existe uma etapa com a mesma ordem no board
        const etapaExistente = await this.etapaRepository.findByOrdemAndBoard(data.ordem, data.id_board);
        if (etapaExistente) {
            throw new Error('Já existe uma etapa com esta ordem neste board');
        }

        return await this.etapaRepository.create(data);
    }
}