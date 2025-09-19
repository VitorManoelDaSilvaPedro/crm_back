import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';

interface ValidationOptions {
  body?: yup.ObjectSchema<any>;
  params?: yup.ObjectSchema<any>;
  query?: yup.ObjectSchema<any>;
}

export const validate = (schemas: ValidationOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar body se schema fornecido
      if (schemas.body) {
        req.body = await schemas.body.validate(req.body, { 
          abortEarly: false,
          stripUnknown: false 
        });
      }

      // Validar params se schema fornecido
      if (schemas.params) {
        req.params = await schemas.params.validate(req.params, { 
          abortEarly: false,
          stripUnknown: false 
        });
      }

      // Validar query se schema fornecido
      if (schemas.query) {
        req.query = await schemas.query.validate(req.query, { 
          abortEarly: false,
          stripUnknown: false 
        });
      }

      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors = error.inner.map(err => ({
          field: err.path,
          message: err.message
        }));

        return res.status(400).json({
          message: 'Dados inválidos',
          errors
        });
      }

      return res.status(500).json({
        message: 'Erro interno do servidor'
      });
    }
  };
};