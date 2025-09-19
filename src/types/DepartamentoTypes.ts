import { Request, Response } from 'express';
import { Departamento } from '../models/Departamento';

export interface CreateDepartamentoRequest extends Request {
    body: {
        nome: string;
        icone?: string | undefined;
        ativo: boolean;
    };
}

export interface UpdateDepartamentoRequest extends Request {
    params: {
        id: string;
    };
    body: {
        nome?: string | undefined;
        icone?: string | undefined;
        ativo?: boolean | undefined;
    };
}

export interface GetDepartamentoRequest extends Request {
    params: {
        id: string;
    };
}

export interface ListDepartamentosRequest extends Request {
    query: {
        ativo?: string;
    };
}