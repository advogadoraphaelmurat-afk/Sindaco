import Link from 'next/link';

export default function TestPage() {
  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>✅ Deploy Conectado com Sucesso!</h1>
      <p>Se você está vendo esta página, a Vercel está lendo a pasta <strong>app</strong> corretamente (na raiz).</p>
      <p>ID do Deploy: {new Date().toISOString()}</p>
      <Link href="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>
        Voltar para a Home
      </Link>
    </div>
  );
}
