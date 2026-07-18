import type { CoreState } from '../types/core'

export function CorePanel({state}:{state:CoreState}){
  return <aside className={`core-panel${state.overdriveActive['1P']||state.overdriveActive['2P']?' overdrive':''}`}><strong>CORE</strong><span>점령: {state.controller??'없음'}</span><span>1P 유지: {Math.min(2,state.holdCount['1P'])}/2 {state.overdriveReady['1P']&&'· 준비'}</span><span>2P 유지: {Math.min(2,state.holdCount['2P'])}/2 {state.overdriveReady['2P']&&'· 준비'}</span>{(['1P','2P'] as const).map((player)=>state.overdriveActive[player]&&<b key={player}>{player} CORE OVERDRIVE</b>)}</aside>
}
