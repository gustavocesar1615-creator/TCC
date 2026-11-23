const COR={"RPG":"#c084fc","Ação":"#f87171","Exploração":"#34d399","Simulação":"#fbbf24","Campanha":"#fb7185","Multijogador":"#38bdf8","Mundo aberto":"#f59e0b","Terror":"#ef4444","Plataforma":"#2dd4bf","Estratégia":"#60a5fa","Quebra-cabeça":"#a3e635"};
const $=s=>document.querySelector(s);
const cor=g=>COR[g.k]||"#a78bfa";
const imgSrc=g=>g.img||`assets/${g.s}.jpg`;
function thumb(g,cls="thumb"){return `<img class="${cls}" src="${imgSrc(g)}" alt="${g.n}" loading="lazy" onerror="this.outerHTML='<div class=\\'${cls} ph\\'>${g.n[0]}</div>'">`}
function rodape(){const p=[SITE.nome,"Projeto de TCC",SITE.autor,SITE.curso,SITE.ano].filter(Boolean);$("footer").textContent=p.join(" • ")}
function home(){
  const cats=[...new Set(GAMES.map(g=>g.k))].sort();let cat="Todos";
  $("#chips").innerHTML=["Todos",...cats].map(c=>`<button class="chip${c=="Todos"?" on":""}" data-c="${c}">${c}</button>`).join("");
  $("#sobre-n").textContent=GAMES.length;
  const draw=()=>{const q=$("#busca").value.trim().toLowerCase();
    const l=GAMES.filter(g=>(cat=="Todos"||g.k==cat)&&g.n.toLowerCase().includes(q));
    $("#cont").textContent=`Mostrando ${l.length} de ${GAMES.length} jogos`;
    $("#grid").innerHTML=l.map(g=>`<a class="card" style="--c:${cor(g)}" href="jogo.html?j=${g.s}">${thumb(g)}<div class="b"><small>${g.k}</small><h3>${g.n}</h3><p>${g.t}</p><span>Ver dicas →</span></div></a>`).join("")||`<p class="muted">Nenhum jogo encontrado.</p>`};
  $("#busca").oninput=draw;
  $("#chips").onclick=e=>{if(!e.target.dataset.c)return;cat=e.target.dataset.c;document.querySelectorAll(".chip").forEach(b=>b.classList.toggle("on",b==e.target));draw()};
  draw();rodape()}
function jogo(){
  const g=GAMES.find(x=>x.s==new URLSearchParams(location.search).get("j"));
  if(!g){$("main").innerHTML=`<p>Jogo não encontrado. <a href="index.html#jogos">Voltar</a></p>`;return rodape()}
  document.title=`${g.n} | ${SITE.nome}`;document.body.style.setProperty("--c",cor(g));
  const sec=g.secs||[];
  const tabs=sec.length>1?`<div class="tabs">${sec.map((s,i)=>`<button class="tab${i?"":" on"}" data-i="${i}">${s[0]}</button>`).join("")}</div>`:"";
  const body=sec.length?sec.map((s,i)=>`<section class="pane${i?"":" on"}" data-i="${i}"><h2>${s[0]}</h2>${s[1]}</section>`).join(""):`<p class="soon">As dicas desse jogo ainda estão sendo escritas. Volta daqui a pouco.</p>`;
  const rel=GAMES.filter(x=>x!=g&&x.k==g.k).slice(0,4);
  $("main").innerHTML=`<a class="back" href="index.html#jogos">← Voltar para os jogos</a><div class="hero"><div><span class="tag">${g.tag||g.k}</span><h1>${g.n}</h1><p class="lead">${g.sub||g.t}</p></div>${thumb(g)}</div>${tabs}${body}<h2>Veja também</h2><div class="links">${rel.map(x=>`<a href="jogo.html?j=${x.s}">${x.n} ↗</a>`).join("")}</div>`;
  $("main").onclick=e=>{const i=e.target.dataset.i;if(i==null||!e.target.classList.contains("tab"))return;document.querySelectorAll(".tab,.pane").forEach(el=>el.classList.toggle("on",el.dataset.i==i))};
  rodape()}
document.body.dataset.p=="home"?home():jogo();