# Manual de Identidade Visual

> Este é o documento canônico de design do sistema. Define tokens, tipografia, grid, arredondamentos, modo escuro, responsividade e padrões de componentes. Toda tela criada deve seguir este guia — a consistência visual entre páginas diferentes é o objetivo central.

---

## 1. Filosofia de Design: "SaaS Premium & Moderno"

A estética é baseada em **sofisticação tecnológica**, **ritmo visual** e **hierarquia clara**. Inspiração em produtos como Linear, Vercel e macOS Sonoma: layouts assimétricos com personalidade, mas nunca caóticos.

### 1.1 Princípios Fundamentais

1. **Tokens acima de tudo** — zero cores raw, zero tamanhos hard-coded. Sempre `brand-500`, nunca `#1cc39d` ou `bg-emerald-500`.
2. **Modo escuro nativo** — cada componente é projetado para os dois temas simultaneamente. Dark não é um afterthought.
3. **Hierarquia imediata** — o usuário entende a importância dos elementos em menos de 1 segundo, via escala, peso e contraste.
4. **Respiro deliberado** — whitespace é parte do design, não ausência de conteúdo.
5. **Micro-interações obrigatórias** — hover, foco e transições de estado são mandatórios em qualquer elemento interativo.
6. **Consistência cross-page** — a mesma regra aplicada numa página deve ser aplicada em todas as outras. Sem estilos únicos por página.

---

## 2. Design Tokens: A Paleta Estrita

### 2.1 Regra de Ouro

> **Nunca use cores do Tailwind diretamente** (`bg-slate-500`, `text-gray-700`, `border-zinc-200`). Use exclusivamente os tokens semânticos configurados em `.tooling/frontend/tailwind.config.cjs`.

Isso garante que a troca de tema (light/dark) funcione automaticamente e que a identidade visual seja consistente em todas as telas.

### 2.2 Tokens de Cor

| Token | Propósito | Light | Dark |
| :--- | :--- | :--- | :--- |
| **brand-500** | Cor principal — CTAs, destaques, ícones ativos | `#1cc39d` | `#1cc39d` |
| **brand-600** | Hover sobre brand (contraste AA garantido) | `#11967c` | `#11967c` |
| **brand-500/10** | Fundo sutil de destaque | Alpha 0.1 | Alpha 0.1 |
| **brand-500/15** | Fundo de destaque no dark | — | Alpha 0.15 |
| **background-50** | Superfície alternada / fundo de seção | `#f9fafb` | — |
| **background-100** | Hover de itens, fundo de inputs | `#f3f4f6` | — |
| **background-800** | Surface secundária no dark | — | `#1f2937` |
| **background-900** | Surface de cards no dark | — | `#111827` |
| **background-950** | Fundo de página no dark | — | `#030712` |
| **typography-950** | Títulos e texto de ênfase | `#171717` | `#f9fafb` |
| **typography-600** | Corpo de texto neutro | `#525252` | `#d4d4d4` |
| **typography-400** | Texto secundário/muted | `#a3a3a3` | `#737373` |
| **outline-100** | Bordas no light | `#f3f4f6` | — |
| **outline-900** | Bordas no dark | — | `#1f2937` |
| **success-500** | Estados de sucesso | `#22c55e` | `#22c55e` |
| **error-500** | Estados de erro | `#ef4444` | `#ef4444` |
| **warning-500** | Estados de alerta | `#f59e0b` | `#f59e0b` |

### 2.3 Uso da Cor Brand

A cor `brand` é o fio condutor de toda a interface. Aplique-a em:

- Botões primários, ícones de ação, indicadores de progresso
- Item ativo em menus e tabs (`bg-brand-500/10 text-brand-600 dark:text-brand-400`)
- Bordas de foco (`focus:ring-brand-500`)
- Badges de destaque, glows de seção, blobs decorativos
- Underlines de links ativos, linhas de divisão em tabelas com destaque

**Quando usar variantes de brand:**

| Situação | Token |
| :--- | :--- |
| Fundo de botão primário | `bg-brand-500 hover:bg-brand-600` |
| Fundo sutil (badge, chip, ativo) | `bg-brand-500/10` |
| Texto de destaque | `text-brand-600 dark:text-brand-400` |
| Borda de foco | `ring-brand-500/50` |
| Glow/sombra decorativa | `shadow-brand-500/20` |

