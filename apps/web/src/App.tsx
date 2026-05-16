import { useEffect, useState } from "react"
import { createEmptyBoard } from "@tik-tak/game-engine"
import { Landing } from "./pages/Landing"
import { WithComputer } from "./pages/WithComputer"
import { WithFriends } from "./pages/WithFriends"
import { WithOnlineFriend } from "./pages/WithOnlineFriend"
import type { Board } from "@tik-tak/types"
import type { AppRoute } from "./types"

function getCurrentRoute(): AppRoute {
  const path = window.location.pathname

  if (path === "/computer" || path === "/local-friend" || path === "/online-friend") {
    return path
  }

  return "/"
}

function App() {
  const [board, setBoard] = useState<Board>(createEmptyBoard)
  const [route, setRoute] = useState<AppRoute>(getCurrentRoute)

  useEffect(() => {
    function handlePopState() {
      setRoute(getCurrentRoute())
    }

    window.addEventListener("popstate", handlePopState)

    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  function navigate(path: AppRoute) {
    window.history.pushState(null, "", path)
    setRoute(path)
    setBoard(createEmptyBoard())
  }

  function renderPage() {
    if (route === "/computer") {
      return <WithComputer board={board} setBoard={setBoard} onBack={() => navigate("/")} />
    }

    if (route === "/local-friend") {
      return <WithFriends board={board} setBoard={setBoard} onBack={() => navigate("/")} />
    }

    if (route === "/online-friend") {
      return <WithOnlineFriend board={board} setBoard={setBoard} onBack={() => navigate("/")} />
    }

    return <Landing onNavigate={navigate} />
  }

  return (
    <main className="h-screen overflow-hidden bg-slate-100 px-4 py-4 text-slate-950 sm:px-6">
      {renderPage()}
    </main>
  )
}

export default App
