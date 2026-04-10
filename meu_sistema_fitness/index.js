const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(express.json());

// Conexão Segura com o Banco de Dados
const db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// ==========================================
// 1. ÁREA DE MEMBROS (GTRS FITNESS)
// ==========================================

// Cadastro de Alunos
app.post('/alunos', async (req, res) => {
    try {
        const { cpf, nome_completo, email, whatsapp, data_nascimento } = req.body;
        const cpfLimpo = cpf.toString().replaceAll(/\D/g, "");
        const query = 'INSERT INTO alunos (cpf, nome_completo, email, whatsapp, data_nascimento) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const result = await db.query(query, [cpfLimpo, nome_completo, email, whatsapp, data_nascimento]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("[ERRO CADASTRO]:", err.message); // Resolvendo erro do SonarQube
        res.status(500).json({ error: "Falha ao registrar membro na GTRS FITNESS" });
    }
});

// Login com resposta para o Flutter
app.post('/login', async (req, res) => {
    try {
        const { cpf, senha } = req.body;
        const cpfLimpo = cpf.toString().replaceAll(/\D/g, "");
        const result = await db.query('SELECT * FROM alunos WHERE cpf = $1', [cpfLimpo]);
        
        if (result.rows.length === 0) return res.status(401).json({ error: "Credenciais inválidas" });

        const aluno = result.rows[0];
        const senhaValida = await bcrypt.compare(senha, aluno.senha_hash);
        
        if (!senhaValida) return res.status(401).json({ error: "Credenciais inválidas" });

        res.json({ 
            status: "success",
            nome: aluno.nome_completo,
            id_aluno: aluno.id_aluno,
            unidade: "GTRS FITNESS"
        });
    } catch (err) {
        console.error("[ERRO LOGIN]:", err.message);
        res.status(500).json({ error: "Erro no serviço de autenticação" });
    }
});

// ==========================================
// 2. SISTEMA DE TREINOS (ALTA PERFORMANCE)
// ==========================================

// Criar Ficha (Vinculo Aluno x Exercício)
app.post('/fichas', async (req, res) => {
    try {
        const { id_aluno, id_exercicio, series, repeticoes, descanso, dia_semana } = req.body;
        const query = `
            INSERT INTO fichas_treino (id_aluno, id_exercicio, series, repeticoes, descanso, dia_semana) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
        const result = await db.query(query, [id_aluno, id_exercicio, series, repeticoes, descanso, dia_semana]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("[ERRO FICHA]:", err.message);
        res.status(500).json({ error: "Erro ao processar ficha de treino" });
    }
});

// Buscar Treino Completo (O que aparecerá no Celular)
app.get('/treino/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT f.id_ficha, f.dia_semana, e.nome as exercicio, f.series, f.repeticoes, f.descanso
            FROM fichas_treino f
            JOIN exercicios e ON f.id_exercicio = e.id_exercicio
            WHERE f.id_aluno = $1
            ORDER BY f.dia_semana`;
        const result = await db.query(query, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error("[ERRO BUSCA TREINO]:", err.message);
        res.status(500).json({ error: "Erro ao carregar treinos" });
    }
});

// ==========================================
// 3. COMANDOS DE MANUTENÇÃO (DELETE)
// ==========================================

app.delete('/fichas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM fichas_treino WHERE id_ficha = $1 RETURNING *', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: "Item não encontrado" });
        res.json({ mensagem: "Exercício removido com sucesso!" });
    } catch (err) {
        console.error("[ERRO DELETE]:", err.message);
        res.status(500).json({ error: "Erro ao excluir item do banco" });
    }
});

// (Mantenha as rotas de /exercicios e /registrar-senha que já validamos)

// Inicialização Estilizada
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    ██████╗ ████████╗██████╗ ███████╗
    ██╔════╝ ╚══██╔══╝██╔══██╗██╔════╝
    ██║  ███╗   ██║   ██████╔╝███████╗
    ██║   ██║   ██║   ██╔══██╗╚════██║
    ╚██████╔╝   ██║   ██║  ██║███████║
     ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚══════╝
    🚀 MOTOR GTRS FITNESS ONLINE | PORTA: ${PORT}
    `);
});