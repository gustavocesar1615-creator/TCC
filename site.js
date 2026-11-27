/* Interface principal do GameTips. Os dados ficam em games.js e steam-info.js. */
const COR = {
  "RPG": "#c084fc", "Ação": "#f87171", "Exploração": "#34d399",
  "Simulação": "#fbbf24", "Campanha": "#fb7185", "Multijogador": "#38bdf8",
  "Mundo aberto": "#f59e0b", "Terror": "#ef4444", "Plataforma": "#2dd4bf",
  "Estratégia": "#60a5fa", "Quebra-cabeça": "#a3e635"
};

const $ = selector => document.querySelector(selector);
const cor = game => COR[game.k] || "#a78bfa";
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));
const normalize = value => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const gameUrl = game => "jogo.html?j=" + encodeURIComponent(game.s);

function thumb(game) {
  const src = game.img || "assets/" + game.s + ".jpg";
  return '<img class="thumb" src="' + esc(src) + '" alt="' + esc(game.n) +
    '" loading="lazy" data-cover-fallback="' + esc(game.coverFallback || "") + '" data-fallback="' + esc(game.n.charAt(0)) + '">';
}

// O listener em captura também atende imagens adicionadas depois da busca.
document.addEventListener("error", event => {
  const img = event.target;
  if (!(img instanceof HTMLImageElement) || !img.hasAttribute("data-fallback")) return;
  if (img.dataset.coverFallback) {
    const alternative = img.dataset.coverFallback;
    delete img.dataset.coverFallback;
    img.src = alternative;
    return;
  }
  const fallback = document.createElement("div");
  fallback.className = "thumb ph";
  fallback.setAttribute("role", "img");
  fallback.setAttribute("aria-label", img.alt);
  fallback.textContent = img.dataset.fallback;
  img.replaceWith(fallback);
}, true);

function rodape() {
  const footer = $("footer");
  if (!footer) return;
  const preenchido = value => value && !/^\[.*\]$/.test(value);
  const linha = document.createElement("div");
  linha.textContent = [SITE.nome, "Projeto de TCC", SITE.autor, SITE.curso, SITE.escola, SITE.ano]
    .filter(preenchido).join(" • ");
  const partes = [linha];
  if (preenchido(SITE.orientador)) {
    const orientacao = document.createElement("div");
    orientacao.textContent = "Orientação: " + SITE.orientador;
    partes.push(orientacao);
  }
  const direitos = document.createElement("div");
  direitos.textContent = "Nomes e imagens dos jogos pertencem aos seus respectivos donos e estúdios.";
  footer.replaceChildren(...partes, direitos);
}


// Preferências locais, sem login nem envio de dados ao servidor.
const LIBRARY_KEYS = { saved: "gametips:saved:v1", recent: "gametips:recent:v1" };
const memoryLibrary = { saved: null, recent: null };
function readLibrary(kind) {
  let value = memoryLibrary[kind];
  if (value === null) {
    try { value = JSON.parse(localStorage.getItem(LIBRARY_KEYS[kind]) || "[]"); }
    catch { value = []; }
  }
  return Array.isArray(value) ? [...new Set(value.filter(slug => typeof slug === "string" && GAMES.some(game => game.s === slug)))] : [];
}
function writeLibrary(kind, slugs) {
  const value = [...new Set(slugs.filter(slug => GAMES.some(game => game.s === slug)))];
  memoryLibrary[kind] = value;
  try { localStorage.setItem(LIBRARY_KEYS[kind], JSON.stringify(value)); return true; }
  catch { return false; }
}
function toggleSaved(slug) {
  const saved = readLibrary("saved");
  const next = saved.includes(slug) ? saved.filter(item => item !== slug) : [...saved, slug];
  const persisted = writeLibrary("saved", next);
  return { saved: next.includes(slug), persisted };
}
function rememberGame(slug) {
  writeLibrary("recent", [slug, ...readLibrary("recent").filter(item => item !== slug)].slice(0, 5));
}
function catalogGames(category, query, savedOnly, order) {
  const saved = savedOnly ? new Set(readLibrary("saved")) : null;
  const list = GAMES.filter(game => (category === "Todos" || game.k === category) &&
    normalize(game.n).includes(normalize(query.trim())) && (!saved || saved.has(game.s)));
  if (order === "az" || order === "za") list.sort((a, b) =>
    (order === "az" ? 1 : -1) * a.n.localeCompare(b.n, "pt-BR", { sensitivity: "base" }));
  return list;
}

