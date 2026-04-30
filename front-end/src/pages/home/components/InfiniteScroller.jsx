import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import "./InfiniteScroller.css"

export default function Ticker({ coins }) {
  const trackRef = useRef(null)
  const tweenRef = useRef(null)
  const prevCoinsRef = useRef([])

  const [renderData, setRenderData] = useState([])



  // 🔥 cria loop fixo
  useEffect(() => {

    if (coins.length > 0 && renderData.length === 0) {
      const duplicated = [...coins, ...coins]

      setRenderData(duplicated)
    }
  }, [coins, renderData.length])

  // 🔥 animação contínua
  useEffect(() => {
    console.log("🎬 useEffect ANIMAÇÃO disparou")

    const el = trackRef.current

    if (!el) {
      return
    }

    if (renderData.length === 0) {
      return
    }

    let rafId

    const start = () => {
      const width = el.scrollWidth / 2

      console.log("📏 WIDTH calculado:", width)

      if (width === 0) {
        console.log("⏳ WIDTH 0 → esperando próximo frame")
        rafId = requestAnimationFrame(start)
        return
      }

      if (tweenRef.current) {
        return
      }


      tweenRef.current = gsap.fromTo(
        el,
        { x: 0 },
        {
          x: -width,
          duration: width / 50,
          ease: "none",
          repeat: -1
        }
      )
    }

    start()

    const handleEnter = () => {
      tweenRef.current?.pause()
      el.style.cursor = "pointer"
    }

    const handleLeave = () => {
      tweenRef.current?.resume()
    }

    el.addEventListener("mouseenter", handleEnter)
    el.addEventListener("mouseleave", handleLeave)

    return () => {

      cancelAnimationFrame(rafId)

      if (tweenRef.current) {
        tweenRef.current.kill()
        tweenRef.current = null
      }

      el.removeEventListener("mouseenter", handleEnter)
      el.removeEventListener("mouseleave", handleLeave)
    }
  }, [renderData])
  


  // 🔥 atualização de dados
  useEffect(() => {
    console.log("COINS -- ",coins)
    if (!coins.length) {
      console.log("❌ coins vazio")
      return
    }


    prevCoinsRef.current = coins
    console.log("prevCoinsRef -- ",prevCoinsRef)

  }, [coins])

  return (
    <div className="ticker">
      <div className="track" ref={trackRef}>
        {renderData.map((coin, i) => {
            const prev = prevCoinsRef.current[i % coins.length]
            console.log("prev -- ",prev)

            //if (coins.error){}
            const changed =
              prev &&
              (prev.price !== coin.price || prev.change !== coin.change)
            console.log("changed -- ",changed)

            if (changed) {
              
            }
            const formattedChange = coin.change.startsWith("-") ? coin.change : `+${coin.change}`
            console.log("formattedChange -- ",formattedChange)



            return (
              <div
                className={`item ${changed ? "flash" : ""}`}
                key={i}
                onClick={() => {
                console.log("🖱️ CLICK:", coin.ticker)

                if (typeof window !== "undefined" && window.open) {
                  window.open(
                    `https://finance.yahoo.com/quote/${coin.ticker}`,
                    "_blank"
                  )
                } else {
                  console.error("window.open não disponível")
                }
              }}
              >
                <b className="ticker-name">{coin.ticker}</b>
                |
                <p className="moeda">
                  {coin.moeda} {coin.price}
                </p>


                <span
                  className={`change ${
                    coin.change.includes("-") ? "down" : "up"
                  }`}
                >
                  {formattedChange}
                </span>
              </div>
          )
        
      
      }
        
        )}
      </div>
    </div>
  )
}