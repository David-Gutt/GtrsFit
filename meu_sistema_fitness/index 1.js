const express = require('express');
const db = require('./db');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.json());

// Rota raiz para teste rápido
app.get('/', (req, res) => res.send('Servidor GtrsFit Online e Corrigido!'));

// 1. TESTE DE CONEXÃO (Tratamento de erro corrigido)
app.get('/teste-conexao', async (req, res) => {
    try {
        const resBanco = await db.query('SELECT NOW()'); 
        res.json({ 
            mensagem: "Conexão com o banco realizada com sucesso!", 
            hora_no_banco: resBanco.rows[0].now 
        });
    } catch (err) {
        console.error("Erro na conexão:", err);
        res.status(500).json({ error: "Erro ao conectar no banco de dados", detalhe: err.message });
    }
});

// 2. CADASTRO DE ALUNOS (Usando replaceAll como sugerido pelo SonarQube)
app.post('/alunos', async (req, res) => {
    const { cpf, nome_completo, email, whatsapp, data_nascimento } = req.body;
    try {
        // replaceAll garante que todos os caracteres não numéricos sejam removidos
        const cpfLimpo = cpf.toString().replaceAll(/\D/g, "");
        
        const result = await db.query(
            'INSERT INTO alunos (cpf, nome_completo, email, whatsapp, data_nascimento) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
            [cpfLimpo, nome_completo, email, whatsapp, data_nascimento]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Erro ao cadastrar:", err);
        res.status(500).json({ error: 'Erro ao cadastrar aluno. O CPF pode já existir.' });
    }
});

// 3. REGISTRAR SENHA (Tratamento de exceção completo)
app.put('/registrar-senha', async (req, res) => {
    const { cpf, senha } = req.body;
    try {
        const cpfLimpo = cpf.toString().replaceAll(/\D/g, "");
        const hash = await bcrypt.hash(senha, 10);
        
        const result = await db.query(
            'UPDATE alunos SET senha_hash = $1, primeiro_acesso = FALSE WHERE cpf = $2 RETURNING id_aluno',
            [hash, cpfLimpo]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }
        res.json({ mensagem: "Senha definida com sucesso!" });
    } catch (err) {
        console.error("Erro no registro de senha:", err);
        res.status(500).json({ error: 'Erro interno ao processar senha' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor GtrsFit rodando em http://localhost:${PORT}`);
});