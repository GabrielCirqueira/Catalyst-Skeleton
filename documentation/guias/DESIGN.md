# Manual de Identidade Visual

> Este é o documento canônico de design do sistema. Define tokens, tipografia, grid, arredondamentos, modo escuro, responsividade e padrões de componentes. Toda tela criada deve seguir este guia — a consistência visual entre páginas diferentes é o objetivo central.

---

## 1. Filosofia de Design: "SaaS Premium & Moderno"

A estética é baseada em **sofisticação tecnológica**, **ritmo visual** e **hierarquia clara**. Inspiração em produtos como Linear, Vercel e macOS Sonoma: layouts assimétricos com personalidade, mas nunca caóticos.

### 1.1 Princípios Fundamentais

1. **Tokens acima de tudo** — zero cores raw, zero tamanhos hard-coded. Sempre `brand.solid`, nunca `#8b5cf6`.
2. **Modo escuro nativo** — cada componente é projetado para os dois temas simultaneamente. Dark não é um afterthought.
3. **Hierarquia imediata** — o usuário entende a importância dos elementos em menos de 1 segundo, via escala, peso e contraste.
4. **Respiro deliberado** — whitespace é parte do design, não ausência de conteúdo.
5. **Micro-interações obrigatórias** — hover, foco e transições de estado são mandatórios em qualquer elemento interativo.
6. **Consistência cross-page** — a mesma regra aplicada numa página deve ser aplicada em todas as outras. Sem estilos únicos por página.

---

## 2. Design Tokens: A Paleta Estrita

### 2.1 Regra de Ouro

> **Nunca use `className` nem hex.** Cores só da paleta gerada (`skeleton.grey.700`, `skeleton.brand.500`) em `web/config/theme/theme.ts`. `colorPalette` só com escalas dessa paleta.

Isso garante que a troca de tema (light/dark) funcione automaticamente e que a identidade visual seja consistente em todas as telas.

### 2.2 Tokens de Cor

Tokens semânticos (light/dark automático):

| Token | Propósito |
| :--- | :--- |
| **brand.solid** | Cor principal — CTAs, destaques |
| **brand.fg** | Texto e ícones brand |
| **brand.subtle** | Fundo sutil de destaque |
| **brand.muted** | Fundo/borda intermediária |
| **brand.focusRing** | Anel de foco |
| **bg** | Fundo de página |
| **bg.subtle** | Superfície alternada |
| **bg.muted** | Hover de itens, fundo de inputs |
| **bg.panel** | Surface de cards |
| **fg** | Títulos e texto de ênfase |
| **fg.muted** | Corpo de texto |
| **fg.subtle** | Texto secundário |
| **border** / **border.muted** | Bordas |
| **green.subtle** / **green.fg** | Sucesso |
| **red.subtle** / **red.fg** | Erro |
| **orange.subtle** / **orange.fg** | Alerta |

Paleta `brand` (hex em `theme.ts`): `50` `#f5f3ff` … `500` `#8b5cf6` … `600` `#7c3aed` … `950` `#2e1065`.

### 2.3 Uso da Cor Brand

A cor `brand` é o fio condutor de toda a interface. Aplique-a em:

- Botões primários, ícones de ação, indicadores de progresso
- Item ativo em menus e tabs (`bg="brand.subtle"` `color="brand.fg"`)
- Foco (`focusRing="brand.focusRing"`)
- Badges de destaque, glows de seção, blobs decorativos
- Underlines de links ativos, linhas de divisão em tabelas com destaque

**Quando usar variantes de brand:**

| Situação | Prop |
| :--- | :--- |
| Fundo de botão primário | `colorPalette="brand"` `variant="solid"` |
| Fundo sutil (badge, chip, ativo) | `bg="brand.subtle"` |
| Texto de destaque | `color="brand.fg"` |
| Borda de foco | `focusRing="brand.focusRing"` |
| Glow/sombra decorativa | `boxShadow="md"` + `colorPalette="brand"` |

---

## 3. Tipografia e Ritmo Visual

### 3.1 Famílias de Fonte

