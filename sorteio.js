/* Sorteio independente da busca, filtros e biblioteca local. */
(function () {
  const button = document.getElementById("random-game");
  const result = document.getElementById("random-result");
  if (!button || !result) return;
  let last = null;
  button.addEventListener("click", function () {
    const catalog = typeof GAMES !== "undefined" && Array.isArray(GAMES) ? GAMES : [];
    if (!catalog.length) {
      result.textContent = "Não foi possível carregar os jogos. Atualize a página e tente novamente.";
      return;
    }
    const alternatives = catalog.filter(game => game.s !== last);
    const pool = alternatives.length ? alternatives : catalog;
    const game = pool[Math.floor(Math.random() * pool.length)];
    last = game.s;

    const link = document.createElement("a");
    link.className = "random-pick";
    link.href = "jogo.html?j=" + encodeURIComponent(game.s);
    const cover = document.createElement("img");
    cover.className = "thumb";
    cover.src = game.img || "assets/" + game.s + ".jpg";
    cover.alt = "";
    let alternative = game.coverFallback;
    cover.addEventListener("error", function () {
      if (alternative) { cover.src = alternative; alternative = null; }
      else cover.hidden = true;
    });
    const info = document.createElement("div");
    const category = document.createElement("small");
    category.textContent = "Jogo sorteado · " + game.k;
    const title = document.createElement("strong");
    title.textContent = game.n;
    const action = document.createElement("span");
    action.textContent = "Ver dicas →";
    info.appendChild(category);
    info.appendChild(title);
    info.appendChild(action);
    link.appendChild(cover);
    link.appendChild(info);
    result.textContent = "";
    result.appendChild(link);
    button.textContent = "Sortear outro jogo";
  });
})();