// Seleções editoriais do catálogo, não avaliações nem tendências inventadas.
const DISCOVER = [
  { slug: "stardew-valley", title: "Jogar no meu ritmo", reason: "Cuidar da fazenda, conhecer a vila e escolher seus próprios objetivos." },
  { slug: "portal-2", title: "Quebrar a cabeça", reason: "Resolver salas de teste usando lógica, espaço e criatividade." },
  { slug: "hollow-knight", title: "Explorar sem pressa", reason: "Descobrir caminhos interligados e entender Hallownest aos poucos." }
];
function drawDiscovery() {
  const host = $("#discover-list");
  if (!host) return;
  host.innerHTML = DISCOVER.map(item => {
    const game = GAMES.find(g => g.s === item.slug);
    if (!game) return "";
    return '<a class="discover-item" href="' + gameUrl(game) + '">' + thumb(game) +
      '<div><strong>' + esc(item.title) + '</strong><span class="discover-game">' + esc(game.n) +
      '</span><p>' + esc(item.reason) + '</p></div></a>';
  }).join("");
}
function drawRecent() {
  const section = $("#recent"), list = $("#recent-list");
  if (!section || !list) return;
  const recent = readLibrary("recent").map(slug => GAMES.find(game => game.s === slug)).filter(Boolean);
  section.hidden = recent.length === 0;
  list.innerHTML = recent.map(game => '<a class="recent-item" href="' + gameUrl(game) + '">' +
    thumb(game) + '<span>' + esc(game.n) + '</span></a>').join("");
}

function home() {
  const cats = [...new Set(GAMES.map(game => game.k))].sort();
  const chips = $("#chips"), busca = $("#busca"), grid = $("#grid");
  const savedFilter = $("#saved-filter"), order = $("#game-sort");
  let cat = "Todos", savedOnly = false;
  drawDiscovery();
  drawRecent();
  $("#clear-recent").addEventListener("click", () => { writeLibrary("recent", []); drawRecent(); });
  chips.innerHTML = ["Todos", ...cats].map(c =>
    '<button type="button" class="chip' + (c === "Todos" ? ' on' : '') +
    '" aria-pressed="' + String(c === "Todos") + '" data-c="' + esc(c) + '">' + esc(c) + '</button>'
  ).join("");
  $("#sobre-n").textContent = GAMES.length;

  function draw() {
    const lista = catalogGames(cat, busca.value, savedOnly, order.value);
    savedFilter.textContent = "Guardados (" + readLibrary("saved").length + ")";
    savedFilter.setAttribute("aria-pressed", String(savedOnly));
    $("#cont").textContent = "Mostrando " + lista.length + " de " + GAMES.length + " jogos";
    grid.innerHTML = lista.map(game =>
      '<a class="card" style="--c:' + cor(game) + '" href="' + gameUrl(game) + '">' + thumb(game) +
      '<div class="b"><small>' + esc(game.k) + '</small><h3>' + esc(game.n) +
      '</h3><p>' + esc(game.t) + '</p><span>Ver dicas →</span></div></a>'
    ).join("") || '<p class="muted">' + (savedOnly ? 'Nenhum jogo guardado corresponde aos filtros. Abra uma ficha para guardar um jogo.' : 'Nenhum jogo encontrado.') + '</p>';
  }
  busca.addEventListener("input", draw);
  order.addEventListener("change", draw);
  savedFilter.addEventListener("click", () => { savedOnly = !savedOnly; draw(); });
  chips.addEventListener("click", event => {
    const button = event.target.closest(".chip");
    if (!button) return;
    cat = button.dataset.c;
    chips.querySelectorAll(".chip").forEach(item => {
      const active = item === button;
      item.classList.toggle("on", active);
      item.setAttribute("aria-pressed", String(active));
    });
    draw();
  });
  // Atualiza a biblioteca ao voltar pelo histórico do navegador.
  window.addEventListener("pageshow", event => {
    if (!event.persisted) return;
    memoryLibrary.saved = memoryLibrary.recent = null;
    drawRecent();
    draw();
  });
  draw();
}

