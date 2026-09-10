#!/usr/bin/env python3
"""Sincroniza ROADMAP.md com documentation/progresso/.

Lê a tabela e o checklist do lote atual, cria a página paginada se ainda
não existir e reconstrói o índice PROGRESSO_ROADMAP.md (sem apagar tópicos
de lotes anteriores).
"""

from __future__ import annotations

import math
import os
import re
import sys
from typing import TypedDict


class Topic(TypedDict):
    id: int
    title: str
    status: str


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROADMAP_PATH = os.path.join(ROOT, "ROADMAP.md")
PROGRESSO_DIR = os.path.join(ROOT, "documentation", "progresso")
INDEX_PATH = os.path.join(PROGRESSO_DIR, "PROGRESSO_ROADMAP.md")

SKIP_TITLES = {"Tópico", "---", ""}


def file_index(topic_id: int) -> int:
    return math.ceil(topic_id / 20)


def parse_roadmap(content: str) -> tuple[str, list[Topic]]:
    title_match = re.search(r"^# Roadmap —\s*(.+)$", content, re.MULTILINE)
    lote_title = title_match.group(1).strip() if title_match else "Lote atual"

    topics: dict[int, Topic] = {}

    for line in content.splitlines():
        match = re.match(r"^\|\s*(\d+)\s*\|\s*(\[[ xX]\])?\s*(.*?)\s*\|", line.strip())
        if not match:
            continue
        topic_id = int(match.group(1))
        title = re.sub(r"^\[[ xX]\]\s*", "", match.group(3).strip())
        if title in SKIP_TITLES:
            continue
        marker = (match.group(2) or "").lower()
        topics[topic_id] = {
            "id": topic_id,
            "title": title,
            "status": "✅ Concluído" if marker == "[x]" else "⏳ Pendente",
        }

    for line in content.splitlines():
        match = re.match(r"^-\s*\[([xX ])\]\s*\*\*(\d+)\.\s*(.*?)\*\*", line.strip())
        if not match:
            continue
        topic_id = int(match.group(2))
        title = match.group(3).strip()
        done = match.group(1).lower() == "x"
        if topic_id not in topics:
            topics[topic_id] = {"id": topic_id, "title": title, "status": "⏳ Pendente"}
        elif title:
            topics[topic_id]["title"] = title
        topics[topic_id]["status"] = "✅ Concluído" if done else "⏳ Pendente"

    if not topics:
        raise SystemExit("Nenhum tópico encontrado em ROADMAP.md.")

    return lote_title, [topics[i] for i in sorted(topics)]


def parse_index(path: str) -> dict[int, Topic]:
    if not os.path.isfile(path):
        return {}

    topics: dict[int, Topic] = {}
    with open(path, encoding="utf-8") as handle:
        for line in handle:
            match = re.match(
                r"^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|",
                line.strip(),
            )
            if not match:
                continue
            topic_id = int(match.group(1))
            title = match.group(2).strip()
            status = match.group(3).strip()
            if title in SKIP_TITLES or title == "Tarefa":
                continue
            topics[topic_id] = {"id": topic_id, "title": title, "status": status}
    return topics


def write_paginated_file(lote_title: str, lote: list[Topic]) -> str | None:
    start = lote[0]["id"]
    end = lote[-1]["id"]
    index = file_index(start)
    filename = f"PROGRESSO_ROADMAP_{index}.md"
    path = os.path.join(PROGRESSO_DIR, filename)

    if os.path.isfile(path):
        return None

    lines = [
        f"# Progresso do Roadmap — Feature {index} ({lote_title})\n",
        "\n",
        f"> Detalhamento dos tópicos {start} ao {end}.\n",
        "\n",
        "---\n",
    ]
    for topic in lote:
        lines.append(f"\n### ⏳ Tópico {topic['id']} — {topic['title']}\n")
        lines.append("- **Status**: Pendente\n")

    with open(path, "w", encoding="utf-8") as handle:
        handle.writelines(lines)

    return filename


def write_index(topics: list[Topic]) -> None:
    max_id = topics[-1]["id"]
    max_file = file_index(max_id)

    file_list = "".join(
        f"> - **Tópicos {((i - 1) * 20) + 1}+** → [PROGRESSO_ROADMAP_{i}.md](PROGRESSO_ROADMAP_{i}.md)\n"
        for i in range(1, max_file + 1)
    )

    rows = "".join(
        f"| {topic['id']} | {topic['title']} | {topic['status']} | [ver](PROGRESSO_ROADMAP_{file_index(topic['id'])}.md) |\n"
        for topic in topics
    )

    content = (
        "# Progresso do Roadmap\n\n"
        "> [!IMPORTANT]\n"
        "> Sempre que detalhar um tópico concluído, atualize também "
        "[FRONTEND.md](../stack/FRONTEND.md) e/ou [BACKEND.md](../stack/BACKEND.md) conforme o lado alterado.\n"
        "> Melhorias pontuais ficam em [MELHORIAS.md](melhorias/MELHORIAS.md).\n\n"
        "> Os detalhes de cada tópico estão nos arquivos paginados desta pasta:\n"
        f"{file_list}\n"
        "| ID | Tarefa | Status | Documentação |\n"
        "|---|---|---|---|\n"
        f"{rows}"
    )

    os.makedirs(PROGRESSO_DIR, exist_ok=True)
    with open(INDEX_PATH, "w", encoding="utf-8") as handle:
        handle.write(content)


def main() -> None:
    if not os.path.isfile(ROADMAP_PATH):
        print("ROADMAP.md não encontrado.", file=sys.stderr)
        raise SystemExit(1)

    with open(ROADMAP_PATH, encoding="utf-8") as handle:
        content = handle.read()

    lote_title, lote = parse_roadmap(content)
    created = write_paginated_file(lote_title, lote)

    merged = parse_index(INDEX_PATH)
    for topic in lote:
        merged[topic["id"]] = topic

    write_index([merged[i] for i in sorted(merged)])

    print(f"PROGRESSO_ROADMAP.md atualizado com {len(merged)} tópicos.")
    if created:
        print(f"Criado {created}.")
    else:
        print("Página paginada do lote já existia — conteúdo preservado.")


if __name__ == "__main__":
    main()
