import type { EtherCard } from './ether'
import type { AwakeningState } from './awakening'

export type Screen = 'LOBBY' | 'RULES' | 'GAME'
export type GameMode = 'PLAYER_VS_AI' | 'LOCAL_PLAYER_VS_PLAYER'
export type Player = '1P' | '2P'
export type UnitType = 'KING' | 'ARCHER' | 'KNIGHT' | 'SPIRIT'

export interface Unit {
  id: string
  owner: Player
  type: UnitType
  x: number
  y: number
  hp: number
  maxHp: number
  attack: number
  attachedEthers: EtherCard[]
  awakening: AwakeningState
  residualEther: boolean
}

export type InitialUnit = Pick<Unit, 'id' | 'owner' | 'type' | 'x' | 'y'>

export interface Coordinate {
  x: number
  y: number
}
