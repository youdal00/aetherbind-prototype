import type { Coordinate, Player, Unit } from '../types/game'

export interface AIGameSnapshot { units:Unit[]; player:Player; coreHoldCount:Record<Player,number>; coreController:Player|null }
export interface AIAction { unitId:string; moveTo?:Coordinate; attackTargetId?:string; score:number; reasons:string[] }
