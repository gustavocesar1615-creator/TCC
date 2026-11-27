# GameTips

Projeto de Trabalho de Conclusão de Curso (TCC): catálogo web de orientações sobre jogos digitais, destinado principalmente a jogadores iniciantes, com explicações sem spoilers importantes.

## Funcionalidades

- Catálogo com busca por nome (sem distinção de acentos e maiúsculas) e filtros por gênero.
- Fichas com dicas, mecânicas, informações e curiosidades, conforme o conteúdo de cada jogo.
- Requisitos de PC e metadados da Steam; Fortnite utiliza informações da Epic Games.
- Sugestões de jogos semelhantes, imagens com alternativa em caso de falha e interface responsiva.
- Navegação por teclado nas abas e indicação da categoria selecionada.

## Estrutura

| Arquivo | Responsabilidade |
| --- | --- |
| index.html | Página inicial e seção sobre o projeto |
| jogo.html | Ficha dinâmica, recebe o parâmetro j na URL |
| games.js | Dados editoriais, categorias, imagens e informações do TCC |
| steam-info.js | Dados de lojas e requisitos de PC |
| site.js | Renderização, busca, filtros, fichas e rodapé |
| script.js | Comportamento compartilhado das abas, inclusive nas fichas antigas |
| style.css | Estilos, responsividade e compatibilidade |
| assets/ | Capas dos jogos |
| .github/scripts/importar-steam.py | Importação de dados da Steam |
| .github/workflows/ | Automações de dados e capas |

As páginas HTML antigas foram preservadas para manter os endereços existentes e seu conteúdo. Novos jogos devem usar a ficha dinâmica. Não é necessário servidor de aplicação, banco de dados ou autenticação.

## Executar localmente

1. Clone o repositório ou faça download do ZIP.
2. Na pasta do projeto, execute `python -m http.server 8000` (ou `python3 -m http.server 8000`).
3. Abra http://localhost:8000 no navegador.

## Como cadastrar ou editar um jogo

Edite o array GAMES em games.js. Cada item usa s (identificador único), n (nome), k (categoria), t (resumo), img (capa opcional), tag e sub (opcionais) e secs (pares de título e HTML editorial). A capa padrão é assets/<identificador>.jpg. A ficha é acessada por jogo.html?j=<identificador>. Adicione os dados da loja em steam-info.js quando disponíveis. Use apenas fontes verificáveis e não introduza HTML de visitantes nas seções.

## Atualização de dados

Na aba Actions do GitHub, os fluxos "Atualizar dados Steam do GameTips" e "Importar capas do GameTips" podem ser iniciados manualmente. Eles também são acionados por alterações nos respectivos arquivos de automação. O fluxo da Steam lê os identificadores já cadastrados em steam-info.js; o de capas usa uma lista de jogos definida no próprio workflow. As mudanças são gravadas no repositório quando houver diferenças. As informações não são consultadas em tempo real pelo visitante. Fortnite não usa a Steam.

## Publicação

O projeto pode ser servido pelo GitHub Pages a partir da raiz da branch main, conforme a configuração de Pages do repositório.

## Verificação antes da entrega

- Abrir o catálogo, testar busca por nome, acentos, filtros e busca sem resultado.
- Abrir uma ficha dinâmica e uma ficha antiga; trocar abas por clique e teclado (setas, Home e End).
- Verificar requisitos da Steam e da Epic Games, links de fontes, imagens e URL inválida.
- Conferir o layout em celular e computador.
- Completar informações acadêmicas, justificativa, relatos pessoais e referências reais; não inventar dados ou experiências.
- Registrar os resultados de testes no relatório acadêmico.

## Créditos

Nomes e imagens dos jogos pertencem aos seus respectivos titulares. Consulte as fontes oficiais indicadas nas fichas. Este projeto tem finalidade acadêmica.

## Pesquisa editorial das fichas (27/11/2026)

Os 39 jogos receberam uma seção "Contexto e design" e três novas curiosidades em "Curiosidades". As informações são apresentadas em português, com referências de consulta da Steam e, quando aplicável, dos desenvolvedores ou publishers. O texto contextualiza design, história da produção, versões, acessibilidade e aspectos técnicos, evitando spoilers importantes. As fontes são indicações para conferência e não autorização de reprodução de imagens; mantenha a atribuição e confirme direitos de uso antes de incorporar capturas. A data de uma ficha de loja pode se referir à edição de PC ou a uma versão específica. As fichas antigas continuam disponíveis e oferecem um link para a ficha ampliada.

## Descoberta e biblioteca pessoal

A página inicial oferece três sugestões editoriais, histórico dos cinco últimos jogos visitados, ordenação por nome e um sorteio independente dos filtros e da busca. Nas fichas dinâmicas, o visitante pode guardar ou remover jogos e ir diretamente às dicas. Os guardados e o histórico são armazenados no localStorage do navegador, sem conta ou banco de dados; o histórico pode ser limpo. Se o armazenamento estiver indisponível, a alteração funciona somente durante a página atual. Os dados não são sincronizados entre aparelhos. As sugestões são seleções fixas, não rankings ou avaliações de usuários.

Testes adicionais: guardar/remover uma ficha, recarregar a página, filtrar guardados, ordenar A–Z/Z–A, sortear mesmo com filtros ativos e guardados vazios, abrir cinco fichas e limpar o histórico. Verificar a navegação por teclado e o layout em celulares.

### Sorteio de jogos

O botão apresenta o jogo sorteado no próprio catálogo, com link para a ficha e opção de sortear novamente. O sorteio usa o catálogo completo de jogos, independentemente dos filtros, busca e guardados. A lógica fica em sorteio.js e é carregada separadamente da interface principal. Quando há mais de uma opção, evita repetir imediatamente o mesmo jogo.

## Ampliação do catálogo para 50 jogos

Foram adicionados 11 títulos com fichas dinâmicas, cinco seções editoriais e referências à Steam. Os requisitos das novas fichas são preenchidos pela automação existente; as capas são importadas pelo fluxo de imagens, com endereço alternativo da Steam caso a capa local ainda não esteja disponível. O total do catálogo é calculado automaticamente, inclusive para filtros e sorteio.

## Ferramentas de consulta das fichas

O arquivo guia.js acrescenta um caderno de anotações independente por jogo (até 2000 caracteres), marcações manuais de leitura e links diretos por parâmetro secao. O progresso e a última aba ficam no localStorage, separados por identificador do jogo. A aba indicada no link tem prioridade sobre a última visitada. O evento gametips:tabchange é emitido pelas abas tanto no clique quanto pelo teclado. A Clipboard API copia o link, com campo alternativo para cópia manual. Dados locais, apagáveis e sem sincronização entre aparelhos.

Testar em navegador: salvar notas diferentes em duas fichas, recarregar, marcar/desmarcar abas, testar setas, abrir link com secao=dicas, voltar à última aba, copiar link e limpar progresso e anotação independentemente.
