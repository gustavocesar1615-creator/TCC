#!/usr/bin/env python3
"""Importa metadados e requisitos para PC das fichas oficiais do Steam."""
import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

DESTINO = Path("steam-info.js")
TEXTO = DESTINO.read_text(encoding="utf-8")
INICIO = "const STEAM_INFO="
if INICIO not in TEXTO:
    raise SystemExit("steam-info.js nao contem STEAM_INFO")
DADOS = json.loads(TEXTO.split(INICIO, 1)[1].rsplit(";", 1)[0])

def campos_do_html(conteudo):
    if not isinstance(conteudo, str) or not conteudo.strip():
        return []
    # Converte itens de HTML em linhas simples, sem importar HTML da Steam.
    conteudo = re.sub(r"<br\s*/?>", "\n", conteudo, flags=re.I)
    conteudo = re.sub(r"</li\s*>", "\n", conteudo, flags=re.I)
    conteudo = re.sub(r"</p\s*>", "\n", conteudo, flags=re.I)
    conteudo = re.sub(r"<[^>]*>", "", conteudo)
    conteudo = html.unescape(conteudo)
    linhas = []
    for parte in conteudo.splitlines():
        parte = " ".join(parte.split()).strip(" -•\t")
        if not parte or parte.lower().strip(":") in (
            "minimum", "recommended", "mínimos", "recomendados",
            "requisitos mínimos", "requisitos recomendados"
        ):
            continue
        if parte not in linhas:
            linhas.append(parte)
    return linhas[:16]

def consultar(appid):
    args = urllib.parse.urlencode({"appids": str(appid), "cc": "br", "l": "portuguese"})
    url = "https://store.steampowered.com/api/appdetails?" + args
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; GameTips-TCC/1.0)",
        "Accept": "application/json"
    })
    with urllib.request.urlopen(req, timeout=25) as resposta:
        dados = json.load(resposta)
    envelope = dados.get(str(appid)) or {}
    if not envelope.get("success") or not isinstance(envelope.get("data"), dict):
        raise ValueError("Steam nao retornou detalhes do jogo")
    return envelope["data"]

sucessos = 0
falhas = []
for slug, item in DADOS.items():
    appid = item.get("appid")
    if not appid:
        continue  # Fortnite: dados publicados pela Epic Games, nao pela Steam.
    print(f"Consultando {slug} ({appid})", flush=True)
    try:
        game = consultar(appid)
        item["dev"] = ", ".join(game.get("developers") or [])
        item["publisher"] = ", ".join(game.get("publishers") or [])
        item["release"] = (game.get("release_date") or {}).get("date") or ""
        item["genres"] = [g.get("description", "") for g in game.get("genres", []) if g.get("description")][:6]
        plats = game.get("platforms") or {}
        item["platforms"] = [rotulo for chave, rotulo in [
            ("windows", "Windows"), ("mac", "macOS"), ("linux", "Linux")
        ] if plats.get(chave)]
        pc = game.get("pc_requirements") or {}
        if isinstance(pc, dict):
            item["min"] = campos_do_html(pc.get("minimum"))
            item["rec"] = campos_do_html(pc.get("recommended"))
        item["status"] = "consultado"
        sucessos += 1
    except (urllib.error.URLError, ValueError, TimeoutError, json.JSONDecodeError) as erro:
        item["status"] = "consulta indisponível"
        falhas.append(f"{slug}: {erro}")
        print(f"AVISO: {slug}: {erro}", flush=True)
    time.sleep(0.7)

DESTINO.write_text(
    "// Informações da Steam consultadas para uso no GameTips. Fortnite usa a Epic Games.\n"
    + INICIO + json.dumps(DADOS, ensure_ascii=False, indent=2) + ";\n",
    encoding="utf-8"
)
print(f"Consultas concluídas: {sucessos}/{sum(bool(x.get('appid')) for x in DADOS.values())}")
for aviso in falhas:
    print(aviso)