- **Headings — Poppins:** `fontFamily="heading"` para H1 a H3. Estilo padrão: `fontWeight="black"` com `letterSpacing="tight"`.
- **Body — Lato:** `fontFamily="body"` para parágrafos, labels e textos de interface. Estilo padrão: `fontWeight="medium"`.

**Nunca misturar fontes** — Poppins exclusivo para headings, Lato para todo o resto.

### 3.2 Escala de Headings

| Nível | Uso | Props |
| :--- | :--- | :--- |
| **Display (H1 hero)** | Títulos de hero, destaque máximo | `fontSize={{ base: '4xl', sm: '6xl' }}` `fontWeight="black"` `lineHeight="1.1"` `letterSpacing="tight"` |
| **H1 de página** | Título principal de cada tela | `fontSize={{ base: '3xl', sm: '4xl' }}` `fontWeight="black"` |
| **H2 de seção** | Divisões de conteúdo | `fontSize="2xl"` `fontWeight="bold"` |
| **H3 de card** | Títulos de cards e panels | `fontSize="xl"` `fontWeight="bold"` |
| **H4 de subitem** | Subtítulos, grupos | `fontSize="lg"` `fontWeight="semibold"` |
| **Label de seção** | Labels de categoria, eyebrow | `fontSize="xs"` `fontWeight="bold"` `textTransform="uppercase"` `letterSpacing="widest"` `color="fg.subtle"` |

### 3.3 Escala de Texto (Body)

| Tamanho | Uso |
| :--- | :--- |
| `fontSize="lg"` `lineHeight="relaxed"` | Descrições de hero, parágrafos de introdução |
| `fontSize="md"` | Corpo de texto padrão |
| `fontSize="sm"` | Metadados, rodapés, labels de inputs |
| `fontSize="xs"` `fontWeight="bold"` `textTransform="uppercase"` | Badges, etiquetas de status, eyebrow labels |

### 3.4 Regras de Peso

- `fontWeight="black"` (900): headings principais e displays
- `fontWeight="bold"` (700): sub-headings e destaques em body
- `fontWeight="semibold"` (600): labels, itens de menu ativos
- `fontWeight="medium"` (500): corpo padrão
- Nunca usar `fontWeight="light"` ou `"thin"` — perdem legibilidade no dark mode

---

## 4. Sistema de Arredondamento (Hierarquia L1–L4)

A hierarquia de `borderRadius` comunica importância e camada. Elementos mais próximos do usuário têm arredondamento maior.

| Nível | Prop | Uso |
| :--- | :--- | :--- |
| **L1** | `rounded="md"` | Inputs, selects, tags, badges pequenos |
| **L2** | `rounded="lg"` / `rounded="xl"` | Cards, dropdowns, tooltips |
| **L3** | `rounded="xl"` | Painéis destacados, banners, modais internos |
| **L4** | `rounded="2xl"` | Modais, drawers, hero containers |

**Regra:** nunca use `rounded="full"` em retângulos — apenas em pills e avatares circulares.

---

## 5. Espaçamento e Ritmo de Layout

### 5.1 Escala de Padding

| Contexto | Props |
| :--- | :--- |
| Seção de página | `py={{ base: '16', sm: '24', lg: '32' }}` |
| Interior de card padrão | `p={{ base: '6', sm: '8' }}` |
| Interior de card compacto | `p={{ base: '4', sm: '5' }}` |
| Container horizontal de página | `px={{ base: '4', sm: '6', lg: '8' }}` |
| Gap vertical entre seções | `gap="6"` padrão, `gap="10"` grande |
| Gap horizontal entre elementos | `gap="4"` padrão |

### 5.2 Primitivos de Layout

Use sempre os componentes `VStack`, `HStack` e `Box` — nunca `div` com flexbox manual nas páginas.

