// Pequeno JavaScript compartilhado entre a página inicial e as páginas dos jogos.
const ano = document.getElementById('ano');
if (ano) ano.textContent = new Date().getFullYear();

// Troca entre História, Mecânicas, Dicas e Curiosidades.
const barraDeAbas = document.querySelector('.abas-jogo');
if (barraDeAbas) {
  const abas = [...barraDeAbas.querySelectorAll('[role="tab"]')];

  function abrirAba(aba, atualizarEndereco = true) {
    abas.forEach(item => {
      const selecionada = item === aba;
      item.classList.toggle('ativo', selecionada);
      item.setAttribute('aria-selected', String(selecionada));
      item.tabIndex = selecionada ? 0 : -1;
      const painel = document.getElementById(item.getAttribute('aria-controls'));
      if (painel) painel.hidden = !selecionada;
    });
    if (atualizarEndereco) {
      const identificador = aba.id.replace('aba-', '');
      history.replaceState(null, '', '#' + identificador);
    }
  }

  abas.forEach((aba, indice) => {
    aba.addEventListener('click', () => abrirAba(aba));
    aba.addEventListener('keydown', event => {
      let proxima;
      if (event.key === 'ArrowRight') proxima = (indice + 1) % abas.length;
      else if (event.key === 'ArrowLeft') proxima = (indice + abas.length - 1) % abas.length;
      else if (event.key === 'Home') proxima = 0;
      else if (event.key === 'End') proxima = abas.length - 1;
      if (proxima !== undefined) {
        event.preventDefault();
        abas[proxima].focus();
        abrirAba(abas[proxima]);
      }
    });
  });

  const destino = document.getElementById('aba-' + window.location.hash.slice(1));
  if (destino && abas.includes(destino)) abrirAba(destino, false);
}
