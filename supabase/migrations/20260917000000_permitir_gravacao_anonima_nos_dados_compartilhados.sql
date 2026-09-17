-- Gravação sem login nos dados compartilhados.
--
-- O painel não tem tela de login: ele fala com a API REST como visitante
-- (papel `anon`), usando a chave publicável que fica visível no HTML da página.
-- Até aqui o visitante só podia LER as linhas compartilhadas (usuario_id nulo),
-- então toda importação ficava presa no localStorage do navegador e nunca
-- chegava ao banco.
--
-- A pedido explícito do dono do projeto, e depois de apresentada a alternativa
-- com autenticação, o visitante passa a poder gravar nessas mesmas linhas.
--
-- CONSEQUÊNCIA, registrada de propósito: estas linhas já eram legíveis por
-- qualquer pessoa com a chave publicável; agora também são graváveis por
-- qualquer uma delas. Não há separação por usuário nos dados compartilhados.
-- Para fechar isso no futuro, o caminho é autenticar o usuário (inclusive
-- login anônimo do Supabase) e voltar a exigir usuario_id = auth.uid().
--
-- O alcance fica restrito às três tabelas que a importação escreve.
-- categorias, contas, cartoes, regras_categorizacao e perfis seguem
-- somente-leitura para o visitante.

-- competências (os meses)
create policy "competencias: visitante cria compartilhada"
  on public.competencias for insert to anon
  with check (usuario_id is null);

create policy "competencias: visitante altera compartilhada"
  on public.competencias for update to anon
  using (usuario_id is null) with check (usuario_id is null);

create policy "competencias: visitante remove compartilhada"
  on public.competencias for delete to anon
  using (usuario_id is null);

-- faturas de cartão
create policy "faturas: visitante cria compartilhada"
  on public.faturas for insert to anon
  with check (usuario_id is null);

create policy "faturas: visitante altera compartilhada"
  on public.faturas for update to anon
  using (usuario_id is null) with check (usuario_id is null);

create policy "faturas: visitante remove compartilhada"
  on public.faturas for delete to anon
  using (usuario_id is null);

-- lançamentos
create policy "lancamentos: visitante cria compartilhada"
  on public.lancamentos for insert to anon
  with check (usuario_id is null);

create policy "lancamentos: visitante altera compartilhada"
  on public.lancamentos for update to anon
  using (usuario_id is null) with check (usuario_id is null);

create policy "lancamentos: visitante remove compartilhada"
  on public.lancamentos for delete to anon
  using (usuario_id is null);
