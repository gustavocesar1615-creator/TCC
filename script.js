document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab,.pane').forEach(e=>e.classList.remove('active'));b.classList.add('active');document.querySelector(`.pane[data-p='${b.dataset.t}']`).classList.add('active')});
document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(b=>b.setAttribute('aria-selected',String(b===tab)))}));
const search=document.getElementById('game-search');
if(search){
  const cards=[...document.querySelectorAll('.grid .card')];
  const filters=[...document.querySelectorAll('.filter')];
  const count=document.getElementById('games-count');
  const empty=document.querySelector('.no-results');
  let active='Todos';
  function normalize(text){return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function update(){
    const term=normalize(search.value.trim());let visible=0;
    cards.forEach(card=>{
      const title=normalize(card.querySelector('h3')?.textContent||'');
      const matchesTitle=title.includes(term);
      const matchesCategory=active==='Todos'||card.dataset.genre===active;
      const show=matchesTitle&&matchesCategory;
      card.hidden=!show;if(show)visible++;
    });
    count.textContent='Mostrando '+visible+' de '+cards.length+' jogos';
    empty.hidden=visible!==0;
  }
  search.addEventListener('input',update);
  filters.forEach(btn=>btn.addEventListener('click',()=>{
    active=btn.dataset.filter;
    filters.forEach(item=>{item.classList.toggle('active',item===btn);item.setAttribute('aria-pressed',String(item===btn))});
    update();
  }));
  update();
}
