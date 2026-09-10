# Progresso, Roadmap e Melhorias

Dois fluxos, sempre com **índice central + arquivos paginados** (no máximo 20 itens por arquivo).

| Fluxo | Quando usar | Índice | Páginas |
| :--- | :--- | :--- | :--- |
| **Roadmap** | Feature grande, épico, migração, regra de negócio | [PROGRESSO_ROADMAP.md](PROGRESSO_ROADMAP.md) | `PROGRESSO_ROADMAP_1.md`, `_2.md`, … |
| **Melhorias** | Bug, ajuste de UI, script, refino pontual | [MELHORIAS.md](melhorias/MELHORIAS.md) | `MELHORIAS_1.md`, `_2.md`, … |

O arquivo [ROADMAP.md](../../ROADMAP.md) na raiz é só o **lote que está em andamento**. Cada vez que começa um conjunto novo de tópicos, ele é **reescrito** — o histórico já concluído permanece no índice e nas páginas, não no `ROADMAP.md`.

Modelo pronto para copiar: [ROADMAP.TEMPLATE.md](ROADMAP.TEMPLATE.md).

---

## Como gerar um `ROADMAP.md`

O script `scripts/update_roadmap.py` lê o arquivo com regex. Qualquer desvio (título diferente, checklist sem negrito, ID fora da tabela) faz o tópico sumir do índice ou o lote não ser criado.

Copie o template, troque os números e os títulos, e mantenha **estas quatro peças, nesta ordem**:

### 1. Título do lote

```markdown
# Roadmap — Nome curto do lote
```

Use o travessão `—` (não o hífen `-`). O `make progresso` extrai o nome depois de `Roadmap —` para o cabeçalho da página paginada.

### 2. Faixa de IDs

```markdown
**Numeração:** tópicos 21–40.
```

- A linha precisa ter `Numeração:` e `tópicos INÍCIO–FIM`.
- O intervalo é o lote **atual**, não a história inteira do projeto.
- O primeiro ID do lote seguinte é o último ID já usado + 1 (depois do 20 vem o 21).
- Travessão `–` ou hífen `-` entre os números servem; o importante é haver dois inteiros.

### 3. Tabela `## Índice`

```markdown
## Índice

| # | Tópico |
|---|---|
| 21 | Título curto |
| 22 | Outro título |
```

Cada linha de dado: `| ID | Título |`

- Primeira célula = número inteiro (é o ID do tópico).
- Segunda célula = título curto, **igual** ao do checklist.
- Sem `[x]`, sem `Tópico 21 —`, sem coluna extra obrigatória.

Isso alimenta `make progresso`: títulos no índice e esqueleto da página paginada.

### 4. Checklist `## Checklist`

```markdown
## Checklist

- [ ] **21. Título curto**
- [x] **22. Outro título**
```

Uma linha por tópico, **exatamente** neste desenho:

`- [ ]` ou `- [x]` + espaço + `**` + `ID` + `.` + espaço + `título` + `**`

O `make progresso` só marca ✅ Concluído quando encontra `[x]` (ou `[X]`) nessa linha. A tabela do índice **não** define status.

| Funciona | Não funciona |
| :--- | :--- |
| `- [x] **21. Título**` | `- [x] 21. Título` |
| `- [ ] **22. Título**` | `- [x] **Tópico 21 — Título**` |
| | `- [x] **21 — Título**` |
| | `* [x] **21. Título**` |

### 5. Detalhamento (opcional para o script, obrigatório para quem vai implementar)

```markdown
### Tópico 21 — Título curto

**O que existe hoje:** o que o sistema faz (ou não faz) agora.

**Por que importa:** o custo de deixar como está.

**O que precisa acontecer:** o que deve existir quando o tópico fechar.
```

O script **não** lê essa seção. Ela existe para orientar a implementação. O registro do que de fato foi feito vai na página paginada (`PROGRESSO_ROADMAP_X.md`), não aqui.

---

## Sequência de trabalho

1. Copie [ROADMAP.TEMPLATE.md](ROADMAP.TEMPLATE.md) para a raiz como `ROADMAP.md` (ou reescreva o arquivo atual no mesmo formato).
2. Preencha título, `Numeração`, índice, checklist e detalhamento do lote.
3. `make progresso` — cria `PROGRESSO_ROADMAP_X.md` se ainda não existir e reconstrói o índice (sem apagar tópicos de lotes anteriores).
4. Implemente. Ao fechar um tópico: `[x]` no checklist **e** preencha o `###` correspondente na página paginada.
5. `make progresso` de novo — atualiza o status no índice.

Páginas: IDs 1–20 → `_1.md`; 21–40 → `_2.md`; 41–60 → `_3.md`.

Modelo na página paginada, depois de concluir:

```markdown
### ✅ Tópico 21 — Título curto
- **Status**: Concluído
- **Implementação**: o que mudou, em uma ou duas frases.
- **Arquivos**: `caminho/arquivo.tsx`, `caminho/arquivo.php`
```

Se a mudança alterar contrato ou regra: frontend → [FRONTEND.md](../stack/FRONTEND.md); backend → [BACKEND.md](../stack/BACKEND.md); visão global → [DOCUMENTACAO_TECNICA.md](../referencia/DOCUMENTACAO_TECNICA.md); pastas/UI → [Estruturação.md](../guias/Estruturação.md).

---

## Melhorias pontuais

Não vão no `ROADMAP.md`. Fluxo em [melhorias/README.md](melhorias/README.md): ID `M1`, `M2`, …, 20 por arquivo.
