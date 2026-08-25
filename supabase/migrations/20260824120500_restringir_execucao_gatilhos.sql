-- Funções de gatilho não devem ficar expostas como RPC em /rest/v1/rpc.
revoke execute on function public.provisionar_novo_usuario() from public, anon, authenticated;
revoke execute on function public.definir_atualizado_em()   from public, anon, authenticated;