```tsx
// ✅ Correto
<VStack gap="6">
  <HStack gap="4" align="center">
    ...
  </HStack>
</VStack>

// ❌ Proibido
<div>
  <div>
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
<Grid
  templateColumns={{ base: '1fr', md: 'repeat(12, 1fr)' }}
  gap={{ base: '4', sm: '6' }}
>
  <GridItem colSpan={{ md: 8 }}>...</GridItem>
  <GridItem colSpan={{ md: 4 }}>...</GridItem>
  <GridItem colSpan={{ md: 5 }}>...</GridItem>
  <GridItem colSpan={{ md: 7 }}>...</GridItem>
  <GridItem colSpan={{ md: 4 }}>...</GridItem>
  <GridItem colSpan={{ md: 4 }}>...</GridItem>
  <GridItem colSpan={{ md: 4 }}>...</GridItem>
</Grid>
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

```tsx
<Card.Root
  transition="all 0.3s"
  _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl', borderColor: 'brand.muted' }}
>
  <Card.Header pb="2">
    <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="brand.fg">
      Categoria
    </Text>
    <Card.Title>Título do Card</Card.Title>
  </Card.Header>
  <Card.Body>
    <Card.Description>Descrição do conteúdo do card.</Card.Description>
  </Card.Body>
</Card.Root>
```

### 6.5 Card com Ícone (Feature Card)

```tsx
<Card.Root>
  <Card.Body p="6">
    <Center boxSize="11" rounded="lg" bg="brand.subtle" mb="4">
      <IcoPrincipal size={20} color="var(--chakra-colors-brand-solid)" strokeWidth={2} />
    </Center>
    <Card.Title fontSize="lg">Título</Card.Title>
    <Card.Description mt="1">Descrição.</Card.Description>
  </Card.Body>
</Card.Root>
```

### 6.6 Card de Destaque (com Glow)

```tsx
<Card.Root position="relative" overflow="hidden">
  <Box
    position="absolute"
    top="-20"
    right="-20"
    boxSize="64"
    bg="brand.subtle"
    rounded="full"
    filter="blur(80px)"
    pointerEvents="none"
  />
  <Card.Body position="relative" zIndex="1" p="8">
    {/* conteúdo */}
  </Card.Body>
</Card.Root>
```

---

## 7. Botões

### 7.1 Variantes

| Variante | Uso | Props |
| :--- | :--- | :--- |
| **Primary** | Ação principal da tela | `colorPalette="brand"` `variant="solid"` `fontWeight="semibold"` |
| **Secondary** | Ação secundária | `variant="subtle"` |
| **Outline** | Ação terciária | `variant="outline"` |
| **Ghost** | Ações de baixa prioridade | `variant="ghost"` |
| **Destructive** | Ações destrutivas | `colorPalette="red"` `variant="solid"` |

### 7.2 Tamanhos

| Tamanho | Props |
| :--- | :--- |
| `sm` | `size="sm"` |
| `md` (padrão) | `size="md"` |
| `lg` | `size="lg"` |
| `xl` | `size="xl"` |

### 7.3 Regras de Uso

- Todo botão primário usa **exclusivamente** `colorPalette="brand"` — nunca outra cor
- Nunca dois botões primários na mesma view — um por tela/modal
- Ícone dentro de botão: `size={16}` à esquerda do texto, `gap="2"` entre ícone e label
- Estado de loading: `loading` no `Button` + texto "Aguarde..."

---

## 8. Badges e Status

### 8.1 Status Semânticos

| Status | Props |
| :--- | :--- |
| **Success** | `colorPalette="green"` `variant="subtle"` |
| **Error** | `colorPalette="red"` `variant="subtle"` |
| **Warning** | `colorPalette="orange"` `variant="subtle"` |
| **Brand / Info** | `colorPalette="brand"` `variant="subtle"` |
| **Neutro** | `variant="subtle"` (sem palette) |

### 8.2 Anatomia do Badge

```tsx
<Badge colorPalette="brand" variant="subtle" textTransform="uppercase" letterSpacing="wide">
  <Box as="span" boxSize="1.5" rounded="full" bg="brand.solid" mr="1" />
  Ativo
</Badge>
```

---

## 9. Animações e Micro-interações

### 9.1 Padrão Oficial

Padrão: props do Chakra (`_hover`, `transition`). `motion`/`AnimatePresence` do Framer Motion só entra via módulo opcional `ui-extra`.

```tsx
<Box transition="opacity 0.3s, transform 0.3s">...</Box>