---

## 3. Tipografia e Ritmo Visual

### 3.1 Famílias de Fonte

- **Headings — Poppins:** `font-poppins` para H1 a H3. Estilo padrão: `font-black` (900) com `tracking-tight`.
- **Body — Lato:** `font-lato` para parágrafos, labels e textos de interface. Estilo padrão: `font-medium` (500).

**Nunca misturar fontes** — Poppins exclusivo para headings, Lato para todo o resto.

### 3.2 Escala de Headings

| Nível | Uso | Classes |
| :--- | :--- | :--- |
| **Display (H1 hero)** | Títulos de hero, destaque máximo | `text-4xl sm:text-6xl font-black leading-[1.1] tracking-tight` |
| **H1 de página** | Título principal de cada tela | `text-3xl sm:text-4xl font-black leading-tight` |
| **H2 de seção** | Divisões de conteúdo | `text-2xl font-bold` |
| **H3 de card** | Títulos de cards e panels | `text-xl font-bold` |
| **H4 de subitem** | Subtítulos, grupos | `text-lg font-semibold` |
| **Label de seção** | Labels de categoria, eyebrow | `text-xs font-bold uppercase tracking-widest text-typography-400` |

### 3.3 Escala de Texto (Body)

| Tamanho | Uso |
| :--- | :--- |
| `text-lg leading-relaxed` | Descrições de hero, parágrafos de introdução |
| `text-base` | Corpo de texto padrão |
| `text-sm` | Metadados, rodapés, labels de inputs |
| `text-xs font-bold uppercase` | Badges, etiquetas de status, eyebrow labels |

### 3.4 Regras de Peso

- `font-black` (900): headings principais e displays
- `font-bold` (700): sub-headings e destaques em body
- `font-semibold` (600): labels, itens de menu ativos
- `font-medium` (500): corpo padrão
- Nunca usar `font-light` ou `font-thin` — perdem legibilidade no dark mode

---

## 4. Sistema de Arredondamento (Hierarquia L1–L4)

A hierarquia de `border-radius` comunica importância e camada. Elementos mais próximos do usuário têm arredondamento maior.

| Nível | Token Tailwind | Uso |
| :--- | :--- | :--- |
| **L1** | `rounded-md` | Inputs, selects, tags, badges pequenos |
| **L2** | `rounded-lg` / `rounded-xl` | Cards, dropdowns, tooltips |
| **L3** | `rounded-xl` | Painéis destacados, banners, modais internos |
| **L4** | `rounded-2xl` | Modais, drawers, hero containers |

**Regra:** nunca use `rounded-full` em retângulos — apenas em pills e avatares circulares. Nunca use `rounded` (sem sufixo) — sem distinção visual.

---

## 5. Espaçamento e Ritmo de Layout

### 5.1 Escala de Padding

| Contexto | Classes |
| :--- | :--- |
| Seção de página | `py-16 sm:py-24 lg:py-32` |
| Interior de card padrão | `p-6 sm:p-8` |
| Interior de card compacto | `p-4 sm:p-5` |
| Container horizontal de página | `px-4 sm:px-6 lg:px-8` |
| Gap vertical entre seções | `gap-6` padrão, `gap-10` grande |
| Gap horizontal entre elementos | `gap-4` padrão |

### 5.2 Primitivos de Layout

Use sempre os componentes `VStack`, `HStack` e `Box` do sistema — nunca `div` com flexbox manual nas páginas. Isso garante consistência de espaçamento e facilita manutenção.

```tsx
// ✅ Correto
<VStack gap={6}>
  <HStack gap={4} align="center">
    ...
  </HStack>
</VStack>

// ❌ Proibido
<div className="flex flex-col gap-6">
  <div className="flex items-center gap-4">
```

---

## 6. Bento Grid — Grelhas Assimétricas

O padrão de layout principal para dashboards, landing pages e listagens é o **Bento Grid**: cards de tamanhos diferentes organizados em uma grade, criando ritmo visual sem monotonia. Referência direta: macOS Sonoma, Linear.app.

