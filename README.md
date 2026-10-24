# Sora

Painel do Sora (exportado do design) com login pelo Supabase Auth.

- `login.html`: entrar, criar conta e recuperar senha.
- `auth.js`: conexão com o Supabase, proteção do painel e botão "Sair".
- `index.html`: o painel. As 3 linhas marcadas com "LOGIN SORA" no `<head>` protegem a página.

## Ao exportar o design de novo

O export substitui o `index.html`. Depois de exportar, cole de volta logo abaixo do `<title>`:

```html
<script>document.documentElement.style.visibility='hidden'</script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js"></script>
<script src="auth.js"></script>
```

## Supabase

Authentication → URL Configuration: Site URL = `https://digital-one-zeta.vercel.app` e, em
Redirect URLs, `https://digital-one-zeta.vercel.app/login.html`.
