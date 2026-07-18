import { useState } from 'react'
import { Game } from './components/Game'
import { Lobby } from './components/Lobby'
import { Rules } from './components/Rules'
import type { GameMode, Screen } from './types/game'

export default function App() {
  const [screen, setScreen] = useState<Screen>('LOBBY')
  const [mode, setMode] = useState<GameMode>('LOCAL_PLAYER_VS_PLAYER')
  const play = (nextMode: GameMode) => { setMode(nextMode); setScreen('GAME') }
  if (screen === 'RULES') return <Rules onBack={() => setScreen('LOBBY')} />
  if (screen === 'GAME') return <Game mode={mode} onBack={() => setScreen('LOBBY')} />
  return <Lobby onPlay={play} onRules={() => setScreen('RULES')} />
}
