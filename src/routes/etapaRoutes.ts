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

export default etapaRoutes;