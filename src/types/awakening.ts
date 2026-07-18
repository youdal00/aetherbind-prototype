export type AwakeningType = 'EARLY' | 'MID' | 'LATE'

export interface AwakeningState {
  active: boolean
  type: AwakeningType | null
  turnsRemaining: number
  locked: boolean
}
