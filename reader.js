const params=new URLSearchParams(location.search);
const bookId=Number(params.get("book"))||1;
const book=books.find(b=>b.id===bookId)||books[0];
const user=sessionStorage.getItem("clubReaderName")||"Leitor";

document.getElementById("bookTitle").textContent=book.title;
document.getElementById("bookMeta").textContent=`${book.author} · ${book.year}`;
document.getElementById("readerUser").textContent=`Leitor: ${user}`;
document.getElementById("pageCount").textContent=`${book.pages.length} páginas · rolagem contínua`;

const stack=document.getElementById("pdfStack");
book.pages.forEach((p,i)=>{
  const page=document.createElement("article");
  page.className="paper-page";
  page.innerHTML=`
    <div class="page-inner">
      <div class="page-running">${book.title}<span>DU DIABLE</span></div>
      <p class="page-label">Página ${String(i+1).padStart(2,'0')}</p>
      <h2>${p.title}</h2>
      <div class="page-divider">❦</div>
      <div class="page-text">${p.text.split(/\n+/).map(t=>`<p>${t}</p>`).join("")}</div>
      <div class="page-number">${i+1}</div>
    </div>`;
  stack.appendChild(page);
});

// Rolagem com âncoras naturais e atalho Home/End como em um leitor de documento.
document.addEventListener("keydown",e=>{
  if(e.key==="Home"){e.preventDefault();window.scrollTo({top:0,behavior:"smooth"});}
  if(e.key==="End"){e.preventDefault();window.scrollTo({top:document.documentElement.scrollHeight,behavior:"smooth"});}
});

if(new URLSearchParams(location.search).get('overlay')==='1'){ document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ e.preventDefault(); parent.postMessage({type:'closeBookOverlay'}, '*'); } }, true); }
