const params = new URLSearchParams(location.search);
const id = Number(params.get("book")) || 1;
const user = sessionStorage.getItem("clubReaderName") || localStorage.getItem("clubReaderName") || "Leitor";

// Cada livro pode ter seu próprio jogo. Por enquanto, o Dom Quixote
// é o primeiro jogo multiplayer realmente instalado.
const gameRoutes = {
  1: "game-dom-quixote.html"
};

if (gameRoutes[id]) {
  // Mantém o nome do leitor disponível quando a página do jogo abrir.
  sessionStorage.setItem("clubReaderName", user);
  localStorage.setItem("clubReaderName", user);
  window.location.replace(`${gameRoutes[id]}?book=${id}`);
} else {
  const book = books.find(b => b.id === id) || books[0];
  document.getElementById("secretBookNo").textContent = `VOLUME ${String(book.id).padStart(2, "0")} · ${book.title}`;
  document.getElementById("gameTitle").textContent = book.game;
  document.getElementById("gameUser").textContent = user.toUpperCase();
  document.getElementById("gameCode").textContent = `DD-${String(book.id).padStart(2, "0")}-${book.author.split(/\s+/).map(s => s[0]).join("").slice(0,4).toUpperCase()}`;
  document.body.style.setProperty("--accent", book.accent || "#68f0b2");
}
