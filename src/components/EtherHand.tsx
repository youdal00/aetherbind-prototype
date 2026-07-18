import { ETHER_NAMES } from '../data/etherConfig'
import type { EtherCard } from '../types/ether'
import { GameIcon } from './GameIcon'

const EFFECTS={FIRE:'공격력 +1',WATER:'HP 1 회복',WIND:'이동력 +1',LIGHTNING:'후방 피해 1'} as const

export function EtherHand({ cards, selectedId, disabled, onSelect }: { cards: EtherCard[]; selectedId: string|null; disabled: boolean; onSelect: (id:string)=>void }) {
  return <section className="ether-hand"><div className="ether-hand-title"><strong>에테르 손패</strong><span>{cards.length}장</span></div><div className="ether-cards">{cards.map((card)=><button key={card.id} disabled={disabled} className={`ether-card ether-${card.type.toLowerCase()}${selectedId===card.id?' selected':''}`} onClick={()=>onSelect(card.id)}><GameIcon name={card.type}/><strong>{ETHER_NAMES[card.type]}</strong><small>{EFFECTS[card.type]}</small></button>)}</div></section>
}
