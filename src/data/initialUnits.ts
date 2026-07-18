import type { InitialUnit, Unit } from '../types/game'
import { UNIT_STATS } from './unitStats'

export const INITIAL_UNITS: readonly InitialUnit[] = Object.freeze([
  { id: 'p1-spirit', owner: '1P', type: 'SPIRIT', x: 0, y: 4 },
  { id: 'p1-knight-1', owner: '1P', type: 'KNIGHT', x: 1, y: 4 },
  { id: 'p1-king', owner: '1P', type: 'KING', x: 2, y: 4 },
  { id: 'p1-knight-2', owner: '1P', type: 'KNIGHT', x: 3, y: 4 },
  { id: 'p1-archer', owner: '1P', type: 'ARCHER', x: 4, y: 4 },
  { id: 'p2-archer', owner: '2P', type: 'ARCHER', x: 0, y: 0 },
  { id: 'p2-knight-1', owner: '2P', type: 'KNIGHT', x: 1, y: 0 },
  { id: 'p2-king', owner: '2P', type: 'KING', x: 2, y: 0 },
  { id: 'p2-knight-2', owner: '2P', type: 'KNIGHT', x: 3, y: 0 },
  { id: 'p2-spirit', owner: '2P', type: 'SPIRIT', x: 4, y: 0 },
])

export function createInitialUnits(): Unit[] {
  return INITIAL_UNITS.map((unit) => {
    const stats = UNIT_STATS[unit.type]
    return { ...unit, hp: stats.maxHp, maxHp: stats.maxHp, attack: stats.attack, attachedEthers: [], awakening: { active: false, type: null, turnsRemaining: 0, locked: false }, residualEther: false }
  })
}
