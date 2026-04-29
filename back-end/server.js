import express from "express"
import cors from "cors"
import YahooFinance from 'yahoo-finance2'
import fs from "fs"
import csv from "csv-parser"

const app = express()
app.use(cors())
app.use(express.json())

const yahooFinance = new YahooFinance()    // instancia
// Cache em memória
let cacheDados = []
let ultimaAtualizacao = null

function carregarAtivos() {
  return new Promise((resolve, reject) => {
    const ativos = []
    fs.createReadStream("ativos.csv")
      .pipe(csv())
      .on("data", (row) => ativos.push(row.ativos))
      .on("end", () => resolve(ativos))
      .on("error", reject)
  })
}

async function atualizarDados() {
  try {
    console.log("🔄 Atualizando dados...")
    const ativos = await carregarAtivos()
    console.log("✅ Ativos carregados:", ativos.length)

    cacheDados = await Promise.all(
      ativos.map(async (ativo) => {
        const quote = await yahooFinance.quote(ativo)
        return {
          ticker: ativo,
          change: quote.regularMarketChangePercent.toFixed(2) + "%",
          price: quote.regularMarketPrice.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          moeda: quote.currency
        }
      })
    )
    ultimaAtualizacao = new Date().toISOString().replace("T", " ").split(".")[0]
    console.log(`✅ Dados atualizados às ${ultimaAtualizacao}`)
  } catch (err) {
    console.error("Erro ao atualizar dados:", err.message)
  }
}

// Rota — só lê o cache, resposta instantânea
app.get('/ativos_change', (req, res) => {
  res.json({
    atualizado_em: ultimaAtualizacao,
    dados: cacheDados
  })
})

// Inicia e agenda atualização a cada 2 minutos
await atualizarDados()
setInterval(atualizarDados, 2 * 60 * 1000)

app.listen(3000, "0.0.0.0", () => console.log('Servidor rodando na porta 3000'))