function steamTab(game) {
  const data = typeof STEAM_INFO !== "undefined" ? STEAM_INFO[game.s] : null;
  if (!data) return "<p>Informações da loja não disponíveis para este jogo.</p>";
  const list = arr => Array.isArray(arr) && arr.length
    ? "<ul>" + arr.map(value => "<li>" + esc(value) + "</li>").join("") + "</ul>"
    : "<p class='muted'>Não informado na fonte oficial consultada.</p>";
  const field = (name, value) => value && (!Array.isArray(value) || value.length)
    ? "<p><b>" + name + ":</b> " + esc(Array.isArray(value) ? value.join(", ") : value) + "</p>" : "";
  const details = field("Desenvolvimento", data.dev) + field("Publicação", data.publisher) +
    field("Data informada na loja", data.release) + field("Gêneros", data.genres) + field("Plataformas", data.platforms);
  const note = data.source === "Epic Games"
    ? "<p>Fortnite não tem página na Steam. Os requisitos abaixo são da Epic Games.</p>"
    : "<p>Informações e requisitos oficiais para PC (Windows), quando fornecidos pela Steam.</p>";
  const status = data.status === "aguardando importação"
    ? "<p class='muted'>Os requisitos desta ficha ainda serão importados da loja oficial.</p>" : data.status === "consulta indisponível"
    ? "<p class='muted'>A última consulta à loja falhou; os dados anteriores podem estar desatualizados.</p>" : "";
  const url = /^https:\/\/(store\.steampowered\.com|www\.epicgames\.com)\//.test(data.url || "") ? data.url : "";
  const source = url ? "<p>Fonte: <a target='_blank' rel='noopener noreferrer' href='" + esc(url) + "'>" +
    esc(data.source || "Página oficial") + " ↗</a></p>" : "";
  return note + status + details + "<p class='muted'>A data exibida pode corresponder à edição para PC ou à versão cadastrada na loja, e não ao lançamento original.</p><h3>Requisitos mínimos para PC</h3>" + list(data.min) +
    "<h3>Requisitos recomendados para PC</h3>" + list(data.rec) + source;
}

function jogo() {
  const game = GAMES.find(item => item.s === new URLSearchParams(location.search).get("j"));
  const main = $("main");
  if (!game) {
    main.innerHTML = '<p>Jogo não encontrado. <a href="index.html#jogos">Voltar</a></p>';
    return;
  }
  rememberGame(game.s);
  document.title = game.n + " | " + SITE.nome;
  document.body.style.setProperty("--c", cor(game));
  const sec = [...(game.secs || []), ["Informações e requisitos", steamTab(game)]];
  const tabs = '<div class="tabs">' + sec.map((s, i) =>
    '<button type="button" class="tab' + (i ? '' : ' on') + '" data-i="' + i + '">' + esc(s[0]) + '</button>'
  ).join("") + '</div>';
  // As seções contêm HTML editorial mantido no próprio repositório, não dados de visitantes.
  const body = sec.map((s, i) =>
    '<section class="pane' + (i ? '' : ' on') + '" data-i="' + i + '"><h2>' + esc(s[0]) + '</h2>' + s[1] + '</section>'
  ).join("");
  const rel = GAMES.filter(item => item !== game && item.k === game.k).slice(0, 4);
  if (!rel.length) rel.push(...GAMES.filter(item => item !== game).slice(0, 4));
  main.innerHTML = '<a class="back" href="index.html#jogos">← Voltar para os jogos</a>' +
    '<div class="hero"><div><span class="tag">' + esc(game.tag || game.k) + '</span><h1>' +
    esc(game.n) + '</h1><p class="lead">' + esc(game.sub || game.t) + '</p>' +
    '<div class="game-actions"><button type="button" class="tool-button" id="save-game" aria-pressed="false">Guardar jogo</button>' +
    '<button type="button" class="tool-button" id="jump-tips">Ir para as dicas</button></div><p id="save-status" class="save-status muted" role="status"></p></div>' + thumb(game) +
    '</div>' + tabs + body + '<h2>Veja também</h2><div class="links">' +
    rel.map(item => '<a href="' + gameUrl(item) + '">' + esc(item.n) + ' ↗</a>').join("") + '</div>';
  window.GameTipsTabs.init(main);
  const saveButton = $("#save-game");
  function updateSave(saved) {
    saveButton.textContent = saved ? "Remover dos guardados" : "Guardar jogo";
    saveButton.setAttribute("aria-pressed", String(saved));
  }
  updateSave(readLibrary("saved").includes(game.s));
  saveButton.addEventListener("click", () => {
    const result = toggleSaved(game.s);
    updateSave(result.saved);
    $("#save-status").textContent = (result.saved ? "Jogo guardado." : "Jogo removido.") +
      (result.persisted ? " Sua lista fica neste navegador." : " O navegador não permitiu salvar a lista permanentemente.");
  });
  const tipsIndex = sec.findIndex(item => item[0] === "Dicas");
  const jump = $("#jump-tips");
  jump.hidden = tipsIndex < 0;
  jump.addEventListener("click", () => {
    const tab = main.querySelector('.tab[data-i="' + tipsIndex + '"]');
    if (tab) { tab.click(); tab.focus(); tab.scrollIntoView({ block: "nearest" }); }
  });
}

if (document.body.dataset.p === "home") home();
else jogo();
rodape();
