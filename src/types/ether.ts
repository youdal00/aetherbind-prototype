import type { Player } from './game'

export type EtherType = 'FIRE' | 'WATER' | 'WIND' | 'LIGHTNING'

export interface EtherCard {
  id: string
  owner: Player
  type: EtherType
}

export interface PlayerEtherState {
  deck: EtherCard[]
  hand: EtherCard[]
  discardPile: EtherCard[]
}
