import type { EtherType } from '../types/ether'

export const ETHER_TYPES: readonly EtherType[] = ['FIRE', 'WATER', 'WIND', 'LIGHTNING']
export const ETHER_NAMES: Record<EtherType, string> = { FIRE: '불', WATER: '물', WIND: '바람', LIGHTNING: '번개' }
export const ETHER_SYMBOLS: Record<EtherType, string> = { FIRE: '🔥', WATER: '💧', WIND: '🌪', LIGHTNING: '⚡' }
export const MAX_HAND_SIZE = 7
export const MAX_ATTACHED_ETHERS = 3
export const DEFAULT_ETHER_ATTACH_LIMIT = 1
