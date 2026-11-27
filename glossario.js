/* Busca local no glossário. O conteúdo também funciona sem JavaScript. */
(function () {
  const controls = document.querySelector(".gloss-controls");
  const terms = [...document.querySelectorAll(".gloss-term")];
  const search = document.getElementById("gloss-search");
  const category = document.getElementById("gloss-category");
  const letters = document.getElementById("gloss-letters");
  const count = document.getElementById("gloss-count");
  const empty = document.getElementById("gloss-empty");
  if (!controls || !search || !category || !letters || !count || !empty) return;
  const normalize = text => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const indexed = terms.map(term => ({term, search: normalize(term.textContent), category: term.dataset.category, letter: term.dataset.letter}));
  let letter = "";
  const buttons = ["", ...new Set(indexed.map(item => item.letter))].sort((a,b) => a.localeCompare(b));
  for (const value of buttons) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gloss-letter";
    button.textContent = value || "Todas";
    button.dataset.letter = value;
    button.addEventListener("click", () => { letter = value; draw(); });
    letters.appendChild(button);
  }
  function draw() {
    const words = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const item of indexed) {
      const matches = (!category.value || item.category === category.value) &&
        (!letter || item.letter === letter) && words.every(word => item.search.includes(word));
      item.term.hidden = !matches;
      if (matches) visible++;
    }
    for (const button of letters.querySelectorAll("button")) {
      button.setAttribute("aria-pressed", String(button.dataset.letter === letter));
    }
    count.textContent = visible + " de " + indexed.length + " termos";
    empty.hidden = visible !== 0;
  }
  function clear() {
    search.value = ""; category.value = ""; letter = ""; draw();
  }
  search.addEventListener("input", draw);
  category.addEventListener("change", draw);
  document.getElementById("gloss-clear").addEventListener("click", () => { clear(); search.focus(); });
  function revealLinkedTerm() {
    const id = location.hash.slice(1);
    const target = terms.find(term => term.id === id);
    if (!target) return;
    if (target.hidden) clear();
    target.scrollIntoView({block: "start"});
  }
  window.addEventListener("hashchange", revealLinkedTerm);
  controls.hidden = false;
  draw();
  revealLinkedTerm();
})();
