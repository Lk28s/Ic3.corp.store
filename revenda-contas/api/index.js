const { sql } = require('@vercel/postgres');

// Handler principal para todas as rotas API (Vercel serverless)
module.exports = async (req, res) => {
  // CORS para frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // API: Listar contas disponíveis (GET /api/contas)
    if (pathname === '/api/contas' && req.method === 'GET') {
      const { rows: contas } = await sql`SELECT * FROM contas WHERE disponivel = true`;
      res.status(200).json(contas);
      return;
    }

    // API: Adicionar conta (POST /api/contas)
    if (pathname === '/api/contas' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        const { tipo, preco, descricao } = JSON.parse(body);
        if (!tipo || !preco || !descricao) {
          res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
          return;
        }

        const { rows: [novaConta] } = await sql`
          INSERT INTO contas (tipo, preco, descricao, disponivel)
          VALUES (${tipo}, ${preco}, ${descricao}, true)
          RETURNING *
        `;

        res.status(201).json({ message: 'Conta adicionada com sucesso!', conta: novaConta });
      });
      return;
    }

    // API: Comprar conta (POST /api/comprar/:id)
    if (pathname.startsWith('/api/comprar/') && req.method === 'POST') {
      const id = parseInt(pathname.split('/')[3]);
      if (!id || isNaN(id)) {
        res.status(400).json({ message: 'ID inválido.' });
        return;
      }

      // Verifica se existe e está disponível
      const { rows: [conta] } = await sql`
        SELECT * FROM contas WHERE id = ${id} AND disponivel = true
      `;

      if (!conta) {
        res.status(404).json({ message: 'Conta não encontrada ou indisponível.' });
        return;
      }

      // Atualiza para indisponível
      await sql`
        UPDATE contas SET disponivel = false WHERE id = ${id}
      `;

      res.status(200).json({ 
        message: 'Compra realizada! Credenciais enviadas por email (simulado).', 
        conta 
      });
      return;
    }

    // Rota não encontrada
    res.status(404).json({ message: 'Rota não encontrada.' });

  } catch (error) {
    console.error('Erro no handler:', error);
    res.status(500).json({ error: error.message });
  }
};