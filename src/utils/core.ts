import type { CoreState } from '../types/core'
import type { Player, Unit } from '../types/game'

const opponent=(player:Player):Player=>player==='1P'?'2P':'1P'

export function createCoreState():CoreState{return{controller:null,holdCount:{'1P':0,'2P':0},overdriveReady:{'1P':false,'2P':false},overdriveActive:{'1P':false,'2P':false}}}
export function getCoreController(units:Unit[]):Player|null{return units.find((unit)=>unit.x===2&&unit.y===2)?.owner??null}

export function syncCoreController(state:CoreState,controller:Player|null):CoreState{
  const holdCount={...state.holdCount}
  if(controller===null){
    ;(['1P','2P'] as const).forEach((player)=>{if(holdCount[player]>0)console.log(`${player} lost core control\n${player} core hold reset to 0`);holdCount[player]=0})
  }else{
    const displaced=opponent(controller)
    if(holdCount[displaced]>0)console.log(`${displaced} lost core control\n${displaced} core hold reset to 0`)
    holdCount[displaced]=0
  }
  return{...state,controller,holdCount}
}

export function resolveCoreAtTurnEnd(currentPlayer:Player,units:Unit[],state:CoreState):CoreState{
  const controller=getCoreController(units)
  const synced=syncCoreController(state,controller)
  const holdCount={...synced.holdCount}
  const overdriveReady={...synced.overdriveReady}
  if(controller===currentPlayer){
    holdCount[currentPlayer]+=1
    console.log(`${currentPlayer} core hold: ${holdCount[currentPlayer]}/2`)
    if(holdCount[currentPlayer]>=2){overdriveReady[currentPlayer]=true;console.log(`${currentPlayer} core overdrive ready`)}
  }else holdCount[currentPlayer]=0
  return{...synced,holdCount,overdriveReady}
}

export function startCoreOverdrive(player:Player,state:CoreState):{state:CoreState;activated:boolean}{
  if(!state.overdriveReady[player])return{state,activated:false}
  console.log(`${player} CORE OVERDRIVE activated`)
  return{activated:true,state:{...state,holdCount:{...state.holdCount,[player]:0},overdriveReady:{...state.overdriveReady,[player]:false},overdriveActive:{...state.overdriveActive,[player]:true}}}
}

export function endCoreOverdrive(player:Player,state:CoreState):CoreState{
  if(!state.overdriveActive[player])return state
  console.log(`${player} CORE OVERDRIVE ended`)
  return{...state,overdriveActive:{...state.overdriveActive,[player]:false}}
}
