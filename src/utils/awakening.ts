import type { AwakeningType } from '../types/awakening'
import type { Player, Unit } from '../types/game'

export function getAwakeningType(playerTurnCount:number):AwakeningType{return playerTurnCount<=3?'EARLY':playerTurnCount<=6?'MID':'LATE'}
export function isAwakenedAs(unit:Unit,type:AwakeningType):boolean{return unit.type==='SPIRIT'&&unit.awakening.active&&unit.awakening.type===type}
export function isSpiritAwakened(unit:Unit):boolean{return unit.type==='SPIRIT'&&unit.awakening.active}

export function awakenSpiritAfterAttachment(unit:Unit,playerTurnCount:number):Unit{
  if(unit.type!=='SPIRIT'||unit.awakening.active||unit.attachedEthers.length<2||(unit.awakening.locked&&unit.attachedEthers.length<3))return unit
  const type=getAwakeningType(playerTurnCount)
  console.log(`${unit.id} awakened: ${type}`)
  return{...unit,hp:Math.min(4,unit.hp+1),maxHp:4,awakening:{active:true,type,turnsRemaining:3,locked:false}}
}

export function resolveAwakeningsAtTurnEnd(units:Unit[],owner:Player):Unit[]{
  return units.map((unit)=>{
    let next=unit
    if(unit.owner===owner&&unit.residualEther){next={...next,residualEther:false};console.log(`Residual Ether expired from ${unit.id}`)}
    if(unit.owner!==owner||!unit.awakening.active)return next
    const remaining=unit.awakening.turnsRemaining-1
    console.log(`${unit.id} awakening turns remaining: ${Math.max(0,remaining)}`)
    if(remaining>0)return{...next,awakening:{...unit.awakening,turnsRemaining:remaining}}
    console.log(`${unit.id} awakening ended`)
    return{...next,hp:Math.min(3,next.hp),maxHp:3,awakening:{active:false,type:null,turnsRemaining:0,locked:true}}
  })
}

export function applyResidualEtherArea(
  units:Unit[],
  center:{x:number;y:number},
  attackerOwner:Player,
):{units:Unit[];affectedIds:string[]}{
  const affectedIds=units
    .filter((unit)=>unit.owner!==attackerOwner&&Math.abs(unit.x-center.x)<=1&&Math.abs(unit.y-center.y)<=1)
    .map((unit)=>unit.id)
  const affected=new Set(affectedIds)
  return{units:units.map((unit)=>affected.has(unit.id)?{...unit,residualEther:true}:unit),affectedIds}
}