### 6.1 Filosofia do Bento Grid

- Cards com larguras e alturas variadas compartilham a mesma grade base
- A assimetria cria hierarquia visual: cards maiores = mais importantes
- A grade deve "respirar" — não preencha todas as células, deixe espaço estratégico
- Em mobile, todos os cards empilham em 1 coluna (sem exceção)

### 6.2 Grade Base (12 colunas)

```tsx
<div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
  {/* Card destaque — ocupa 8/12 (2/3 da largura) */}
  <div className="md:col-span-8 ...">...</div>

  {/* Card lateral — ocupa 4/12 (1/3 da largura) */}
  <div className="md:col-span-4 ...">...</div>

  {/* Card médio — ocupa 5/12 */}
  <div className="md:col-span-5 ...">...</div>

  {/* Card médio — ocupa 7/12 */}
  <div className="md:col-span-7 ...">...</div>

  {/* Três cards iguais — 4/12 cada */}
  <div className="md:col-span-4 ...">...</div>
  <div className="md:col-span-4 ...">...</div>
  <div className="md:col-span-4 ...">...</div>
</div>
```

### 6.3 Padrões de Composição Bento

**Padrão Hero+Lateral (principal com sidebar de suporte):**
```
┌──────────────────────────┬───────────────┐
│  col-span-8              │  col-span-4   │
│  Card Principal          │  Card Info    │
│  (height: auto)          │  (igual)      │
└──────────────────────────┴───────────────┘
```

**Padrão Trio Assimétrico:**
```
┌───────┬────────────────────────────────┐
│ col-4 │  col-8                         │
│ Info  │  Card Destaque com gráfico     │
├───────┴──────────┬─────────────────────┤
│  col-6           │  col-6              │
│  Card Médio      │  Card Médio         │
└──────────────────┴─────────────────────┘
```

**Padrão Grade de Features (misto 3+2):**
```
┌──────────┬──────────┬──────────┐
│  col-4   │  col-4   │  col-4   │
├──────────┴──────────┬──────────┤
│  col-8              │  col-4   │
└─────────────────────┴──────────┘
```

### 6.4 Card Bento — Anatomy

Todo card no sistema segue este anatomy:

```tsx
<Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30 hover:border-brand-500/30">
  <CardHeader className="pb-2">
    {/* Eyebrow / categoria */}
    <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
      Categoria
    </span>
    <CardTitle>Título do Card</CardTitle>
  </CardHeader>
  <CardContent>
    <CardDescription>Descrição do conteúdo do card.</CardDescription>
  </CardContent>
</Card>
```

### 6.5 Card com Ícone (Feature Card)

```tsx
<Card className="group">
  <CardContent className="p-6">
    {/* Ícone — Box é primitivo de layout, não tem equivalente Shadcn */}
    <Box className="size-11 rounded-lg bg-brand-500/10 flex items-center justify-center mb-4
                    group-hover:bg-brand-500/20 transition-colors duration-300">
      <IcoPrincipal className="size-5 text-brand-500" strokeWidth={2} />
    </Box>
    <CardTitle className="text-lg">Título</CardTitle>
    <CardDescription className="mt-1">Descrição.</CardDescription>
  </CardContent>
</Card>
```

### 6.6 Card de Destaque (com Glow)

Para o card principal do bento — o de maior col-span:

```tsx
<Card className="relative overflow-hidden">
  {/* Blob decorativo — div mantido por ser elemento puramente posicional */}
  <div className="absolute -top-20 -right-20 size-64 bg-brand-500/[0.07]
                  rounded-full blur-[80px] pointer-events-none" />
  <CardContent className="relative z-10 p-8">
    {/* conteúdo */}
  </CardContent>
</Card>
```

---

## 7. Botões

### 7.1 Variantes

| Variante | Uso | Classes |
| :--- | :--- | :--- |
| **Primary** | Ação principal da tela | `bg-brand-500 hover:bg-brand-600 text-white font-semibold` |
| **Secondary** | Ação secundária | `bg-background-100 dark:bg-background-800 text-typography-950 dark:text-white hover:bg-background-200 dark:hover:bg-background-700` |
| **Outline** | Ação terciária | `border border-outline-100 dark:border-outline-900 hover:border-brand-500/50 hover:bg-brand-500/5` |
| **Ghost** | Ações de baixa prioridade | `text-typography-600 hover:bg-background-100 dark:hover:bg-background-800` |
| **Destructive** | Ações destrutivas | `bg-error-500 hover:bg-error-600 text-white` |

