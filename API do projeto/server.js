const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const requestIp = require("request-ip"); // Biblioteca para capturar IPs
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid"); // Biblioteca para gerar UUIDs
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: "",  // Local da hospedagem front-end
    credentials: true
}));

app.use(requestIp.mw()); // Middleware para capturar IPs
app.use(cookieParser());

// Verificando se a variável de ambiente MONGO_URI está definida
if (!process.env.MONGO_URI) {
    console.error("Erro: MONGO_URI não está definida no arquivo .env");
    process.exit(1);
}

// Mensagem de ativação caso a MONGO_URI seja válida ou não
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB conectado"))
    .catch(err => {
        console.error("Erro ao conectar ao MongoDB:", err);
        process.exit(1);
    });

// Definição do modelo de dados
const ConfirmacaoSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    guests: { type: Number, required: true, min: 0 },
    deviceId: { type: String, required: true, unique: true },
    ip: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Confirmacao = mongoose.model("Confirmacao", ConfirmacaoSchema);

// Rota de confirmação de presença
app.post("/api/confirmacao", async (req, res) => {
    const { name, guests } = req.body;
    const ip = req.clientIp;
    let deviceId = req.cookies.deviceId || req.headers['device-id'];

    if (!name || (!guests && guests !== 0)) {
        return res.status(400).json({ message: "Nome e acompanhantes são obrigatórios." });
    }
    if (typeof name !== "string" || name.trim().length < 3) {
        return res.status(400).json({ message: "O nome deve ter pelo menos 3 caracteres." });
    }
    if (guests < 0) {
        return res.status(400).json({ message: "O número de acompanhantes não pode ser negativo." });
    }

    // uuidv4 com tempo de duração de 1 ano
    try {
        if (!deviceId) {
            deviceId = uuidv4();
            res.cookie("deviceId", deviceId, {
                httpOnly: true,
                maxAge: 365 * 24 * 60 * 60 * 1000
            });
        }

        // Impedir múltiplas confirmações pelo mesmo nome ou dispositivo
        const existente = await Confirmacao.findOne({ $or: [{ name }, { deviceId }] });
        if (existente) {
            return res.status(403).json({ message: "Você já confirmou sua presença!" });
        }

        const confirmacao = new Confirmacao({ name, guests, deviceId, ip });
        await confirmacao.save();
        res.status(201).json({ message: "Presença confirmada com sucesso!", data: confirmacao });
    } catch (error) {
        console.error("Erro ao salvar confirmação:", error);
        res.status(500).json({ message: "Erro ao salvar confirmação.", error });
    }
});

// Rota get para visualizar a lista de confirmados
app.get("/api/confirmados", async (req, res) => {
    try {
        const confirmacoes = await Confirmacao.find(); // Busca todas as confirmações

        // Conta o número total de pessoas (quem confirmou + acompanhantes)
        const totalPessoas = confirmacoes.reduce((acc, confirmacao) => acc + confirmacao.guests + 1, 0);

        res.status(200).json({ totalPessoas, confirmacoes });
    } catch (error) {
        console.error("Erro ao buscar confirmações:", error);
        res.status(500).json({ message: "Erro ao buscar confirmações.", error });
    }
});

// Inicia a api na porta .env ou usando o padrão 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
