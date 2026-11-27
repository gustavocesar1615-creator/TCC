/* Caderno e progresso local de cada jogo. */
(function () {
  const main = document.querySelector("main");
  const params = new URLSearchParams(location.search);
  const slug = params.get("j");
  const group = main?.querySelector(".tabs");
  if (!group || typeof GAMES === "undefined" || !GAMES.some(game => game.s === slug)) return;
  const key = "gametips:guide:v1:" + slug;
  const sectionId = text => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  const entries = [...group.querySelectorAll(".tab")].map(tab => ({ tab, id: sectionId(tab.textContent) }));
  if (!entries.length) return;
  const allowed = new Set(entries.map(entry => entry.id));
  let stored;
  try { stored = JSON.parse(localStorage.getItem(key) || "null"); } catch {}
  const state = {
    note: typeof stored?.note === "string" ? stored.note.slice(0, 2000) : "",
    read: Array.isArray(stored?.read) ? [...new Set(stored.read.filter(id => allowed.has(id)))] : [],
    last: allowed.has(stored?.last) ? stored.last : ""
  };
  function save() {
    try { localStorage.setItem(key, JSON.stringify(state)); return true; }
    catch { return false; }
  }

  const toolbar = document.createElement("section");
  toolbar.className = "guide-tools";
  toolbar.setAttribute("aria-label", "Minha consulta");
  toolbar.innerHTML = '<div class="guide-progress-row"><div><strong>Minha consulta</strong><p id="guide-count" class="muted"></p></div><progress id="guide-progress" max="1" value="0" aria-label="Seções lidas"></progress></div>' +
    '<div class="guide-actions"><button type="button" class="tool-button" id="guide-mark" aria-pressed="false">Marcar seção como lida</button><button type="button" class="tool-button" id="guide-copy">Copiar link desta seção</button><button type="button" class="quiet-button" id="guide-reset">Limpar progresso</button></div>' +
    '<p id="guide-feedback" class="guide-feedback muted" role="status"></p><div id="guide-link-box" hidden><label for="guide-link">Copie o endereço abaixo</label><input id="guide-link" readonly></div>';
  group.before(toolbar);
  const notes = document.createElement("details");
  notes.className = "guide-notes";
  notes.innerHTML = '<summary>Meu caderno de jogo</summary><p class="muted">Anote objetivos, dúvidas ou coisas que quer lembrar. As notas ficam neste navegador.</p><label for="guide-note">Anotações sobre este jogo</label><textarea id="guide-note" rows="5" maxlength="2000" placeholder="Ex.: conferir uma área que deixei para depois..."></textarea>' +
    '<div class="guide-actions"><button type="button" class="tool-button" id="guide-save-note">Salvar anotação</button><button type="button" class="quiet-button" id="guide-clear-note">Apagar anotação</button><span id="guide-note-count" class="muted"></span></div><p id="guide-note-feedback" class="guide-feedback muted" role="status"></p>';
  main.appendChild(notes);
  const get = id => document.getElementById(id);
  const note = get("guide-note"), feedback = get("guide-feedback"), mark = get("guide-mark");
  const noteFeedback = get("guide-note-feedback"), linkBox = get("guide-link-box"), linkInput = get("guide-link");
  note.value = state.note;
  notes.open = Boolean(state.note);
  const count = () => { get("guide-note-count").textContent = note.value.length + "/2000"; };
  count();
  note.addEventListener("input", () => { count(); noteFeedback.textContent = "Anotação ainda não salva."; });
  get("guide-save-note").addEventListener("click", () => {
    state.note = note.value.slice(0, 2000);
    noteFeedback.textContent = save() ? "Anotação salva." : "Não foi possível salvar. Copie a anotação antes de sair.";
  });
  get("guide-clear-note").addEventListener("click", () => {
    if (note.value && !window.confirm("Apagar a anotação deste jogo?")) return;
    note.value = ""; state.note = ""; count();
    noteFeedback.textContent = save() ? "Anotação apagada." : "Não foi possível atualizar o armazenamento.";
  });

  const selected = () => entries.find(entry => entry.tab.getAttribute("aria-selected") === "true") || entries[0];
  function refresh() {
    const marked = state.read.includes(selected().id);
    get("guide-progress").max = entries.length;
    get("guide-progress").value = state.read.length;
    get("guide-count").textContent = state.read.length + " de " + entries.length + " seções lidas";
    mark.textContent = marked ? "Desmarcar seção" : "Marcar seção como lida";
    mark.setAttribute("aria-pressed", String(marked));
    entries.forEach(entry => entry.tab.classList.toggle("guide-read", state.read.includes(entry.id)));
  }
  function sectionUrl(id) {
    const url = new URL(location.href);
    url.searchParams.set("secao", id);
    url.hash = "";
    return url;
  }
  function syncSection() {
    state.last = selected().id;
    save();
    try { history.replaceState(history.state, "", sectionUrl(state.last)); } catch {}
    linkBox.hidden = true;
    feedback.textContent = "";
    refresh();
  }
  mark.addEventListener("click", () => {
    const id = selected().id;
    state.read = state.read.includes(id) ? state.read.filter(item => item !== id) : [...state.read, id];
    feedback.textContent = save() ? "Progresso atualizado." : "Progresso atualizado apenas nesta página.";
    refresh();
  });
  get("guide-reset").addEventListener("click", () => {
    if (state.read.length && !window.confirm("Limpar o progresso deste jogo?")) return;
    state.read = [];
    feedback.textContent = save() ? "Progresso limpo." : "Progresso limpo apenas nesta página.";
    refresh();
  });
  get("guide-copy").addEventListener("click", async () => {
    const address = sectionUrl(selected().id).href;
    try {
      if (!navigator.clipboard?.writeText) throw Error("Clipboard indisponível");
      await navigator.clipboard.writeText(address);
      linkBox.hidden = true;
      feedback.textContent = "Link copiado.";
    } catch {
      linkInput.value = address; linkBox.hidden = false;
      linkInput.focus(); linkInput.select();
      feedback.textContent = "Copie o endereço selecionado.";
    }
  });
  group.addEventListener("gametips:tabchange", syncSection);
  const requested = params.get("secao");
  const initial = entries.find(entry => entry.id === requested) || (!requested && entries.find(entry => entry.id === state.last));
  if (initial) initial.tab.click();
  syncSection();
})();
