import { useState, useEffect } from "react"
import Ticker from "./components/InfiniteScroller"
import api from '../../services/api'
import "./style.css"


function parseChange(change) {
  return parseFloat(change.replace('%', ''))
}

function TickerSection({ coins }) {
  return (
    <div className="ticker-section">
      <Ticker coins={coins} />
    </div>
  )
}

function HeroSection() {
  return (
    <div className="hero">
      <h1>ADT</h1>
      <p>Dados em tempo real, decisões inteligentes</p>
    </div>
  )
}

function App() {
  const [erro, setErro] = useState(null)

  const [ativos_infinite, setAtivos_infinite] = useState([])
  const [atualizar_infinite, setAtualizar_infinite] = useState(null)
  async function getAtivos_infinite(isFirstLoad = false) {
  try {


    const res = await api.get('/ativos_change')

    setAtivos_infinite(res.data.dados)
    setAtualizar_infinite(res.data.atualizado_em)
    setErro(null)

  } catch (error) {
    setErro("Erro ao carregar dados")

  }
}
  useEffect(() => {
  getAtivos_infinite() // 🔥 primeira vez

  const interval = setInterval(() => {
    getAtivos_infinite() // 🔥 updates
  }, 10 * 1000)

  return () => clearInterval(interval)
}, [])

  
  console.log("--:", erro ? `❌❌❌${erro}`: "✅✅✅",ativos_infinite)

  
  let sortedCoins = []

  if (erro) {
    // erro real
    sortedCoins = Array(20).fill({
      ticker: "ERRO",
      price: "--",
      change: "0%",
      moeda: "",
      error: true
    })

  } else {
    // dados reais
    sortedCoins = [...ativos_infinite].sort((a, b) => {
      return parseChange(b.change) - parseChange(a.change)
    })
  }

  console.log("---- SORTED:", sortedCoins)


  return (
    <div className="container">
      <section className="page hero-page">
          <HeroSection />
      </section>

      <section className="page">
        
        <TickerSection coins={sortedCoins} />
      </section>
    </div>
  )
}
  

export default App