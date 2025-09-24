import { Router } from 'express';
import { BoardController } from '../controllers/BoardController';
import { adminMiddleware } from '../middleware/adminMiddleware';

const boardRoutes = Router();
const boardController = new BoardController();

boardRoutes.use(adminMiddleware);

/**
 * @swagger
 * /boards:
 *   post:
 *     summary: Criar novo board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoardInput'
 *     responses:
 *       201:
 *         description: Board criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado. Apenas administradores
 */
boardRoutes.post('/boards', (req, res) => boardController.criar(req, res));

/**
 * @swagger
 * /boards:
 *   get:
 *     summary: Listar boards
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Filtrar por status ativo
 *     responses:
 *       200:
 *         description: Lista de boards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Board'
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado. Apenas administradores
 */
boardRoutes.get('/boards', (req, res) => boardController.listar(req, res));

/**
 * @swagger
 * /boards/{id}:
 *   get:
 *     summary: Buscar board por ID
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do board
 *     responses:
 *       200:
 *         description: Board encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado. Apenas administradores
 *       404:
 *         description: Board não encontrado
 */
boardRoutes.get('/boards/:id', (req, res) => boardController.buscarPorId(req, res));

/**
 * @swagger
 * /boards/{id}:
 *   put:
 *     summary: Atualizar nome do board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do board
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoardUpdateInput'
 *     responses:
 *       200:
 *         description: Board atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado. Apenas administradores
 *       404:
 *         description: Board não encontrado
 */
boardRoutes.put('/boards/:id', (req, res) => boardController.atualizar(req, res));

/**
 * @swagger
 * /boards/{id}/status:
 *   patch:
 *     summary: Alterar status do board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do board
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoardStatusInput'
 *     responses:
 *       200:
 *         description: Status do board alterado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado. Apenas administradores
 *       404:
 *         description: Board não encontrado
 */
boardRoutes.patch('/boards/:id/status', (req, res) => boardController.alterarStatus(req, res));

/**
 * @swagger
 * /boards/{id}:
 *   delete:
 *     summary: Desativar board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do board
 *     responses:
 *       200:
 *         description: Board desativado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Board desativado com sucesso"
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado. Apenas administradores
 *       404:
 *         description: Board não encontrado
 */
boardRoutes.delete('/boards/:id', (req, res) => boardController.deletar(req, res));

export default boardRoutes;