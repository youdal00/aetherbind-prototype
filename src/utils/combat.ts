import type { Unit } from '../types/game'
import { getFinalAttack } from './ether'

const DIRECTIONS = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]] as const

export function getAttackableTargets(attacker: Unit, units: Unit[]): Unit[] {
  if (attacker.type !== 'ARCHER') return units.filter((target) => target.owner !== attacker.owner && Math.max(Math.abs(target.x-attacker.x),Math.abs(target.y-attacker.y))===1)
  const targets: Unit[] = []
  for (const [dx,dy] of DIRECTIONS) for (let distance=1;distance<=2;distance+=1) {
    const occupant=units.find((unit)=>unit.x===attacker.x+dx*distance&&unit.y===attacker.y+dy*distance)
    if (!occupant) continue
    if (occupant.owner!==attacker.owner) targets.push(occupant)
    break
  }
  return targets
}

export function calculateDamage(attacker: Unit, target: Unit): number {
  const attack=getFinalAttack(attacker)
  const distance=Math.max(Math.abs(target.x-attacker.x),Math.abs(target.y-attacker.y))
  return attacker.type==='ARCHER'&&distance===1?Math.max(1,Math.floor(attack/2)):attack
}

export interface AttackResult { units: Unit[]; defeated: Unit[]; chainTarget: Unit|null; mainTargetDefeated: boolean }

export function resolveAttack(units: Unit[], attackerId: string, targetId: string, damage: number, lightning: boolean): AttackResult {
  const attacker=units.find((unit)=>unit.id===attackerId)!
  const target=units.find((unit)=>unit.id===targetId)!
  const dx=Math.sign(target.x-attacker.x), dy=Math.sign(target.y-attacker.y)
  const chainTarget=lightning?units.find((unit)=>unit.x===target.x+dx&&unit.y===target.y+dy)??null:null
  const damaged=units.map((unit)=>unit.id===targetId?{...unit,hp:unit.hp-damage}:chainTarget&&unit.id===chainTarget.id?{...unit,hp:unit.hp-1}:unit)
  const mainTargetDefeated=target.hp-damage<=0
  const defeated=damaged.filter((unit)=>unit.hp<=0)
  let survivors=damaged.filter((unit)=>unit.hp>0)
  if (attacker.type==='KNIGHT'&&mainTargetDefeated) survivors=survivors.map((unit)=>unit.id===attackerId?{...unit,x:target.x,y:target.y}:unit)
  return { units: survivors, defeated, chainTarget, mainTargetDefeated }
}