### 7.2 Tamanhos

| Tamanho | Classes |
| :--- | :--- |
| `sm` | `h-8 px-3 text-xs rounded-md` |
| `md` (padrão) | `h-10 px-4 text-sm rounded-lg` |
| `lg` | `h-12 px-6 text-base rounded-lg` |
| `xl` | `h-14 px-8 text-base rounded-xl` |

### 7.3 Regras de Uso

- Todo botão primário usa **exclusivamente** `brand` — nunca outra cor
- Nunca dois botões primários na mesma view — um por tela/modal
- Ícone dentro de botão: `size-4` à esquerda do texto, `gap-2` entre ícone e label
- Estado de loading: substituir label por `<Spinner className="size-4 animate-spin" />` + texto "Aguarde..."

---

## 8. Badges e Status

### 8.1 Status Semânticos

| Status | Light | Dark |
| :--- | :--- | :--- |
| **Success** | `bg-success-100/80 text-success-700` | `bg-success-900/20 text-success-400` |
| **Error** | `bg-error-100/80 text-error-700` | `bg-error-900/20 text-error-400` |
| **Warning** | `bg-warning-100/80 text-warning-700` | `bg-warning-900/20 text-warning-400` |
| **Brand / Info** | `bg-brand-500/10 text-brand-700` | `bg-brand-500/15 text-brand-400` |
| **Neutro** | `bg-background-100 text-typography-600` | `bg-background-800 text-typography-400` |

### 8.2 Anatomia do Badge

```tsx
<Badge className="bg-brand-500/10 text-brand-700 dark:text-brand-400 uppercase tracking-wide border-brand-500/20">
  <span className="size-1.5 rounded-full bg-brand-500 mr-1" />
  Ativo
</Badge>
```

---

## 9. Animações e Micro-interações (Framer Motion)

### 9.1 Variantes Canônicas

Definir no arquivo `web/shared/utils/animacoes.ts` e importar em qualquer componente:

```typescript
// Entrada padrão (elementos de página, cards)
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

// Entrada stagger para listas de cards
export const containerStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

// Spring para modais e drawers
export const springModal = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
}

// Slide lateral (navegação mobile, painéis)
export const slideLateral = (direcao: 'esquerda' | 'direita') => ({
  initial: { x: direcao === 'direita' ? '100%' : '-100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { type: 'spring', damping: 28, stiffness: 280 } },
  exit: { x: direcao === 'direita' ? '-100%' : '100%', opacity: 0, transition: { duration: 0.2 } },
})
```

### 9.2 Regras de Animação

- **Entrada de seção:** `whileInView` com `viewport={{ once: true, amount: 0.15 }}` — anima só quando visível, não repete.
- **Listas de cards:** sempre usar `containerStagger` no container + `fadeInUp` nos filhos.
- **Modais/Drawers:** sempre `AnimatePresence` + `springModal`.
- **Transições de hover:** `transition-all duration-300` no CSS — não usar Framer Motion para hover simples.
- **Nunca:** animar cor ou border-color com Framer Motion — usar `transition-colors` do Tailwind.

### 9.3 Hover Padrão de Cards

```tsx
className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30 hover:border-brand-500/30"
```

---

## 10. Dark Mode

### 10.1 Princípios

- **Fundo de página:** `bg-white dark:bg-background-950`
- **Surface de card:** `bg-white dark:bg-background-900`
- **Surface secundária:** `bg-background-50 dark:bg-background-800`
- **Bordas:** nunca brancas ou pretas puras. Sempre `outline-100` (light) / `outline-900` (dark)
- **Texto:** `text-typography-950 dark:text-white` para títulos; `text-typography-600 dark:text-typography-400` para corpo

### 10.2 Glassmorphism (Elementos Flutuantes)

Para headers, sidebars flutuantes, modais e painéis sobrepostos:

