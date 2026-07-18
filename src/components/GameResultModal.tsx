import type { GameMode } from '../types/game'
import type { GameResult } from '../types/gameResult'

export function GameResultModal({result,mode,onRestart,onLobby,disabled}:{result:GameResult;mode:GameMode;onRestart:()=>void;onLobby:()=>void;disabled:boolean}){
  const humanWon=result.winner==='1P'
  const title=mode==='PLAYER_VS_AI'?(humanWon?'승리':'패배'):`${result.winner} 승리`
  const detail=result.reason==='SURRENDER'?(mode==='PLAYER_VS_AI'?'항복하여 게임이 종료되었습니다.':`${result.loser}의 항복`):(mode==='PLAYER_VS_AI'?(humanWon?'상대 왕을 처치했습니다.':'당신의 왕이 처치되었습니다.'):'왕 처치')
  return <div className="result-backdrop" role="dialog" aria-modal="true"><div className="result-panel"><p className="eyebrow">BATTLE COMPLETE</p><h2>{title}</h2><p>{detail}</p><div className="result-actions"><button className="primary" disabled={disabled} onClick={onRestart}>다시 하기</button><button className="quiet" disabled={disabled} onClick={onLobby}>로비로</button></div></div></div>
}
