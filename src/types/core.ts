import type { Player } from './game'

export interface CoreState {
  controller: Player | null
  holdCount: Record<Player, number>
  overdriveReady: Record<Player, boolean>
  overdriveActive: Record<Player, boolean>
}
