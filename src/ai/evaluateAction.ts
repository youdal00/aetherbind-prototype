import { isAwakenedAs } from '../utils/awakening'
import { calculateDamage, getAttackableTargets } from '../utils/combat'
import { getValidMoves } from '../utils/getValidMoves'
import type { Unit } from '../types/game'
import { AI_WEIGHTS as W } from './aiWeights'
import type { AIAction, AIGameSnapshot } from './aiTypes'

const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))
const killValue=(target:Unit)=>target.type==='KING'?W.KING_KILL:target.type==='ARCHER'?W.ARCHER_KILL:target.type==='KNIGHT'?W.KNIGHT_KILL:W.SPIRIT_KILL

function kingThreatDamage(king:Unit,units:Unit[]):number{
  let maximum=0
  for(const enemy of units.filter((unit)=>unit.owner!==king.owner)){
    if(enemy.type!=='ARCHER'&&getAttackableTargets(enemy,units).some((target)=>target.id===king.id))maximum=Math.max(maximum,calculateDamage(enemy,king))
    for(const move of getValidMoves(enemy,units,5)){
      const moved={...enemy,...move},movedUnits=units.map((unit)=>unit.id===enemy.id?moved:unit)
      if(getAttackableTargets(moved,movedUnits).some((target)=>target.id===king.id))maximum=Math.max(maximum,calculateDamage(moved,king))
    }
  }
  return maximum
}

export function evaluateAction(action:AIAction,snapshot:AIGameSnapshot):AIAction{
  const original=snapshot.units.find((unit)=>unit.id===action.unitId)!
  const actor=action.moveTo?{...original,...action.moveTo}:original
  const units=snapshot.units.map((unit)=>unit.id===actor.id?actor:unit)
  let score=0;const reasons=[...action.reasons]
  const enemyKing=units.find((unit)=>unit.owner!==snapshot.player&&unit.type==='KING')
  if(action.moveTo?.x===2&&action.moveTo.y===2){score+=W.CORE_CAPTURE;reasons.push('Core capture')}
  if(snapshot.coreController===snapshot.player&&actor.x===2&&actor.y===2){score+=snapshot.coreHoldCount[snapshot.player]===1?W.CORE_SECOND_HOLD:W.CORE_HOLD;reasons.push('Core hold')}
  if(enemyKing&&action.moveTo){score+=(distance(original,enemyKing)-distance(actor,enemyKing))*W.KING_APPROACH}
  if(action.attackTargetId){
    const target=units.find((unit)=>unit.id===action.attackTargetId)!,damage=calculateDamage(actor,target)
    if(damage>=target.hp){score+=killValue(target)+target.attachedEthers.length*W.ETHER_ON_KILL;reasons.push(`${target.type} defeat`)}
    else{score+=damage*(target.type==='KING'?W.KING_DAMAGE:80);reasons.push(`${damage} damage`)}
    if(isAwakenedAs(actor,'LATE')){
      const affected=units.filter((unit)=>unit.owner!==actor.owner&&Math.abs(unit.x-target.x)<=1&&Math.abs(unit.y-target.y)<=1&&!unit.residualEther)
      score+=affected.length>=4?W.LATE_FOUR:affected.length===3?W.LATE_THREE:affected.length===2?W.LATE_TWO:affected.length?W.LATE_ONE:0
      if(affected.some((unit)=>unit.type==='KING'))score+=300
    }
  }
  const aiKing=units.find((unit)=>unit.owner===snapshot.player&&unit.type==='KING')
  if(aiKing){const threat=kingThreatDamage(aiKing,units);if(threat>0){score-=threat>=aiKing.hp?10000:W.KING_RISK;reasons.push(threat>=aiKing.hp?'King lethal risk':'King risk')}}
  if(original.type==='ARCHER'&&enemyKing&&distance(actor,enemyKing)===1)score-=300
  return{...action,score,reasons}
}
