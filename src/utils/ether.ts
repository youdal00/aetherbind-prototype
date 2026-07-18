import { DEFAULT_ETHER_ATTACH_LIMIT, ETHER_TYPES, MAX_HAND_SIZE } from '../data/etherConfig'
import { UNIT_STATS } from '../data/unitStats'
import type { EtherCard, PlayerEtherState } from '../types/ether'
import type { Player, Unit } from '../types/game'
import { isSpiritAwakened } from './awakening'

export function shuffleDeck(cards: EtherCard[], random: () => number = Math.random): EtherCard[] {
  const shuffled = [...cards]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createEtherDeck(player: Player): EtherCard[] {
  const prefix = player.toLowerCase()
  return shuffleDeck(ETHER_TYPES.flatMap((type) =>
    Array.from({ length: 5 }, (_, index) => ({ id: `${prefix}-${type.toLowerCase()}-${index + 1}`, owner: player, type })),
  ))
}

export function drawEther(state: PlayerEtherState): { state: PlayerEtherState; drawn?: EtherCard; discarded?: EtherCard } {
  let deck = [...state.deck]
  let discardPile = [...state.discardPile]
  if (deck.length === 0 && discardPile.length > 0) {
    deck = shuffleDeck(discardPile)
    discardPile = []
  }
  const drawn = deck.shift()
  if (!drawn) return { state: { ...state, deck, discardPile } }
  if (state.hand.length >= MAX_HAND_SIZE) {
    return { state: { deck, hand: state.hand, discardPile: [...discardPile, drawn] }, drawn, discarded: drawn }
  }
  return { state: { deck, hand: [...state.hand, drawn], discardPile }, drawn }
}

export function createPlayerEtherState(player: Player, startingHandSize: number): PlayerEtherState {
  let state: PlayerEtherState = { deck: createEtherDeck(player), hand: [], discardPile: [] }
  for (let count = 0; count < startingHandSize; count += 1) state = drawEther(state).state
  return state
}

export function getEtherAttachLimit(overdriveActive = false): number { return overdriveActive ? Infinity : DEFAULT_ETHER_ATTACH_LIMIT }
export function getBaseAttack(unit:Unit):number{return isSpiritAwakened(unit)?2:unit.attack}
export function getBaseMovement(unit:Unit):number{return isSpiritAwakened(unit)?2:UNIT_STATS[unit.type].movement}
export function getFinalAttack(unit: Unit): number { return getBaseAttack(unit) + unit.attachedEthers.filter((card) => card.type === 'FIRE').length }
export function getFinalMovement(unit: Unit): number { return Math.max(0,getBaseMovement(unit) + unit.attachedEthers.filter((card) => card.type === 'WIND').length-(unit.residualEther?1:0)) }
export function hasLightning(unit: Unit): boolean { return unit.attachedEthers.some((card) => card.type === 'LIGHTNING') }
