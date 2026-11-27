/* Abas compartilhadas pelas fichas antigas e pela página dinâmica. */
(function () {
  function init(root = document) {
    root.querySelectorAll(".tabs").forEach(group => {
      const tabs = [...group.querySelectorAll(".tab")];
      if (!tabs.length || group.dataset.tabsReady) return;
      const key = tab => tab.dataset.i ?? tab.dataset.t;
      const panes = [...group.parentElement.querySelectorAll(".pane")];
      const panelFor = tab => panes.find(panel => (panel.dataset.i ?? panel.dataset.p) === key(tab));
      const prefix = group.id || "game-tabs";
      group.id = prefix;
      group.setAttribute("role", "tablist");
      group.setAttribute("aria-label", "Conteúdo do jogo");
      function activate(tab, focus = false) {
        tabs.forEach((item, i) => {
          const selected = item === tab;
          const panel = panelFor(item);
          item.id = prefix + "-tab-" + i;
          item.type = "button";
          item.setAttribute("role", "tab");
          item.setAttribute("aria-selected", String(selected));
          item.tabIndex = selected ? 0 : -1;
          item.classList.toggle("on", selected);
          item.classList.remove("active");
          if (panel) {
            panel.id = prefix + "-panel-" + i;
            panel.setAttribute("role", "tabpanel");
            panel.setAttribute("aria-labelledby", item.id);
            item.setAttribute("aria-controls", panel.id);
            panel.tabIndex = 0;
            panel.hidden = !selected;
            panel.classList.toggle("on", selected);
            panel.classList.remove("active");
          }
        });
        if (focus) tab.focus();
      }
      group.addEventListener("click", event => {
        const tab = event.target.closest(".tab");
        if (tabs.includes(tab)) activate(tab);
      });
      group.addEventListener("keydown", event => {
        const current = tabs.indexOf(event.target);
        if (current < 0) return;
        let next;
        switch (event.key) {
          case "ArrowRight": next = (current + 1) % tabs.length; break;
          case "ArrowLeft": next = (current - 1 + tabs.length) % tabs.length; break;
          case "Home": next = 0; break;
          case "End": next = tabs.length - 1; break;
          default: return;
        }
        event.preventDefault();
        activate(tabs[next], true);
      });
      activate(tabs.find(tab => tab.classList.contains("on") || tab.classList.contains("active")) || tabs[0]);
      group.dataset.tabsReady = "true";
    });
  }
  window.GameTipsTabs = { init };
  init();
  // Mantém os links antigos e oferece acesso às fichas ampliadas.
  const legacyPage = location.pathname.split("/").pop();
  const legacySlug = legacyPage && legacyPage.endsWith(".html") ? legacyPage.slice(0, -5) : "";
  if (legacySlug && legacySlug !== "index" && legacySlug !== "jogo" && document.querySelector(".tabs")) {
    const link = document.createElement("a");
    link.className = "back";
    link.href = "jogo.html?j=" + encodeURIComponent(legacySlug);
    link.textContent = "Ver ficha ampliada, curiosidades e requisitos →";
    const p = document.createElement("p");
    p.append(link);
    document.querySelector(".tabs").before(p);
  }
})();
