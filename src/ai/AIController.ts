import type { EtherCard } from '../types/ether'
import type { Unit } from '../types/game'
import { getAttackableTargets } from '../utils/combat'
import { generateLegalActions } from './generateLegalActions'
import { evaluateAction } from './evaluateAction'
import { AI_DEBUG,AI_DEBUG_DETERMINISTIC } from './aiWeights'
import type { AIAction,AIGameSnapshot } from './aiTypes'

export function chooseBestAction(snapshot:AIGameSnapshot):AIAction|null{
  const evaluated=generateLegalActions(snapshot).map((action)=>evaluateAction(action,snapshot)).sort((a,b)=>b.score-a.score)
  if(AI_DEBUG){console.log(`AI candidate actions: ${evaluated.length}`);console.table(evaluated.slice(0,5).map((a)=>({unit:a.unitId,move:a.moveTo?`${a.moveTo.x},${a.moveTo.y}`:'-',attack:a.attackTargetId??'-',score:a.score,reason:a.reasons.join(', ')})))}
  if(!evaluated.length)return null
  const best=evaluated.filter((action)=>action.score===evaluated[0].score)
  const chosen=AI_DEBUG_DETERMINISTIC?best[0]:best[Math.floor(Math.random()*best.length)]
  if(AI_DEBUG)console.log('Chosen AI action:',chosen)
  return chosen
}

export function chooseEtherAttachment(hand:EtherCard[],units:Unit[]):{card:EtherCard;unit:Unit}|null{
  const candidates=units.filter((unit)=>unit.owner==='2P'&&unit.attachedEthers.length<3)
  for(const card of hand){
    if(card.type==='WATER'){const unit=[...candidates].sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp))[0];if(unit&&unit.hp<unit.maxHp)return{card,unit}}
    if(card.type==='FIRE'||card.type==='LIGHTNING'){const unit=candidates.find((item)=>getAttackableTargets(item,units).length>0);if(unit)return{card,unit}}
    if(card.type==='WIND'){const unit=candidates.find((item)=>item.x!==2||item.y!==2);if(unit)return{card,unit}}
  }
  return null
}

export const delay=(ms:number,signal:AbortSignal)=>new Promise<void>((resolve,reject)=>{const id=setTimeout(resolve,ms);signal.addEventListener('abort',()=>{clearTimeout(id);reject(new DOMException('Aborted','AbortError'))},{once:true})})
