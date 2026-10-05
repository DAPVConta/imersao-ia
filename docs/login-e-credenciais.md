# Login e credenciais — passo a passo

Guia para o dono do painel. Explica onde cada "credencial" (endereço, chave,
senha) deve ficar e como liberar o acesso de uma pessoa.

## Primeiro: o que é cada credencial e onde ela mora

| Credencial | Parece com | É secreta? | Onde fica |
|---|---|---|---|
| Endereço do projeto Supabase | `https://ygknsbttphqnrwnywcak.supabase.co` | Não | Arquivo `.env` do projeto e variáveis da Vercel |
| Chave **publicável** | `sb_publishable_...` | Não (foi feita para ir no site) | Arquivo `.env` e variáveis da Vercel |
| Chave **secreta** | `sb_secret_...` ou `service_role` | **Sim — dá poder total no banco** | Só nos *Secrets* das Edge Functions do Supabase. Nunca no site, no Git ou numa variável que começa com `VITE_` |
| Senha do banco (Postgres) | definida ao criar o projeto | **Sim** | Só no seu gerenciador de senhas |
| Senha de cada pessoa que entra no painel | a que a pessoa escolheu | **Sim** | Dentro do Supabase Auth, guardada embaralhada (ninguém consegue ler, nem você). Nunca em código |
| Lista de quem pode ver os dados da casa | e-mails | Não | Tabela `acesso.membros` no banco |

Por que a chave publicável pode ficar à vista: ela só identifica o projeto.
Quem decide o que cada um pode ver são as **regras de acesso do banco (RLS)**
— e agora elas exigem login de um membro da casa. Sem login, o banco não
entrega nada.

Tudo que começa com `VITE_` é copiado para dentro da página e qualquer pessoa
consegue ler. Por isso a chave secreta nunca pode ter esse prefixo.

## Parte 1 — No Supabase (fazer uma vez)

Entre em https://supabase.com/dashboard e abra o projeto **imersao-ia-db**.

### 1. Crie a sua conta de login

1. Menu da esquerda: **Authentication** → **Users**.
2. Botão **Add user** → **Create new user**.
3. Preencha seu e-mail e uma senha forte (8 caracteres ou mais).
4. Deixe marcado **Auto Confirm User** (assim não precisa confirmar por e-mail).
5. Clique em **Create user**.

### 2. Coloque o seu e-mail na lista da casa

Ter conta não basta: o e-mail precisa estar na lista de membros.

1. Menu da esquerda: **SQL Editor** → **New query**.
2. Cole a linha abaixo trocando pelo seu e-mail (tudo em minúsculas):

   ```sql
   insert into acesso.membros (email) values ('seu-email@exemplo.com');
   ```

3. Clique em **Run**. Deve aparecer "Success".

Faça este passo **depois** do passo 1. Um e-mail na lista sem conta criada é
uma vaga aberta: se o cadastro livre estiver ligado (passo 3), alguém poderia
criar uma conta com ele.

### 3. Desligue o cadastro livre (recomendado)

O painel não tem botão "Criar conta": quem cria as contas é você. Para
ninguém conseguir se cadastrar por fora:

1. **Authentication** → **Sign In / Providers**.
2. Desligue **Allow new users to sign up** e salve.
3. Na mesma tela, deixe o provedor **Email** ligado (é ele que faz o login com
   e-mail e senha).

Mesmo que alguém consiga criar uma conta, sem estar na lista de membros ela
não vê nada — mas é melhor fechar a porta.

### 4. Informe o endereço do site (para o "Esqueci minha senha")

O e-mail de troca de senha traz um link que precisa voltar para o seu site.

1. **Authentication** → **URL Configuration**.
2. **Site URL**: `https://imersao-ia-green.vercel.app`
3. Em **Redirect URLs**, clique em **Add URL** e acrescente:
   - `https://imersao-ia-green.vercel.app/**`
   - `http://localhost:5173/**` (só se você roda o site no seu computador)
4. Salve.

### 5. Onde ver as chaves (só para consulta)

**Project Settings** → **API Keys**. A *Publishable key* é a que o site usa.
A *Secret key* fica aí; não copie para lugar nenhum além dos *Secrets* das
Edge Functions (**Edge Functions** → **Secrets**), se um dia uma função
precisar.

### Opcional

- **Authentication** → **Email Templates**: traduzir para o português o e-mail
  de "Reset password".
- **Authentication** → **Attack Protection**: ligar a proteção contra senhas
  vazadas (recusa senhas que já apareceram em vazamentos na internet), se o
  seu plano tiver.
- **Authentication** → **SMTP Settings**: o envio de e-mails padrão do
  Supabase é limitado a poucos por hora. Para uso real, ligue um serviço de
  e-mail próprio (Resend, Brevo, etc.).

## Parte 2 — Na Vercel

Hoje o endereço e a chave publicável já vão junto com o código (arquivo
`.env`), então **o site funciona sem mexer na Vercel**. Se quiser que os
valores fiquem na Vercel (por exemplo, para trocar de projeto Supabase sem
mexer no código):

1. Entre em https://vercel.com, abra o projeto **imersao-ia**.
2. **Settings** → **Environment Variables**.
3. Adicione as duas, marcando **Production**, **Preview** e **Development**:
   - `VITE_SUPABASE_URL` = `https://ygknsbttphqnrwnywcak.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = a *Publishable key* do Supabase
4. Salve. Variáveis novas só valem a partir da próxima publicação: vá em
   **Deployments**, no último da lista clique nos **⋯** → **Redeploy**.

O valor cadastrado na Vercel tem prioridade sobre o do arquivo `.env`.

**Nunca** cadastre a chave secreta na Vercel com nome começando por `VITE_`.
Este site não tem parte de servidor na Vercel, então ele não precisa de chave
secreta nenhuma lá.

## Dia a dia

- **Liberar outra pessoa** (ex.: alguém da família): crie a conta dela
  (Parte 1, passo 1) e depois rode
  `insert into acesso.membros (email) values ('email-dela@exemplo.com');`
- **Tirar o acesso**:
  `delete from acesso.membros where email = 'email-dela@exemplo.com';`
  Para cortar na hora, apague também a conta em **Authentication** → **Users**.
- **Esqueceu a senha**: na tela de entrada, *Esqueci minha senha*. O link
  chega por e-mail e abre a tela "Escolha sua senha nova".
- **Ver quem está na lista**: `select * from acesso.membros;`
