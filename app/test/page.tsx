export default function TestPage() {
  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>✅ Deploy Conectado com Sucesso!</h1>
      <p>Se você está vendo esta página, a Vercel está lendo a pasta <strong>src/app</strong> corretamente.</p>
      <p>ID do Deploy: {new Date().toISOString()}</p>
      <a href="/">Voltar para a Home</a>
    </div>
  );
}
