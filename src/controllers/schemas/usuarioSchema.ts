import * as yup from 'yup';

// Schema para criação de usuário
export const createUsuarioSchema = yup.object({
  nome: yup
    .string()
    .required('Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  foto: yup
    .string()
    .nullable()
    .url('Foto deve ser uma URL válida')
    .max(500, 'URL da foto deve ter no máximo 500 caracteres'),
  email: yup
    .string()
    .required('Email é obrigatório')
    .email('Email deve ter um formato válido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .lowercase()
    .trim(),
  celular: yup
    .string()
    .required('Celular é obrigatório')
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Celular deve estar no formato (XX) XXXXX-XXXX')
    .trim(),
  senha: yup
    .string()
    .required('Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  nivel: yup
    .string()
    .required('Nível é obrigatório')
    .oneOf(['admin', 'user'], 'Nível deve ser admin ou user')
    .trim(),
  codigo: yup
    .string()
    .nullable()
    .max(50, 'Código deve ter no máximo 50 caracteres')
    .trim()
}).strict().noUnknown('Campos não permitidos foram enviados');

// Schema para atualização de usuário
export const updateUsuarioSchema = yup.object({
  nome: yup
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  foto: yup
    .string()
    .nullable()
    .url('Foto deve ser uma URL válida')
    .max(500, 'URL da foto deve ter no máximo 500 caracteres'),
  email: yup
    .string()
    .email('Email deve ter um formato válido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .lowercase()
    .trim(),
  celular: yup
    .string()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Celular deve estar no formato (XX) XXXXX-XXXX')
    .trim(),
  senha: yup
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  nivel: yup
    .string()
    .oneOf(['admin', 'user'], 'Nível deve ser admin ou user')
    .trim(),
  codigo: yup
    .string()
    .nullable()
    .max(50, 'Código deve ter no máximo 50 caracteres')
    .trim()
}).strict().noUnknown('Campos não permitidos foram enviados');

// Schema para parâmetros de ID
export const usuarioIdSchema = yup.object({
  id: yup
    .string()
    .required('ID é obrigatório')
    .uuid('ID deve ser um UUID válido')
}).strict().noUnknown('Parâmetros não permitidos foram enviados');

// Schema para login
export const loginUsuarioSchema = yup.object({
  email: yup
    .string()
    .required('Email é obrigatório')
    .email('Email deve ter um formato válido')
    .lowercase()
    .trim(),
  senha: yup
    .string()
    .required('Senha é obrigatória')
}).strict().noUnknown('Campos não permitidos foram enviados');