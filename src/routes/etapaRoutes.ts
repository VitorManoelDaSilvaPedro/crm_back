import { Router } from 'express';
import { EtapaController } from '../controllers/EtapaController';
import { adminMiddleware } from '../middleware/adminMiddleware';

const etapaRoutes = Router();
const etapaController = new EtapaController();

etapaRoutes.use(adminMiddleware);

/**
 * @swagger
 * /etapas:
 *   post:
 *     summary: Criar nova etapa
 *     tags: [Etapas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EtapaInput'
 *     responses:
 *       201:
 *         description: Etapa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Etapa'
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
 *       404:
 *         description: Board não encontrado
 */
etapaRoutes.post('/etapas', (req, res) => etapaController.criar(req, res));

/**
 * @swagger
 * /etapas:
 *   get:
 *     summary: Listar etapas de um board
 *     tags: [Etapas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_board
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do board
 *     responses:
 *       200:
 *         description: Lista de etapas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Etapa'
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado. Apenas administradores
 *       404:
 *         description: Board não encontrado
 */
etapaRoutes.get('/etapas', (req, res) => etapaController.listar(req, res));

/**
 * @swagger
 * /etapas/{id}:
 *   put:
 *     summary: Atualizar etapa
 *     tags: [Etapas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da etapa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EtapaUpdateInput'
 *     responses:
 *       200:
 *         description: Etapa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Etapa'
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
 *       404:
 *         description: Etapa não encontrada
 */
etapaRoutes.put('/etapas/:id', (req, res) => etapaController.atualizar(req, res));

/**
 * @swagger
 * /etapas/{id}:
 *   delete:
 *     summary: Desativar etapa
 *     tags: [Etapas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da etapa
 *     responses:
 *       200:
 *         description: Etapa desativada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Etapa desativada com sucesso"
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado. Apenas administradores
 *       404:
 *         description: Etapa não encontrada
 */
etapaRoutes.delete('/etapas/:id', (req, res) => etapaController.deletar(req, res));

/**
 * @swagger
 * /etapas/{id}/reativar:
 *   patch:
 *     summary: Reativar etapa
 *     tags: [Etapas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da etapa
 *     responses:
 *       200:
 *         description: Etapa reativada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Etapa reativada com sucesso"
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado. Apenas administradores
 *       404:
 *         description: Etapa não encontrada
 */
etapaRoutes.patch('/etapas/:id/reativar', (req, res) => etapaController.reativar(req, res));

/**
 * @swagger
 * /etapas/{id}/reordenar:
 *   patch:
 *     summary: Reordenar etapa
 *     tags: [Etapas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da etapa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ordem
 *             properties:
 *               ordem:
 *                 type: integer
 *                 minimum: 1
 *                 description: Nova ordem da etapa
 *     responses:
 *       200:
 *         description: Etapa reordenada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Etapa reordenada com sucesso"
 *                 etapas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Etapa'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado. Apenas administradores
 *       404:
 *         description: Etapa não encontrada
 */
etapaRoutes.patch('/etapas/:id/reordenar', (req, res) => etapaController.reordenar(req, res));

export default etapaRoutes;