<Button transition="colors 0.3s" _hover={{ bg: 'brand.emphasized' }}>...</Button>
```

Se o módulo `ui-extra` estiver ativo, `springModal`/`slideLateral` (Framer Motion) seguem disponíveis em `web/shared/utils/animacoes.ts` só para `AnimatePresence` de modais/drawers.

### 9.2 Regras de Animação

- **Entrada de seção:** `transition` + opacidade/transform, aplicada uma vez.
- **Modais/Drawers:** Chakra já anima entrada/saída (`Dialog` / `Drawer`); só usar `AnimatePresence` (módulo `ui-extra`) se precisar de uma transição customizada.
- **Transições de hover:** `_hover` + `transition` — nunca JS para hover simples.
- **Nunca:** animar cor ou border-color com JS.

### 9.3 Hover Padrão de Cards

```tsx
_hover={{ transform: 'translateY(-4px)', boxShadow: 'xl', borderColor: 'brand.muted' }}
transition="all 0.3s"
```

---

## 10. Dark Mode

### 10.1 Princípios

- **Fundo de página:** `bg="bg"`
- **Surface de card:** `bg="bg.panel"`
- **Surface secundária:** `bg="bg.subtle"`
- **Bordas:** `borderColor="border"` / `border.muted`
- **Texto:** `color="fg"` para títulos; `color="fg.muted"` para corpo

### 10.2 Glassmorphism (Elementos Flutuantes)

```tsx
<Box bg="bg.panel/80" backdropFilter="blur(24px)" borderWidth="1px" borderColor="border" />
```

### 10.3 Blobs Decorativos

```tsx
<Box
  position="absolute"
  top="-40"
  right="0"
  boxSize="96"
  bg="brand.subtle"
  rounded="full"
  filter="blur(120px)"
  pointerEvents="none"
/>

<Box position="absolute" inset="0" bg="brand.subtle" filter="blur(80px)" pointerEvents="none" />
```

### 10.4 Regras de Sobriedade no Dark

- Nunca use `bg="black"` puro — use `bg="bg"`
- Nunca use `color="white"` puro em body — use `color="fg"`
- Sombras no dark: `boxShadow="md"` a no máximo `lg`
- Gradientes: limite a 2 stops com opacidade baixa

---

## 11. Responsividade e Mobile

### 11.1 Filosofia Mobile-First

Toda prop responsiva parte do mobile e expande com objeto `{ base, sm, md, lg }`.

```tsx
// ✅ Correto — parte do mobile, expande pro desktop
<Grid templateColumns={{ base: '1fr', md: 'repeat(12, 1fr)' }} gap={{ base: '4', sm: '6' }}>

// ❌ Errado — desktop como base, mobile como override
<Grid templateColumns="repeat(12, 1fr)" hideFrom="md">
```

### 11.2 Breakpoints

| Breakpoint | Largura | Uso |
| :--- | :--- | :--- |
| (base) | 0px+ | Mobile — 1 coluna, full-width |
| `sm` | 640px+ | Landscape mobile / tablet pequeno |
| `md` | 768px+ | Tablet — 2 colunas mínimo |
| `lg` | 1024px+ | Desktop — layout completo |
| `xl` | 1280px+ | Desktop largo — expansão opcional |

### 11.3 Bento no Mobile

No mobile, o Bento Grid **sempre** colapsa para 1 coluna:

```tsx
<Grid templateColumns={{ base: '1fr', md: 'repeat(12, 1fr)' }} gap={{ base: '4', sm: '6' }}>
  <GridItem colSpan={{ md: 8 }}>...</GridItem>
  <GridItem colSpan={{ md: 4 }}>...</GridItem>
