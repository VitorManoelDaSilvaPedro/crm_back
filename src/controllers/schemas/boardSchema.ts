import * as yup from 'yup';

export const createBoardSchema = yup.object({
  nome: yup
    .string()
    .required('Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  ativo: yup
    .boolean()
    .optional()
    .default(true)
}).strict().noUnknown('Campos não permitidos foram enviados');

export const updateBoardSchema = yup.object({
  nome: yup
    .string()
    .required('Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim()
}).strict().noUnknown('Campos não permitidos foram enviados');

export const updateBoardStatusSchema = yup.object({
  ativo: yup
    .boolean()
    .required('Status ativo é obrigatório')
}).strict().noUnknown('Campos não permitidos foram enviados');

export const listBoardsQuerySchema = yup.object({
  ativo: yup
    .string()
    .optional()
    .oneOf(['true', 'false'], 'Parâmetro ativo deve ser "true" ou "false"')
}).strict().noUnknown('Parâmetros de consulta não permitidos foram enviados');

export const boardIdSchema = yup.object({
  id: yup
    .string()
    .required('ID é obrigatório')
    .uuid('ID deve ser um UUID válido')
}).strict().noUnknown('Parâmetros não permitidos foram enviados');