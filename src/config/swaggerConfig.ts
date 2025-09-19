import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CRM API',
            version: '1.0.0',
            description: 'API para sistema CRM',
        },
        servers: [
            {
                url: 'http://localhost:4000',
                description: 'Servidor de desenvolvimento',
            },
        ],
        components: {
            securitySchemes: {
                basicAuth: {
                    type: 'http',
                    scheme: 'basic'
                }
            },
            schemas: {
                Departamento: {
                    type: 'object',
                    required: ['nome', 'ativo'],
                    properties: {
                        id: {
                            type: 'string',
                            description: 'ID único do departamento'
                        },
                        nome: {
                            type: 'string',
                            description: 'Nome do departamento'
                        },
                        icone: {
                            type: 'string',
                            nullable: true,
                            description: 'Ícone do departamento'
                        },
                        ativo: {
                            type: 'boolean',
                            description: 'Status ativo/inativo'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Data de criação'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Data de atualização'
                        }
                    }
                },
                DepartamentoInput: {
                    type: 'object',
                    required: ['nome', 'ativo'],
                    properties: {
                        nome: {
                            type: 'string',
                            description: 'Nome do departamento'
                        },
                        icone: {
                            type: 'string',
                            description: 'Ícone do departamento'
                        },
                        ativo: {
                            type: 'boolean',
                            description: 'Status ativo/inativo'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Mensagem de erro'
                        }
                    }
                }
            }
        },
        security: [
            {
                basicAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);