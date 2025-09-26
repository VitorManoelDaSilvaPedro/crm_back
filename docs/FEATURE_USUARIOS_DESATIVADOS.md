# Feature: Bloqueio de Login para Usuários Desativados

## Descrição
Esta feature implementa a funcionalidade que impede usuários desativados de fazerem login na plataforma, seguindo a arquitetura CSMR (Controller, Service, Model, Repository).

## Implementação

### Modificações Realizadas

#### 1. UsuarioService (`src/services/UsuarioService.ts`)
- **Método modificado**: `login(email: string, senha: string)`
- **Alteração**: Adicionada verificação do campo `ativo` do usuário
- **Comportamento**: Se `usuario.ativo === false`, lança erro "Usuário desativado"

```typescript
if (!usuario.ativo) {
    throw new Error('Usuário desativado');
}
```

#### 2. UsuarioController (`src/controllers/UsuarioController.ts`)
- **Método modificado**: `login(req: Request, res: Response)`
- **Alteração**: Tratamento do novo erro "Usuário desativado" com status HTTP 401
- **Comportamento**: Retorna status 401 tanto para credenciais inválidas quanto para usuário desativado

#### 3. Documentação Swagger (`src/routes/authRoutes.ts`)
- **Rota**: `POST /auth/login`
- **Alteração**: Atualizada documentação para incluir cenário de usuário desativado
- **Exemplos**: Adicionados exemplos para "Credenciais inválidas" e "Usuário desativado"

## Fluxo de Funcionamento

1. **Usuário tenta fazer login** → `POST /auth/login`
2. **Controller valida dados** → Validação de schema
3. **Service busca usuário** → `findByEmail()`
4. **Verificação de existência** → Se não existe: "Credenciais inválidas"
5. **Verificação de status** → Se `ativo === false`: "Usuário desativado"
6. **Verificação de senha** → Se incorreta: "Credenciais inválidas"
7. **Geração de tokens** → Login bem-sucedido

## Cenários de Teste

### Testes Unitários (`src/tests/usuarioService.test.ts`)
- ✅ Permitir login de usuário ativo com credenciais válidas
- ✅ Impedir login de usuário desativado
- ✅ Impedir login com email inexistente
- ✅ Impedir login com senha incorreta
- ✅ Não retornar senha no resultado do login

### Testes de Integração (`src/tests/auth.integration.test.ts`)
- ✅ Permitir login de usuário ativo
- ✅ Impedir login de usuário desativado
- ✅ Permitir login após reativar usuário
- ✅ Impedir login com credenciais inválidas
- ✅ Impedir login com senha incorreta

## Respostas da API

### Login Bem-sucedido (200)
```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "usuario": {
    "id": "uuid",
    "nome": "Nome do Usuário",
    "email": "email@exemplo.com",
    "ativo": true
  }
}
```

### Usuário Desativado (401)
```json
{
  "message": "Usuário desativado"
}
```

### Credenciais Inválidas (401)
```json
{
  "message": "Credenciais inválidas"
}
```

## Segurança

- **Não exposição de informações**: Tanto credenciais inválidas quanto usuário desativado retornam status 401
- **Verificação de ordem**: A verificação de usuário ativo acontece antes da verificação de senha
- **Consistência**: Mantém o mesmo padrão de resposta para diferentes tipos de erro de autenticação

## Reativação de Usuários

A funcionalidade de reativação já existia no sistema através do endpoint:
- `PATCH /usuarios/{id}/reativar`

Após a reativação (`ativo = true`), o usuário pode fazer login normalmente.

## Arquivos Modificados

1. `src/services/UsuarioService.ts` - Lógica de negócio
2. `src/controllers/UsuarioController.ts` - Tratamento de erros
3. `src/routes/authRoutes.ts` - Documentação Swagger
4. `src/tests/usuarioService.test.ts` - Testes unitários (novo)
5. `src/tests/auth.integration.test.ts` - Testes de integração (novo)

## Compatibilidade

- ✅ Mantém compatibilidade com funcionalidades existentes
- ✅ Não quebra contratos de API existentes
- ✅ Segue padrões de arquitetura do projeto (CSMR)
- ✅ Inclui testes unitários e de integração
- ✅ Documentação Swagger atualizada