const menuButton=document.querySelector('[data-menu]');
const closeMenu=()=>{document.body.classList.remove('menu-open');if(menuButton){menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');menuButton.textContent='☰'}};
if(menuButton){menuButton.addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');menuButton.textContent=open?'×':'☰'});}
document.querySelectorAll('.nav-links a').forEach(link=>link.addEventListener('click',closeMenu));
addEventListener('resize',()=>{if(innerWidth>960)closeMenu()});
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const search=document.querySelector('[data-help-search]');
if(search){const cards=[...document.querySelectorAll('[data-help-card]')];const count=document.querySelector('[data-search-count]');const empty=document.querySelector('[data-no-results]');const run=()=>{const q=search.value.trim().toLowerCase();let visible=0;cards.forEach(card=>{const match=!q||card.textContent.toLowerCase().includes(q);card.hidden=!match;if(match)visible++});count.textContent=`${visible} shown`;empty.style.display=visible?'none':'block'};search.addEventListener('input',run);run();}
