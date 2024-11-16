const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors'); // Importar o CORS

const app = express();
const port = 3000;

// Habilitar o CORS para todas as origens ou para um domínio específico
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Permite requisições da origem específica
    methods: ['GET', 'POST'],       // Permite apenas GET e POST
    allowedHeaders: ['Content-Type', 'Authorization'], // Permite cabeçalhos específicos
}));

app.use(bodyParser.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'leads',
    password: 'programadorJr',
    port: 5432,
});

// Endpoint para retornar todos os leads cadastrados
app.get('/get-leads', async (req, res) => {
    const { nome, email, curso } = req.query;
    let query = 'SELECT * FROM Leads WHERE 1=1';
    const params = [];

    if (nome) {
        query += ' AND LOWER(Nome) LIKE LOWER($' + (params.length + 1) + ')';
        params.push(`%${nome}%`);
    }
    if (email) {
        query += ' AND LOWER(Email) LIKE LOWER($' + (params.length + 1) + ')';
        params.push(`%${email}%`);
    }
    if (curso) {
        query += ' AND CursoInteresse = $' + (params.length + 1);
        params.push(curso);
    }

    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao obter leads:', err);
        res.status(500).send('Erro ao obter leads');
    }
});



app.get('/check-leads', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM Leads');
        const count = parseInt(result.rows[0].count);
        res.json({ hasLeads: count > 0 });
    } catch (err) {
        console.error('Erro ao verificar leads:', err);
        res.status(500).send('Erro ao verificar leads');
    }
});



app.post('/cadastrar-lead', async (req, res) => {
    const { nome, telefone, email, cursoInteresse } = req.body;

    // Verifique se os campos necessários foram recebidos
    if (!nome || !telefone || !email || !cursoInteresse) {
        return res.status(400).json({ 
            error: 'Todos os campos são obrigatórios',
            missingFields: {
                nome: !nome,
                telefone: !telefone,
                email: !email,
                cursoInteresse: !cursoInteresse
            }
        });
    }

    try {
        const result = await pool.query(
            'INSERT INTO Leads (Nome, Telefone, Email, CursoInteresse) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, telefone, email, cursoInteresse]
        );
        res.status(201).json(result.rows[0]);  // Retorna o lead cadastrado
    } catch (err) {
        console.error('Erro ao cadastrar lead:', err);
        res.status(500).json({ error: 'Erro ao cadastrar lead', details: err.message });
    }
});

// Endpoint para matricular o aluno
// Exemplo de endpoint de matrícula
app.post('/matricular-aluno', async (req, res) => {
    const { nome, email, telefone, cursoId, turmaId } = req.body;

    if (!nome || !email || !telefone || !cursoId || !turmaId) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    try {
        const result = await pool.query(
            `INSERT INTO alunos (nome, email, telefone, cursoId, turmaId) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [nome, email, telefone, cursoId, turmaId]
        );
    
        const aluno = result.rows[0];
        res.status(201).json({
            codigomatricula: aluno.codigomatricula,  // O código de matrícula gerado automaticamente
            datacadastro: aluno.datacadastro,        // A data de cadastro gerada automaticamente
            aluno: aluno,                            // Retorna todos os dados do aluno inserido
        });
    } catch (err) {
        console.error('Erro ao matricular aluno:', err);
        res.status(500).json({ error: 'Erro ao matricular aluno', details: err.message });
    }
    
});


app.get('/leads', async (req, res) => {
    const { nome, email, cursointeresse } = req.query; // Captura os parâmetros da query

    let query = 'SELECT * FROM Leads WHERE 1=1'; // Base da consulta SQL
    const params = [];

    // Filtro por nome
    if (nome) {
        params.push(`%${nome}%`);
        query += ` AND Nome ILIKE $${params.length}`;
    }

    // Filtro por email
    if (email) {
        params.push(`%${email}%`);
        query += ` AND Email ILIKE $${params.length}`;
    }

    // Filtro por curso
    if (cursointeresse) {
        const cursoNum = parseInt(cursointeresse, 10); // Converte o valor para inteiro
        if (!isNaN(cursoNum)) {
            params.push(cursoNum);
            query += ` AND CursoInteresse = $${params.length}`; // Aplica o filtro de curso
        } else {
            console.log("Valor de cursointeresse inválido:", cursointeresse);
        }
    }

    try {
        console.log("Consulta SQL:", query);  // Depuração da consulta
        console.log("Parâmetros:", params);  // Depuração dos parâmetros
        const result = await pool.query(query, params);  // Executa a consulta
        res.json(result.rows); // Retorna os leads encontrados
    } catch (err) {
        console.error('Erro ao buscar leads:', err);
        res.status(500).send('Erro ao buscar leads');
    }
});

app.get('/api/turmas', async (req, res) => {
    try {
        const query = 'SELECT id, descricao FROM turmas'; // Ajuste conforme o nome das colunas
        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Nenhuma turma encontrada' });
        }
        
        res.json(result.rows); // Retorna as turmas
    } catch (err) {
        console.error('Erro ao buscar turmas:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});


app.get('/consultar-alunos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM alunos');
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao consultar alunos:', error);
        res.status(500).json({ mensagem: 'Erro ao consultar alunos' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
