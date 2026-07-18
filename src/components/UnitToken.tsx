import type { Unit } from '../types/game'
import { GameIcon } from './GameIcon'

const SYMBOLS = { KING: 'K', KNIGHT: 'N', ARCHER: 'A', SPIRIT: 'S' } as const
const NAMES = { KING: '왕', KNIGHT: '기사', ARCHER: '궁수', SPIRIT: '정령' } as const

export function UnitToken({ unit, selected = false }: { unit: Unit; selected?: boolean }) {
  const awakeningLabel=unit.awakening.type==='EARLY'?'E1':unit.awakening.type==='MID'?'E2':unit.awakening.type==='LATE'?'E3':null
  const hpPercent=Math.max(0,(unit.hp/unit.maxHp)*100),danger=hpPercent<=25?' critical':hpPercent<=50?' wounded':''
  return <div className={`unit unit-${unit.owner.toLowerCase()} unit-${unit.type.toLowerCase()}${selected ? ' selected' : ''}${unit.awakening.active?' awakened':''}${unit.residualEther?' residual':''}${danger}`} aria-label={`${unit.owner} ${NAMES[unit.type]}, HP ${unit.hp}/${unit.maxHp}`}><span className="unit-owner">{unit.owner}</span><GameIcon name={unit.type} className="unit-symbol"/><span className="unit-letter">{SYMBOLS[unit.type]}</span><span className="unit-hp">{unit.hp}/{unit.maxHp}</span><span className="hp-track"><i style={{width:`${hpPercent}%`}}/></span>{awakeningLabel&&<b className="awakening-badge">{awakeningLabel}</b>}{unit.residualEther&&<b className="residual-badge"><GameIcon name="SLOW"/>−1</b>}<span className="attached-ethers">{unit.attachedEthers.map((card)=><i key={card.id} title={card.type}><GameIcon name={card.type}/></i>)}</span></div>
}
