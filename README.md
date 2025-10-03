# Sindaco - Vota Condomínios

Sistema Inteligente de Gestão Condominial e Votação Online.

Este é um projeto [Next.js](https://nextjs.org) iniciado com [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🚀 Como iniciar

Primeiro, instale as dependências:
```bash
npm install
```

Configure o seu `.env`:
- `DATABASE_URL` (Conector Supabase)
- `DIRECT_URL` (Pooler Supabase)
- `JWT_SECRET`

Execute o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## 📦 Build de Produção

Para verificar se o projeto está pronto para a Vercel:
```bash
npm run build
```

## 🛠️ Tecnologias
- Next.js 15
- Prisma ORM
- Supabase (PostgreSQL)
- Tailwind CSS
- Framer Motion
- jsPDF (Ata das Votações)
