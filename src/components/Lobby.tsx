import type { GameMode } from '../types/game'

export function Lobby({ onPlay, onRules }: { onPlay: (mode: GameMode) => void; onRules: () => void }) {
  return <main className="screen lobby">
    <div className="sigil" aria-hidden="true"><i /><i /><i /></div>
    <div className="lobby-board-ghost" aria-hidden="true">{Array.from({length:25},(_,index)=><i key={index} className={index===12?'ghost-core':''}/>)}</div><p className="eyebrow">A TACTICAL FANTASY</p><h1>AETHERBIND</h1><p className="korean-title">에테르바인드</p><p className="lobby-tagline">에테르를 지배하고, 왕을 무너뜨려라.</p>
    <div className="menu"><button className="primary" onClick={() => onPlay('PLAYER_VS_AI')}>컴퓨터와 플레이</button><button onClick={() => onPlay('LOCAL_PLAYER_VS_PLAYER')}>사람과 플레이</button><button className="quiet" onClick={onRules}>규칙 설명</button></div>
    <p className="stage-note">PROTOTYPE · PHASE I</p>
  </main>
}
