import * as yup from 'yup';

// Schema para criação de departamento
export const createDepartamentoSchema = yup.object({
  nome: yup
    .string()
    .required('Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  icone: yup
    .string()
    .optional()
    .max(255, 'Ícone deve ter no máximo 255 caracteres')
    .trim(),
  ativo: yup
    .boolean()
    .required('Status ativo é obrigatório')
}).strict().noUnknown('Campos não permitidos foram enviados');

// Schema para atualização de departamento
export const updateDepartamentoSchema = yup.object({
  nome: yup
    .string()
    .optional()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  icone: yup
    .string()
    .optional()
    .max(255, 'Ícone deve ter no máximo 255 caracteres')
    .trim(),
  ativo: yup
    .boolean()
    .optional()
}).strict().noUnknown('Campos não permitidos foram enviados');

// Schema para parâmetros de ID
export const departamentoIdSchema = yup.object({
  id: yup
    .string()
    .required('ID é obrigatório')
    .uuid('ID deve ser um UUID válido')
}).strict().noUnknown('Parâmetros não permitidos foram enviados');

// Schema para query parameters de listagem
export const listDepartamentosQuerySchema = yup.object({
  ativo: yup
    .string()
    .oneOf(['true', 'false'], 'Parâmetro ativo deve ser "true" ou "false"')
}).strict().noUnknown('Parâmetros de consulta não permitidos foram enviados');