```tsx
className="bg-white/80 dark:bg-background-900/80 backdrop-blur-xl
           border border-outline-100 dark:border-outline-900"
```

### 10.3 Blobs Decorativos

Glows de fundo devem ser subliminares. Nunca visíveis como formas definidas:

```tsx
{/* Glow de hero */}
<div className="absolute -top-40 right-0 size-96 bg-brand-500/[0.06] rounded-full blur-[120px] pointer-events-none" />

{/* Accent de seção */}
<div className="absolute inset-0 bg-brand-500/[0.03] blur-[80px] pointer-events-none" />
```

### 10.4 Regras de Sobriedade no Dark

- Nunca use `bg-black` puro — use `background-950`
- Nunca use `text-white` puro em body — use `text-typography-950 dark:text-white` (via token)
- Sombras no dark: `shadow-black/30` a no máximo `shadow-black/50` — nunca mais opaco
- Gradientes: limite a 2 stops com opacidade baixa (`/10` a `/20`)

---

## 11. Responsividade e Mobile

### 11.1 Filosofia Mobile-First

Toda CSS deve ser escrita mobile-first, expandindo para `sm:`, `md:`, `lg:`. Nunca adicionar classes mobile como "exceção" de um layout desktop.

```tsx
// ✅ Correto — parte do mobile, expande pro desktop
<div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">

// ❌ Errado — desktop como base, mobile como override
<div className="grid grid-cols-12 gap-6 max-md:grid-cols-1">
```

### 11.2 Breakpoints

| Breakpoint | Largura | Uso |
| :--- | :--- | :--- |
| (base) | 0px+ | Mobile — 1 coluna, full-width |
| `sm:` | 640px+ | Landscape mobile / tablet pequeno |
| `md:` | 768px+ | Tablet — 2 colunas mínimo |
| `lg:` | 1024px+ | Desktop — layout completo |
| `xl:` | 1280px+ | Desktop largo — expansão opcional |

### 11.3 Bento no Mobile

No mobile, o Bento Grid **sempre** colapsa para 1 coluna:

```tsx
// A grade 12-colunas vira lista linear no mobile
<div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
  <div className="md:col-span-8">...</div>   {/* full-width no mobile */}
  <div className="md:col-span-4">...</div>   {/* full-width no mobile */}
</div>
```

A ordem visual no mobile segue a ordem do DOM — posicione o conteúdo mais importante primeiro no HTML.

### 11.4 Padding Mínimo Mobile

- **Nunca** menos de `px-4` no container principal de qualquer tela
- Texto legível: mínimo `text-sm` — nunca `text-xs` para body em mobile
- Botões: mínimo `h-10` no mobile — alvos de toque de no mínimo 44px

### 11.5 Navegação Mobile (FAB)

Quando uma página tem navegação lateral complexa (tabs, seções), substituir por **FAB flutuante** no mobile:

```tsx
{/* FAB — fixo no canto, abre drawer de navegação */}
<Button
  size="icon"
  className="fixed bottom-5 right-5 z-40 size-14 rounded-xl bg-brand-500 shadow-lg shadow-brand-500/30 lg:hidden"
>
  <Menu className="size-5" />
</Button>
```

---

## 12. Iconografia

### 12.1 Biblioteca Oficial

Exclusivamente `lucide-react`. Nunca misturar com outras bibliotecas de ícones.

### 12.2 Escala de Tamanhos

| Tamanho | Uso |
| :--- | :--- |
| `size-3.5` | Labels inline, badges de texto |
| `size-4` | Botões, itens de lista, inputs |
| `size-5` | Ícones de cards padrão |
| `size-6` | Ícones de navegação |
| `size-7` / `size-8` | Empty states, features secundárias |
| `size-9` / `size-10` | Features em cards de destaque |
| `size-12`+ | Hero icons, ícones principais de seção |

### 12.3 Stroke Width

- `strokeWidth={2}`: padrão universal
- `strokeWidth={2.5}`: ícones de marca ou estados destacados
- `strokeWidth={1.5}`: ícones grandes (hero, empty state) — mais elegante em tamanhos maiores
- `strokeWidth={3}`: somente ícones muito pequenos (≤ 14px)