</Grid>
```

A ordem visual no mobile segue a ordem do DOM — posicione o conteúdo mais importante primeiro no HTML.

### 11.4 Padding Mínimo Mobile

- **Nunca** menos de `px="4"` no container principal de qualquer tela
- Texto legível: mínimo `fontSize="sm"` — nunca `fontSize="xs"` para body em mobile
- Botões: mínimo `size="md"` no mobile — alvos de toque de no mínimo 44px

### 11.5 Navegação Mobile (FAB)

Quando uma página tem navegação lateral complexa (tabs, seções), substituir por **FAB flutuante** no mobile:

```tsx
<IconButton
  hideFrom="lg"
  position="fixed"
  bottom="5"
  right="5"
  zIndex="40"
  boxSize="14"
  rounded="xl"
  colorPalette="brand"
  aria-label="Menu"
>
  <Menu size={20} />
</IconButton>
```

---

## 12. Iconografia

### 12.1 Biblioteca Oficial

Exclusivamente `lucide-react`. Nunca misturar com outras bibliotecas de ícones.

### 12.2 Escala de Tamanhos

| Tamanho | Uso |
| :--- | :--- |
| `size={14}` | Labels inline, badges de texto |
| `size={16}` | Botões, itens de lista, inputs |
| `size={20}` | Ícones de cards padrão |
| `size={24}` | Ícones de navegação |
| `size={28}` / `size={32}` | Empty states, features secundárias |
| `size={36}` / `size={40}` | Features em cards de destaque |
| `size={48}`+ | Hero icons, ícones principais de seção |

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

> Nunca usar elementos HTML crus onde existe um componente Chakra UI equivalente.

| Elemento proibido | Componente Chakra UI |
| :--- | :--- |
| `<button>` | `<Button>` |
| `<input>` | `<Input>` |
| `<select>` | `<NativeSelect>` / `<Select>` |
| `<table>`, `<tr>`, `<td>` | `<Table.Root>`, `<Table.Row>`, `<Table.Cell>` |
| `<dialog>` | `<Dialog>` / `<Drawer>` |
| Span com estilo de badge | `<Badge>` |

**Exceções aceitas** (sem componente Chakra equivalente):
- `Box` para elementos puramente decorativos (blobs, overlays de fundo)
- `VStack` / `HStack` / `Box` / `Grid` / `GridItem` para qualquer layout

### 13.3 Layout Sidebar + Conteúdo

Para telas com navegação lateral, o visual esperado é:

```
Desktop (lg+):
┌──────────────────────────────────────────────┐
│ sidebar (w="56"/w="60", sticky)  │  conteúdo │
│                                  │  (flex="1")│
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
return isDesktop ? <Dialog.Root>...</Dialog.Root> : <Drawer.Root>...</Drawer.Root>
```

### 14.2 Dialog Desktop

```
maxW="xl" a maxW="5xl" (conforme conteúdo)
rounded="xl" a rounded="2xl"
boxShadow="2xl"
```

Botão de fechar:
```tsx
<IconButton
  variant="ghost"
  position="absolute"
  top="6"
  right="6"
  boxSize="9"
  rounded="lg"
  aria-label="Fechar"
>
  <X size={16} />
</IconButton>
```

### 14.3 Drawer Mobile (Bottom Sheet)

```
h="90vh" a h="95vh"
roundedTop="xl"
Handle: w="12" h="1" bg="bg.muted" rounded="full" mx="auto" mt="3"
```

---

## 15. Formulários

### 15.1 Anatomia de Campo

```tsx
<Field.Root required invalid={!!erro}>
  <Field.Label>Label do Campo</Field.Label>
  <Input placeholder="..." />
  <Field.ErrorText>
    <HStack gap="1" fontSize="xs" color="red.fg">
      <AlertCircle size={12} />
      Mensagem de erro aqui.
    </HStack>
  </Field.ErrorText>
