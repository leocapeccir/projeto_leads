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
app.post('/api/matricular', (req, res) => {
    const { nome, email, telefone, cursoId, turmaId } = req.body;  // Alterado para 'cursoId' e 'turmaId'

    console.log(req.body); // Verifique os dados recebidos

    if (!nome || !email || !telefone || !cursoId || !turmaId) {
        return res.status(400).json({
            erro: 'Todos os campos são obrigatórios',
            missingFields: {
                nome: !nome,
                telefone: !telefone,
                email: !email,
                cursoId: !cursoId,  // Verificando se 'cursoId' está presente
                turmaId: !turmaId   // Verificando se 'turmaId' está presente
            }
        });
    }

    // Gerar código de matrícula (sequencial ou baseado na lógica do seu banco)
    const gerarCodigoMatricula = async () => {
        // Aqui você pode gerar um código único, sequencial ou qualquer outra lógica
        try {
            const result = await db.query('SELECT MAX(CodigoMatricula) FROM Alunos');
            let ultimoCodigo = result.rows[0].max || 0;
            let novoCodigo = parseInt(ultimoCodigo) + 1; // Incrementa o último código
            return novoCodigo;
        } catch (err) {
            console.error('Erro ao gerar código de matrícula:', err);
            return 1; // Se ocorrer um erro, iniciar com 1
        }
    };

    // Obter o código de matrícula
    gerarCodigoMatricula().then(codigoMatricula => {
        // Salvar o aluno no banco
        const aluno = {
            codigoMatricula,
            nome,
            email,
            telefone,
            cursoId,  // 'cursoId' sendo usado corretamente
            turmaId,  // 'turmaId' sendo usado corretamente
            dataCadastro: new Date()
        };

        const query = `
            INSERT INTO Alunos (CodigoMatricula, Nome, Email, Telefone, CursoId, TurmaId, DataCadastro)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        db.query(query, [
            aluno.codigoMatricula,
            aluno.nome,
            aluno.email,
            aluno.telefone,
            aluno.cursoId,
            aluno.turmaId,
            aluno.dataCadastro
        ], (err, result) => {
            if (err) {
                return res.status(500).json({ erro: 'Erro ao matricular aluno' });
            }

            res.status(200).json({ mensagem: 'Aluno matriculado com sucesso', aluno });
        });
    }).catch(err => {
        res.status(500).json({ erro: 'Erro ao gerar código de matrícula' });
    });
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
