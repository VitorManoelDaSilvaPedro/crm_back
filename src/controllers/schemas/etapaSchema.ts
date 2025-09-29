import * as yup from 'yup';

export const createEtapaSchema = yup.object({
  nome: yup
    .string()
    .required('Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  ordem: yup
    .number()
    .required('Ordem é obrigatória')
    .integer('Ordem deve ser um número inteiro')
    .min(1, 'Ordem deve ser maior que 0'),
  id_board: yup
    .string()
    .required('ID do board é obrigatório')
    .uuid('ID do board deve ser um UUID válido')
}).strict().noUnknown('Campos não permitidos foram enviados');

export const etapaIdSchema = yup.object({
  id: yup
    .string()
    .required('ID é obrigatório')
    .uuid('ID deve ser um UUID válido')
}).strict().noUnknown('Parâmetros não permitidos foram enviados');