</Field.Root>
```

### 15.2 Regras

- Altura padrão de inputs: `size="md"`; grande: `size="lg"`
- Sempre paleta `brand` no estado `focus`
- Campos com erro: `invalid` no `Field.Root`
- Campos desabilitados: `disabled`

---

## 16. Subflow e Estados de Carregamento

### 16.1 Regra

**Nunca usar spinner isolado** como único indicador de carregamento. Sempre usar `<Subflow />` que replica a estrutura do conteúdo que está carregando.

```tsx
<Card.Root p="6">
  <VStack gap="4" align="stretch">
    <Box h="4" w="24" rounded="md" bg="bg.muted" />
    <Box h="7" w="75%" rounded="lg" bg="bg.muted" />
    <Box h="4" w="full" rounded="md" bg="bg.muted" />
    <Box h="4" w="83%" rounded="md" bg="bg.muted" />
  </VStack>
</Card.Root>
```

### 16.2 Estado Vazio (Empty State)

```tsx
<VStack align="center" justify="center" py="20" gap="4" textAlign="center">
  <Center boxSize="16" rounded="lg" bg="bg.muted">
    <IcoVazio size={32} strokeWidth={1.5} />
  </Center>
  <VStack gap="1">
    <Text fontSize="md" fontWeight="semibold">
      Nenhum item encontrado
    </Text>
    <Text fontSize="sm" color="fg.subtle">
      Descrição do estado vazio e o que o usuário pode fazer.
    </Text>
  </VStack>
  <Button size="sm">Criar primeiro item</Button>
</VStack>
```

---

## 17. Tabelas

### 17.1 Estrutura Padrão

```tsx
<Box rounded="xl" borderWidth="1px" borderColor="border" overflow="hidden">
  <Table.Root>
    <Table.Header bg="bg.subtle">
      <Table.Row>
        <Table.ColumnHeader fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="fg.subtle">
          Coluna
        </Table.ColumnHeader>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      <Table.Row _hover={{ bg: 'bg.subtle' }}>
        <Table.Cell>Valor</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table.Root>
</Box>
```

### 17.2 Toolbar de Filtros

Sempre acima das tabelas:

```
[Ícone filtro] [Select] [Select] [Input busca] · · · [Limpar ×]
```

- Altura uniforme: `size="sm"` para todos os controles
- Texto: `fontSize="sm"`
- Botão "Limpar": visível **somente** quando há filtro ativo — `colorPalette="red"`
- Container: `HStack gap="2" wrap="wrap"`

---

## 18. Checklist de Review (Zero Compromisso)

Antes de fazer PR ou considerar qualquer componente/tela finalizado:

**Tokens e Cores**
- [ ] Zero cores raw? Somente tokens do sistema (`brand.*`, `fg.*`, `bg.*`)?
- [ ] Cor brand usada em todos os elementos interativos e de destaque?
- [ ] Bordas usando somente `border` / `border.muted`?

**Dark Mode**
- [ ] Funciona corretamente em Light E Dark Mode?
- [ ] Fundos usando tokens `bg.*` (nunca `black` ou `white` puro)?
- [ ] Textos usando tokens `fg.*`?

**Tipografia**
- [ ] Poppins exclusivamente em headings? Lato no body?
- [ ] Hierarquia de peso respeitada (black para H1, bold para H2, medium para body)?
- [ ] `fontSize="xs"` nunca usado como body em mobile?

**Layout e Grid**
- [ ] Grade Bento colapsa para 1 coluna no mobile?
- [ ] Padding mínimo `px="4"` no mobile?
- [ ] `VStack`/`HStack`/`Box` primitivos usados (sem `div` com flex manual)?

**Arredondamentos**
- [ ] Hierarquia L1–L4 respeitada?
- [ ] `rounded="full"` apenas em pills e avatares circulares?

**Componentes**
- [ ] Apenas 1 botão primário por view?
- [ ] Todos os `button`, `input`, `select`, `table` substituídos por componentes Chakra UI equivalentes?
- [ ] Hover effects em todos os elementos interativos?
- [ ] Animação de entrada em seções via `transition`?
- [ ] Subflows replicam a estrutura do conteúdo real?
- [ ] Modal tem variante Dialog (desktop) + Drawer (mobile)?

**Responsividade**
- [ ] Props escritas mobile-first (`base`, `sm`, `md`, `lg`)?
- [ ] FAB considerado para navegação complexa no mobile?
- [ ] Alvos de toque mínimo de 44px em elementos clicáveis mobile?
