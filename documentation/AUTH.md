# Autenticação e Segurança (JWT)

O Subflow utiliza uma estratégia de autenticação **stateless** baseada em **JWT (JSON Web Tokens)** com assinatura assimétrica **RS256** (RSA com SHA-256).

## Subsistema Backend
A segurança é garantida por dois bundles principais:
- **LexikJWTAuthenticationBundle**: Gerencia a emissão do `access_token` (curta duração).
- **GesdinetJWTRefreshTokenBundle**: Gerencia o `refresh_token` (longa duração, persistido no banco).

### Fluxo de Chaves (RSA)
As chaves privadas e públicas residem em `config/jwt/`.
- `private.pem`: Usada pelo backend para assinar tokens. **Nunca deve ser exposta.**
- `public.pem`: Pode ser usada para validar a assinatura sem possuir a chave privada.

Para gerar novas chaves (setup inicial):
```bash
php bin/console lexik:jwt:generate-keypair
```

### Endpoints de Autenticação
1. `POST /api/auth/login`: Recebe `username` e `senha`, retorna `token` e `refresh_token`.
2. `POST /api/auth/registro`: Cria novo usuário (público).
3. `POST /api/token/refresh`: Recebe o `refresh_token` e retorna um novo `access_token`.
4. `GET /api/auth/me`: Retorna os dados do usuário logado (requer `Bearer` token).

---

## Subsistema Frontend
O estado de autenticação é centralizado no **Zustand** (`web/stores/useAuthStore.ts`) e sincronizado com o `localStorage`.

### Persistência e Recuperação
O `useAuthStore` utiliza o middleware `persist`. Ao carregar a página:
1. O React recupera os tokens do `localStorage`.
2. O Axios Interceptor injeta o `token` em todas as requisições via header `Authorization: Bearer <token>`.

### Fluxo do Refresh Automático (`web/config/api.ts`)
Caso uma requisição retorne `401 Unauthorized`:
1. O interceptor de resposta pausa as requisições pendentes.
2. Dispara uma chamada silenciosa para `/api/token/refresh`.
3. Se bem-sucedido, atualiza o Store e re-executa as requisições pausadas.
4. Se falhar (refresh token expirado), o Store é limpo e o usuário é redirecionado para o login.

### Proteção de Rotas
Utilizamos o componente `RotaProtegida.tsx`:
```tsx
export function RotaProtegida() {
  const autenticado = useAuthStore(s => s.autenticado);
  return autenticado ? <Outlet /> : <Navigate to="/login" replace />;
}
```

## Resumo de Segurança
| Elemento | Detalhe |
| :--- | :--- |
| **Algoritmo** | RS256 (Asymmetric) |
| **Access Token TTL** | 1 hora |
| **Refresh Token TTL** | 30 dias |
| **Storage Frontend** | LocalStorage (via Zustand Persist) |
| **Firewall** | Stateless (JWT) |
