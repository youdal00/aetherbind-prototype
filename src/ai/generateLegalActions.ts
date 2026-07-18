import type { Unit } from '../types/game'
import { getAttackableTargets } from '../utils/combat'
import { getValidMoves } from '../utils/getValidMoves'
import type { AIAction, AIGameSnapshot } from './aiTypes'

const movedUnit=(unit:Unit,x:number,y:number):Unit=>({...unit,x,y})

export function generateLegalActions(snapshot:AIGameSnapshot):AIAction[]{
  const actions:AIAction[]=[]
  for(const unit of snapshot.units.filter((item)=>item.owner===snapshot.player)){
    if(unit.type!=='ARCHER')for(const target of getAttackableTargets(unit,snapshot.units))actions.push({unitId:unit.id,attackTargetId:target.id,score:0,reasons:['Attack']})
    for(const moveTo of getValidMoves(unit,snapshot.units,5)){
      actions.push({unitId:unit.id,moveTo,score:0,reasons:['Move']})
      const simulated=movedUnit(unit,moveTo.x,moveTo.y)
      const movedUnits=snapshot.units.map((item)=>item.id===unit.id?simulated:item)
      for(const target of getAttackableTargets(simulated,movedUnits))actions.push({unitId:unit.id,moveTo,attackTargetId:target.id,score:0,reasons:['Move + attack']})
    }
  }
  return actions
}
