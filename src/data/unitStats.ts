import type { UnitType } from '../types/game'

export interface UnitStats {
  name: string
  maxHp: number
  attack: number
  movement: number
}

export const UNIT_STATS: Record<UnitType, UnitStats> = {
  KING: { name: '왕', maxHp: 12, attack: 2, movement: 1 },
  KNIGHT: { name: '기사', maxHp: 6, attack: 2, movement: 2 },
  ARCHER: { name: '궁수', maxHp: 4, attack: 2, movement: 1 },
  SPIRIT: { name: '정령', maxHp: 3, attack: 1, movement: 1 },
}
