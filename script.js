// Dicas curtas, fáceis de editar e entender.
const dicas = {
  fortnite: {
    titulo: 'Dicas de Fortnite',
    itens: [
      'Antes de entrar em partidas difíceis, treine sua movimentação no modo Criativo.',
      'Observe a tempestade e tente se posicionar com antecedência.',
      'Se você joga com amigos, combine quem vai marcar os lugares no mapa.',
      'Teste as configurações de controle e encontre uma sensibilidade confortável.'
    ]
  },
  godofwar: {
    titulo: 'Dicas de God of War',
    itens: [
      'Explore os caminhos secundários para encontrar baús e itens úteis.',
      'Leia as descrições das habilidades antes de gastar seus pontos.',
      'Preste atenção aos movimentos dos chefes e aprenda o momento certo de se esquivar.',
      'Volte a áreas antigas quando liberar novas habilidades.'
    ]
  },
  rdr2: {
    titulo: 'Dicas de Red Dead Redemption 2',
    itens: [
      'Não tenha pressa de terminar a história: converse com os personagens do acampamento.',
      'Cuide do seu cavalo e fortaleça o vínculo durante as viagens.',
      'Explore as cidades e aceite missões secundárias quando aparecerem.',
      'Use o mapa para planejar suas viagens pelo mundo aberto.'
    ]
  },
  thelastofus: {
    titulo: 'Dicas de The Last of Us',
    itens: [
      'Examine bem cada ambiente para encontrar objetos e pistas.',
      'Aproveite os momentos tranquilos para conhecer melhor os personagens.',
      'Observe os caminhos alternativos antes de avançar.',
      'Se uma parte estiver difícil, ajuste a dificuldade para curtir a história.'
    ]
  }
};

const painel = document.getElementById('painel-dicas');
const titulo = document.getElementById('titulo-dicas');
const lista = document.getElementById('lista-dicas');
const botoes = document.querySelectorAll('.ver-dicas');

botoes.forEach(botao => {
  botao.addEventListener('click', () => {
    const jogo = dicas[botao.dataset.game];
    titulo.textContent = jogo.titulo;
    lista.replaceChildren();
    jogo.itens.forEach(texto => {
      const item = document.createElement('li');
      item.textContent = texto;
      lista.appendChild(item);
    });
    botoes.forEach(b => b.setAttribute('aria-expanded', b === botao ? 'true' : 'false'));
    painel.hidden = false;
    painel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});

document.getElementById('fechar-dicas').addEventListener('click', () => {
  painel.hidden = true;
  botoes.forEach(botao => botao.setAttribute('aria-expanded', 'false'));
});
document.getElementById('ano').textContent = new Date().getFullYear();
