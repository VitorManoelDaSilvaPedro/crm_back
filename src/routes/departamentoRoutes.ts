import { Router } from 'express';
import { DepartamentoController } from '../controllers/DepartamentoController';
import { adminMiddleware } from '../middleware/adminMiddleware';

const departamentoRoutes = Router();
const departamentoController = new DepartamentoController();

// Aplicar middleware de admin em todas as rotas de departamentos
departamentoRoutes.use(adminMiddleware);

/**
 * @swagger
 * /departamentos:
 *   post:
 *     summary: Criar novo departamento
 *     tags: [Departamentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartamentoInput'
 *     responses:
 *       201:
 *         description: Departamento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Departamento'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
departamentoRoutes.post('/departamentos', (req, res) => departamentoController.criar(req, res));

/**
 * @swagger
 * /departamentos:
 *   get:
 *     summary: Listar departamentos
 *     tags: [Departamentos]
 *     parameters:
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo
 *     responses:
 *       200:
 *         description: Lista de departamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Departamento'
 */
departamentoRoutes.get('/departamentos', (req, res) => departamentoController.listar(req, res));

/**
 * @swagger
 * /departamentos/{id}:
 *   get:
 *     summary: Buscar departamento por ID
 *     tags: [Departamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do departamento
 *     responses:
 *       200:
 *         description: Departamento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Departamento'
 *       404:
 *         description: Departamento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
departamentoRoutes.get('/departamentos/:id', (req, res) => departamentoController.buscarPorId(req, res));

/**
 * @swagger
 * /departamentos/{id}:
 *   put:
 *     summary: Atualizar departamento
 *     tags: [Departamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do departamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartamentoInput'
 *     responses:
 *       200:
 *         description: Departamento atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Departamento'
 *       404:
 *         description: Departamento não encontrado
 *       400:
 *         description: Dados inválidos
 */
departamentoRoutes.put('/departamentos/:id', (req, res) => departamentoController.atualizar(req, res));

/**
 * @swagger
 * /departamentos/{id}:
 *   delete:
 *     summary: Desativar departamento
 *     tags: [Departamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do departamento
 *     responses:
 *       200:
 *         description: Departamento desativado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Departamento não encontrado
 */
departamentoRoutes.delete('/departamentos/:id', (req, res) => departamentoController.deletar(req, res));

export default departamentoRoutes;