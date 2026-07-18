import type { Player } from './game'

export type GameEndReason = 'KING_DEFEATED' | 'SURRENDER'
export interface GameResult { isGameOver:boolean; winner:Player|null; loser:Player|null; reason:GameEndReason|null }
export const EMPTY_GAME_RESULT:GameResult={isGameOver:false,winner:null,loser:null,reason:null}
