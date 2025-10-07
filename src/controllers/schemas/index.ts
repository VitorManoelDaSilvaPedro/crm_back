// Exportações do domínio Departamento
export {
  createDepartamentoSchema,
  updateDepartamentoSchema,
  departamentoIdSchema,
  listDepartamentosQuerySchema
} from './departamentoSchema';

// Exportações do domínio Usuario
export {
  createUsuarioSchema,
  updateUsuarioSchema,
  usuarioIdSchema,
  loginUsuarioSchema
} from './usuarioSchema';

// Exportações do domínio Board
export {
  createBoardSchema,
  updateBoardSchema,
  updateBoardStatusSchema,
  listBoardsQuerySchema,
  boardIdSchema
} from './boardSchema';

// Exportações do domínio Etapa
export {
  createEtapaSchema,
  updateEtapaSchema,
  etapaIdSchema,
  reordenarEtapaSchema
} from './etapaSchema';