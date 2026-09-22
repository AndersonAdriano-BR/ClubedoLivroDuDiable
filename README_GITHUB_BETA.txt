CLUBE DO LIVRO DU DIABLE — BETA MULTIPLAYER

Esta pasta é a versão beta preparada para upload direto no GitHub Pages.
Não contém a pasta assets de capas de propósito; o catálogo usa capas tipográficas de reserva quando não há imagem.

ARQUIVOS PRINCIPAIS
- index.html: catálogo e ficha dos livros.
- reader.html + reader.js + reader.css: leitor em rolagem contínua.
- game-dom-quixote.html + game-dom-quixote.js + game-dom-quixote.css: jogo multiplayer do Dom Quixote.
- secret.html + secret.js + secret.css: tela alternativa provisória para os demais livros.
- books-data.js: dados completos dos 15 livros e 8 páginas por livro.

MULTIPLAYER
- Supabase Realtime já configurado no jogo do Dom Quixote.
- Sala atual: du-diable:dom-quixote.
- Máximo de 10 jogadores na sala.
- Presence para presença/lobby.
- Broadcast para estado, chat e traços do desenho.
- 5 rodadas.
- +10 pontos por acerto.
- 50 palavras.
- Não existe cronômetro ou limite de tempo por turno.
- Esc abre o livro do Dom Quixote sobre o jogo e Esc novamente fecha.

IMPORTANTE PARA O GITHUB
Envie todos estes arquivos para a raiz do repositório, mantendo os nomes.
Depois do commit, o GitHub Pages publica automaticamente a nova versão.

OBSERVAÇÃO
A Publishable Key do Supabase está presente em game-dom-quixote.js porque é uma chave destinada ao cliente. Nunca coloque uma sb_secret no navegador.
