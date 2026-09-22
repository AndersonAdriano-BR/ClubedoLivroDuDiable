CLUBE DO LIVRO DU DIABLE — BETA FINAL v3

Esta versão corrige a base do jogo multiplayer do Dom Quixote.

Principais pontos:
- Tema escuro é o padrão do jogo. Essa convenção deve ser mantida nos jogos futuros.
- Chat fica no painel direito, abaixo do placar, e pode ser recolhido/reaberto por um botão sem perder o histórico.
- O cabeçalho do jogo usa a marca PAINT com ícone de pincel.
- Placar mostra jogadores, cores e pontuação.
- Não existe cronômetro de rodada.
- A roleta é iniciada manualmente pelo botão "Sortear".
- Os nomes aparecem em ordem alfabética na roleta.
- O vencedor do sorteio fica destacado e a ordem horária é indicada por 5 segundos.
- A palavra é sorteada automaticamente quando a rodada começa.
- O banco de palavras fica codificado no JavaScript para não aparecer como texto simples no arquivo-fonte.
- O Supabase Realtime é usado para presença, lobby, chat, turnos, desenho e pontuação.
- O desenho é sincronizado em pequenos lotes para reduzir perda de traços iniciais.
- O estado da partida é salvo localmente para sobreviver a F5/atualização da página.
- O ID do jogador é persistente no navegador, evitando que um refresh gere um jogador duplicado.
- A lista de jogadores fica congelada quando a partida começa; quem chega depois espera a próxima partida.
- Esc abre o livro por cima do jogo e Esc novamente fecha o livro.

PUBLICAÇÃO:
1. Envie todos os arquivos desta pasta para a raiz do GitHub.
2. Esta versão propositalmente não inclui a pasta assets; as capas podem ser enviadas separadamente ao GitHub em assets/covers quando desejado.
3. O GitHub Pages hospeda o site.
4. O jogo usa diretamente o Supabase pelo navegador, sem server.js/Node.js.

OBSERVAÇÃO:
O código foi preparado e validado localmente quanto à estrutura e sintaxe. O teste final que confirma dois navegadores trocando mensagens pelo seu projeto Supabase precisa ser feito em uma conexão real.