---

## 13. Consistência Visual entre Páginas

Cada página tem necessidades distintas — este guia não impõe uma estrutura rígida de implementação. O objetivo é que a **linguagem visual** seja coerente em todo o sistema.

### 13.1 Princípios de Consistência

- **Tokens sempre** — mesma paleta de cores, tipografia e espaçamento em todas as telas, sem exceção
- **Bento Grid como padrão** — ao exibir múltiplos cards ou blocos de conteúdo, preferir o grid assimétrico ao grid uniforme
- **Hierarquia visual** — manter a sequência eyebrow → título → subtítulo → ação onde uma funcionalidade é apresentada
- **Sem estilos únicos por página** — se um padrão visual existe em uma tela, ele deve existir em todas as telas semelhantes

### 13.2 Regra de Componentes (Obrigatório)

> Nunca usar elementos HTML crus onde existe um componente Shadcn equivalente.

| Elemento proibido | Componente Shadcn |
| :--- | :--- |
| `<button>` | `<Button>` |
| `<input>` | `<Input>` |
| `<select>` | `<Select>` |
| `<table>`, `<tr>`, `<td>` | `<Table>`, `<TableRow>`, `<TableCell>` |
| `<dialog>` | `<Dialog>` / `<Drawer>` |
| Span com estilo de badge | `<Badge>` |

**Exceções aceitas** (sem componente Shadcn equivalente):
- `div` para containers de CSS Grid (`.grid grid-cols-*`)
- `div` para elementos puramente decorativos (blobs, overlays de fundo)
- `VStack` / `HStack` / `Box` para qualquer flexbox de layout

### 13.3 Layout Sidebar + Conteúdo

Para telas com navegação lateral, o visual esperado é:

```
Desktop (lg+):
┌──────────────────────────────────────────────┐
│ sidebar (w-56/w-60, sticky)  │  conteúdo     │
│                              │  (flex-1)      │
└──────────────────────────────────────────────┘

Mobile: sidebar hidden → FAB → Drawer fullscreen
```

---

## 14. Modais Responsivos

### 14.1 Regra Universal

**Todo modal que abre em desktop como Dialog deve abrir em mobile como Drawer (bottom sheet).** Nunca um Dialog em tela toda no mobile.

Implemente com:
```tsx
const isDesktop = useMediaQuery('(min-width: 768px)')
return isDesktop ? <Dialog>...</Dialog> : <Drawer>...</Drawer>
```

### 14.2 Dialog Desktop

```
max-w-xl a max-w-5xl (conforme conteúdo)
rounded-xl a rounded-2xl
shadow-[0_32px_128px_-32px_rgba(0,0,0,0.5)]
```

Botão de fechar:
```tsx
<Button variant="ghost" size="icon" className="absolute top-6 right-6 size-9 rounded-lg hover:rotate-90 transition-all duration-300">
  <X className="size-4" />
</Button>
```

### 14.3 Drawer Mobile (Bottom Sheet)

```
h-[90vh] a h-[95vh]
rounded-t-xl
Handle bar: w-12 h-1 bg-background-200 dark:bg-background-700 rounded-full mx-auto mt-3
```

---

## 15. Formulários

### 15.1 Anatomia de Campo

```tsx
<FormField>
  <FormLabel>
    Label do Campo
    <span className="text-error-500 ml-0.5">*</span>
  </FormLabel>

  <Input
    placeholder="..."
    className="focus:ring-brand-500/40 focus:border-brand-500"
  />

  <FormMessage className="text-xs text-error-500 flex items-center gap-1">
    <AlertCircle className="size-3 mr-1" />
    Mensagem de erro aqui.
  </FormMessage>
</FormField>
```

### 15.2 Regras

- Altura padrão de inputs: `h-10`; grande: `h-12`
- Sempre `border-brand-500` no estado `focus` — nunca `focus:ring-blue-500`
- Campos com erro: `border-error-500 focus:ring-error-500/40`
- Campos desabilitados: `opacity-50 cursor-not-allowed`

---

## 16. Subflow e Estados de Carregamento

### 16.1 Regra

**Nunca usar spinner isolado** como único indicador de carregamento. Sempre usar `<Subflow />` que replica a estrutura do conteúdo que está carregando.

