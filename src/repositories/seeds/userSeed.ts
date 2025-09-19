import { DatabaseFactory } from '../../factories/DatabaseFactory';
import { UsuarioService } from '../../services/UsuarioService';

export class UserSeed {
    private usuarioService: UsuarioService;

    constructor() {
        this.usuarioService = new UsuarioService();
    }

    async run(): Promise<void> {
        // Só executa em desenvolvimento ou teste, mas não durante testes automatizados
        if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
            return;
        }

        try {
            await DatabaseFactory.connect();

            // Verificar se já existe usuário admin
            const usuarios = await this.usuarioService.listarUsuarios();
            const adminExists = usuarios.some(user => user.email === 'admin@crm.com');

            if (adminExists) {
                console.log('👤 Usuário admin já existe, seed não executado');
                return;
            }

            // Criar usuário admin padrão
            const adminUser = {
                nome: 'Administrador',
                email: 'admin@crm.com',
                celular: '(11) 99999-9999',
                senha: 'admin123',
                nivel: 'admin' as const,
                codigo: 'ADMIN001'
            };

            await this.usuarioService.criarUsuario(adminUser);
            console.log('✅ Usuário admin criado com sucesso');
            console.log('📧 Email: admin@crm.com');
            console.log('🔑 Senha: admin123');

        } catch (error) {
            console.error('❌ Erro ao executar seed:', error);
        } finally {
            await DatabaseFactory.disconnect();
        }
    }
}

// Executar seed se chamado diretamente
if (require.main === module) {
    const seed = new UserSeed();
    seed.run();
}