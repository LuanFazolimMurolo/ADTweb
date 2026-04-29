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
  const [ativos_infinite, setAtivos_infinite] = useState([])
  const [atualizar_infinite, setAtualizar_infinite] = useState([])

  async function getAtivos_infinite() {
    const tarefasFromApi = await api.get('/ativos_change')
    setAtivos_infinite(tarefasFromApi.data.dados)
    setAtualizar_infinite(tarefasFromApi.data.atualizado_em)
  }

  useEffect(() => {
    getAtivos_infinite()

    const interval = setInterval(() => {
      getAtivos_infinite()
    }, 1* 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const sortedCoins = [...ativos_infinite].sort((a, b) => {
    return parseChange(b.change) - parseChange(a.change)
  })

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