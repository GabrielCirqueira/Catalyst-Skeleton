# 📈 CHANGELOG

Este arquivo registra as mudanças estruturais e evolutivas do **Catalyst Skeleton**.

## 📅 [2026-03-18] — Sincronização e Refatoração de Padrões

### 🚀 Novas Funcionalidades
*   **React 19**: Atualização oficial da stack do frontend.
*   **TanStack Query**: Definido como o padrão obrigatório para dados do servidor.
*   **Zustand**: Definido como padrão para estado global leve.
*   **Sonner**: Substituto oficial para sistemas de toast/notificações.
*   **Padrão de Paginação no Backend**: Seção 5.7.1 do Guia Geral agora descreve como implementar paginação que conversa com `RespostaPaginada<T>`.
*   **Padrão de Outbox**: Seção 5.11 com exemplo de código para persistência transacional de eventos.

### 🛠️ Refatorações (Estrutura de Pastas)
*   **Abolição de `web/hooks/` raiz**: Agora os hooks devem viver obrigatoriamente em `web/features/{feature}/hooks/` ou `web/shared/hooks/`.
*   **Abolição de `services/` global no frontend**: As chamadas de API agora vivem em `api.ts` dentro de cada feature ou shared.
*   **Checklist de PR Limpo**: Removidas referências a "services residuais" do checklist de PR na Seção 9 do Guia Geral.

### 🛡️ Qualidade & Documentação
*   **GUIDA-GERAL Canônico**: Resolvidas as contradições entre React 18 vs 19 e caminhos de pastas.
*   **Regras de Decisioning**: Adicionada regra clara de quando usar `TanStack Query` vs `useState` local vs `Zustand`.
*   **Documentação de Env Vars**: Centralizadas no README.md as variáveis críticas para o funcionamento do skeleton.

---
*Próximas melhorias: Automatização completa de testes de contrato com Pact ou similar.*
