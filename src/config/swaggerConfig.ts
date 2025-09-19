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
                },
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
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
                Usuario: {
                    type: 'object',
                    required: ['id', 'nome', 'email', 'celular', 'nivel'],
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID único do usuário'
                        },
                        nome: {
                            type: 'string',
                            description: 'Nome do usuário'
                        },
                        foto: {
                            type: 'string',
                            nullable: true,
                            description: 'URL da foto do usuário'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email do usuário'
                        },
                        celular: {
                            type: 'string',
                            description: 'Celular do usuário'
                        },
                        nivel: {
                            type: 'string',
                            enum: ['admin', 'user'],
                            description: 'Nível de acesso do usuário'
                        },
                        codigo: {
                            type: 'string',
                            nullable: true,
                            description: 'Código do usuário'
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
                UsuarioInput: {
                    type: 'object',
                    required: ['nome', 'email', 'celular', 'senha', 'nivel'],
                    properties: {
                        nome: {
                            type: 'string',
                            description: 'Nome do usuário'
                        },
                        foto: {
                            type: 'string',
                            description: 'URL da foto do usuário'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email do usuário'
                        },
                        celular: {
                            type: 'string',
                            description: 'Celular no formato (XX) XXXXX-XXXX'
                        },
                        senha: {
                            type: 'string',
                            description: 'Senha do usuário'
                        },
                        nivel: {
                            type: 'string',
                            enum: ['admin', 'user'],
                            description: 'Nível de acesso do usuário'
                        },
                        codigo: {
                            type: 'string',
                            description: 'Código do usuário'
                        }
                    }
                },
                UsuarioUpdateInput: {
                    type: 'object',
                    properties: {
                        nome: {
                            type: 'string',
                            description: 'Nome do usuário'
                        },
                        foto: {
                            type: 'string',
                            description: 'URL da foto do usuário'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email do usuário'
                        },
                        celular: {
                            type: 'string',
                            description: 'Celular no formato (XX) XXXXX-XXXX'
                        },
                        senha: {
                            type: 'string',
                            description: 'Nova senha do usuário'
                        },
                        nivel: {
                            type: 'string',
                            enum: ['admin', 'user'],
                            description: 'Nível de acesso do usuário'
                        },
                        codigo: {
                            type: 'string',
                            description: 'Código do usuário'
                        }
                    }
                },
                LoginInput: {
                    type: 'object',
                    required: ['email', 'senha'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email do usuário',
                            example: 'admin@crm.com'
                        },
                        senha: {
                            type: 'string',
                            description: 'Senha do usuário',
                            example: 'admin123'
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
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);