import express from "express"
import cors from "cors"
import YahooFinance from 'yahoo-finance2'
import fs from "fs"
import csv from "csv-parser"

const app = express()
app.use(cors())
app.use(express.json())

const yahooFinance = new YahooFinance()

// Cache em memória
let cacheDados = []
let ultimaAtualizacao = null
let moedasMap = {} // ✅ NOVO

// 🔥 CARREGAR ATIVOS
function carregarAtivos(tipo) {

 
    return new Promise((resolve, reject) => {
      const ativos = []
      fs.createReadStream("ativos.csv")
        .pipe(csv())
        .on("data", (row) => ativos.push(row.ativos))
        .on("end", () => resolve(ativos))
        .on("error", reject)
    })

}

// 🔥 CARREGAR MOEDAS (NOVO)
function carregarMoedas() {
  return new Promise((resolve, reject) => {
    const mapa = {}

    fs.createReadStream("moedaToSymbol.csv")
      .pipe(csv())
      .on("data", (row) => {
        mapa[row.code] = row.symbol
      })
      .on("end", () => resolve(mapa))
      .on("error", reject)
  })
}

// 🔥 ATUALIZAR DADOS
async function atualizarDados() {
  try {
    console.log("🔄 Atualizando dados...")

    const ativos = await carregarAtivos()
    
    console.log("✅ Ativos carregados:", ativos.length)

    // ✅ CARREGA MOEDAS
    moedasMap = await carregarMoedas(ativos.quoteType)

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

          moeda: quote.quoteType === "CURRENCY"
            ? "" // 🚫 Forex não mostra símbolo
            : (moedasMap[quote.currency] || quote.currency)
        }
      })
    )

    ultimaAtualizacao = new Date()
      .toISOString()
      .replace("T", " ")
      .split(".")[0]

    console.log(`✅ Dados atualizados às ${ultimaAtualizacao}`)

  } catch (err) {
    console.error("Erro ao atualizar dados:", err.message)
  }
}

// 🔥 ROTA
app.get('/ativos_change', (req, res) => {
  try {
    if (!cacheDados || cacheDados.length === 0) {
      return res.status(503).json({
        erro: "Dados indisponíveis no momento"
      })
    }

    res.status(200).json({
      atualizado_em: ultimaAtualizacao,
      dados: cacheDados
    })

  } catch (err) {
    res.status(500).json({
      erro: "Erro interno do servidor"
    })
  }
})

// 🔥 INICIALIZAÇÃO
await atualizarDados()
setInterval(atualizarDados, 2 * 60 * 1000)

app.listen(3000, "0.0.0.0", () =>
  console.log('Servidor rodando na porta 3000')
)