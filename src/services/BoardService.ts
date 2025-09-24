import { Board } from '../models/Board';
import { BoardRepository } from '../repositories/BoardRepository';

export class BoardService {
    private boardRepository: BoardRepository;

    constructor() {
        this.boardRepository = new BoardRepository();
    }

    async criarBoard(data: { nome: string; ativo?: boolean }): Promise<Board> {
        if (!data.nome || data.nome.trim() === '') {
            throw new Error('Nome é obrigatório');
        }

        return await this.boardRepository.create(data);
    }

    async listarBoards(ativo?: boolean): Promise<Board[]> {
        return await this.boardRepository.findAll(ativo);
    }

    async buscarBoardPorId(id: string): Promise<Board> {
        const board = await this.boardRepository.findById(id);
        
        if (!board) {
            throw new Error('Board não encontrado');
        }

        return board;
    }

    async atualizarBoard(id: string, data: { nome: string }): Promise<Board> {
        const boardExiste = await this.boardRepository.findById(id);
        
        if (!boardExiste) {
            throw new Error('Board não encontrado');
        }

        if (!data.nome || data.nome.trim() === '') {
            throw new Error('Nome é obrigatório');
        }

        return await this.boardRepository.update(id, data);
    }

    async alterarStatusBoard(id: string, ativo: boolean): Promise<Board> {
        const boardExiste = await this.boardRepository.findById(id);
        
        if (!boardExiste) {
            throw new Error('Board não encontrado');
        }

        return await this.boardRepository.updateStatus(id, ativo);
    }

    async desativarBoard(id: string): Promise<{ message: string }> {
        const boardExiste = await this.boardRepository.findById(id);
        
        if (!boardExiste) {
            throw new Error('Board não encontrado');
        }

        await this.boardRepository.updateStatus(id, false);
        return { message: 'Board desativado com sucesso' };
    }
}