```tsx
// Subflow de card bento
<Card className="p-6 space-y-4">
  <Subflow className="h-4 w-24 rounded-md" />       {/* eyebrow */}
  <Subflow className="h-7 w-3/4 rounded-lg" />      {/* título */}
  <Subflow className="h-4 w-full rounded-md" />     {/* linha de texto */}
  <Subflow className="h-4 w-5/6 rounded-md" />
</Card>
```

### 16.2 Estado Vazio (Empty State)

```tsx
<VStack align="center" justify="center" className="py-20 gap-4 text-center">
  <Box className="size-16 rounded-lg bg-background-100 dark:bg-background-800
                  flex items-center justify-center">
    <IcoVazio className="size-8 text-typography-400" strokeWidth={1.5} />
  </Box>
  <VStack gap={1}>
    <p className="text-base font-semibold text-typography-950 dark:text-white">
      Nenhum item encontrado
    </p>
    <p className="text-sm text-typography-400">
      Descrição do estado vazio e o que o usuário pode fazer.
    </p>
  </VStack>
  <Button size="sm">Criar primeiro item</Button>
</VStack>
```

---

## 17. Tabelas

### 17.1 Estrutura Padrão

```tsx
<div className="rounded-xl border border-outline-100 dark:border-outline-900 overflow-hidden">
  <Table>
    <TableHeader className="bg-background-50 dark:bg-background-900">
      <TableRow>
        <TableHead className="text-xs font-bold uppercase tracking-wider text-typography-400">
          Coluna
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow className="hover:bg-background-50 dark:hover:bg-background-900/50">
        <TableCell className="text-typography-950 dark:text-white">
          Valor
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

### 17.2 Toolbar de Filtros

Sempre acima das tabelas:

```
[Ícone filtro] [Select] [Select] [Input busca] · · · [Limpar ×]
```

- Altura uniforme: `h-9` para todos os controles
- Texto: `text-sm`
- Botão "Limpar": visível **somente** quando há filtro ativo — `text-error-500`
- Container: `flex items-center gap-2 flex-wrap`

---

## 18. Checklist de Review (Zero Compromisso)

Antes de fazer PR ou considerar qualquer componente/tela finalizado:

**Tokens e Cores**
- [ ] Zero cores raw do Tailwind (`slate`, `gray`, `blue`, `green` etc.)? Somente tokens do sistema?
- [ ] Cor brand usada em todos os elementos interativos e de destaque?
- [ ] Bordas usando somente `outline-100` (light) / `outline-900` (dark)?

**Dark Mode**
- [ ] Funciona corretamente em Light E Dark Mode?
- [ ] Fundos usando `background-*` tokens (nunca `bg-black` ou `bg-white` puro)?
- [ ] Textos usando `typography-*` tokens?

**Tipografia**
- [ ] Poppins exclusivamente em headings? Lato no body?
- [ ] Hierarquia de peso respeitada (black para H1, bold para H2, medium para body)?
- [ ] `text-xs` nunca usado como body em mobile?

**Layout e Grid**
- [ ] Grade Bento colapsa para 1 coluna no mobile?
- [ ] Padding mínimo `px-4` no mobile?
- [ ] `VStack`/`HStack`/`Box` primitivos usados (sem `div` com flex manual)?

**Arredondamentos**
- [ ] Hierarquia L1–L4 respeitada?
- [ ] `rounded-full` apenas em pills e avatares circulares?

**Componentes**
- [ ] Apenas 1 botão primário por view?
- [ ] Todos os `button`, `input`, `select`, `table` substituídos por componentes Shadcn equivalentes?
- [ ] Hover effects em todos os elementos interativos?
- [ ] Animação de entrada em seções com `whileInView`?
- [ ] Subflows replicam a estrutura do conteúdo real?
- [ ] Modal tem variante Dialog (desktop) + Drawer (mobile)?

**Responsividade**
- [ ] CSS escrito mobile-first (`sm:`, `md:`, `lg:` expandindo)?
- [ ] FAB considerado para navegação complexa no mobile?
- [ ] Alvos de toque mínimo de 44px em elementos clicáveis mobile?
