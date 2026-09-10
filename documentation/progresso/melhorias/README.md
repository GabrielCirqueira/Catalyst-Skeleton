# Como registrar melhorias

Este diretório concentra o histórico de melhorias pontuais do Catalyst Skeleton (correções, refinamentos de UI/UX, ajustes de DevOps etc.).

Grandes features, épicos e migrações estruturais **não** entram aqui — vão para o [ROADMAP.md](../../../ROADMAP.md).

## Estrutura

| Arquivo | Conteúdo |
|---|---|
| [MELHORIAS.md](MELHORIAS.md) | Índice central com todas as melhorias (M1, M2, …) |
| [MELHORIAS_1.md](MELHORIAS_1.md) | Detalhamento das melhorias **M1–M20** |
| [MELHORIAS_N.md](MELHORIAS_N.md) | Próximos blocos de 20 melhorias cada |

Cada arquivo sequencial agrupa **até 20 melhorias**.

## Fluxo para registrar uma nova melhoria

### 1. Definir o próximo ID

Consulte a tabela em [MELHORIAS.md](MELHORIAS.md) e use o próximo número livre (ex.: se o último é **M3**, a nova será **M4**).

### 2. Adicionar a linha no índice central

Em [MELHORIAS.md](MELHORIAS.md):

```markdown
| M4 | Título curto da melhoria | ✅ Concluído | DD/MM/AAAA | [ver](MELHORIAS_1.md) |
```

### 3. Escolher o arquivo sequencial

- Melhorias **M1–M20** → `MELHORIAS_1.md`
- Melhorias **M21–M40** → `MELHORIAS_2.md`
- E assim por diante (`fileIndex = ceil(N / 20)`)

Se o último arquivo já tiver **20 melhorias**, crie o próximo e atualize a lista de links no topo de [MELHORIAS.md](MELHORIAS.md).

### 4. Escrever o detalhamento

No final do arquivo escolhido:

```markdown
### ✅ Melhoria 4 — Título descritivo

- **Status**: Concluído
- **Data**: 10 de setembro de 2026
- **Problema**: O que estava errado ou faltando.
- **Solução**: O que foi feito.
- **Arquivos**: `caminho/arquivo.tsx`, `caminho/arquivo.php`

---
```

> Não indentar o conteúdo com espaços no início da linha — vira bloco de código no preview Markdown.

### 5. Atualizar documentação relacionada

Se a melhoria alterar contrato ou regra de negócio:

- Frontend (React / UI / Hooks) → [FRONTEND.md](../../stack/FRONTEND.md)
- Backend (Symfony / PHP) → [BACKEND.md](../../stack/BACKEND.md)
- Visão global → [DOCUMENTACAO_TECNICA.md](../../referencia/DOCUMENTACAO_TECNICA.md)

## Convenções

- **ID:** prefixo `M` + número sequencial (`M1`).
- **Status:** `✅ Concluído`, `🔄 Em andamento` ou `⏳ Pendente`.
- **Data:** formato `DD/MM/AAAA` no índice; por extenso no detalhamento.
- **Um tópico = uma melhoria** — não agrupar correções distintas no mesmo `M`.

## Referência

O mesmo padrão de índice + arquivos paginados é usado em [PROGRESSO_ROADMAP.md](../PROGRESSO_ROADMAP.md).
