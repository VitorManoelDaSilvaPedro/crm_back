import { Router } from 'express';
import { DepartamentoController } from '../controllers/DepartamentoController';
import { validate } from '../middleware/validationMiddleware';
import { 
  createDepartamentoSchema, 
  updateDepartamentoSchema,
  departamentoIdSchema,
  listDepartamentosQuerySchema 
} from '../controllers/schemas';

const departamentoRoutes = Router();
const departamentoController = new DepartamentoController();

// Exemplo de uso do middleware de validação
departamentoRoutes.post('/departamentos', 
  validate({ body: createDepartamentoSchema }), 
  (req, res) => departamentoController.criar(req, res)
);

departamentoRoutes.get('/departamentos', 
  validate({ query: listDepartamentosQuerySchema }), 
  (req, res) => departamentoController.listar(req, res)
);

departamentoRoutes.get('/departamentos/:id', 
  validate({ params: departamentoIdSchema }), 
  (req, res) => departamentoController.buscarPorId(req, res)
);

departamentoRoutes.put('/departamentos/:id', 
  validate({ 
    params: departamentoIdSchema, 
    body: updateDepartamentoSchema 
  }), 
  (req, res) => departamentoController.atualizar(req, res)
);

departamentoRoutes.delete('/departamentos/:id', 
  validate({ params: departamentoIdSchema }), 
  (req, res) => departamentoController.deletar(req, res)
);

export default departamentoRoutes;