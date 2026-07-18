import type { EtherType } from '../types/ether'
import type { UnitType } from '../types/game'

type IconName=UnitType|EtherType|'CORE'|'SLOW'
export function GameIcon({name,className=''}:{name:IconName;className?:string}){
  const common={fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round' as const,strokeLinejoin:'round' as const}
  return <svg className={`game-icon ${className}`} viewBox="0 0 32 32" aria-hidden="true">
    {name==='KING'&&<g {...common}><path d="M6 10l5 5 5-9 5 9 5-5-2 15H8z"/><path d="M9 21h14M10 26h12"/></g>}
    {name==='KNIGHT'&&<g {...common}><path d="M9 25h16c-1-4-3-6-7-7l4-4-2-7-8 3-4 8z"/><path d="M12 10l5 4M16 10l2-3M7 26h19"/><circle cx="17.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/></g>}
    {name==='ARCHER'&&<g {...common}><path d="M9 5c9 5 9 17 0 22M9 5c-5 6-5 16 0 22M8 16h18M22 12l4 4-4 4"/></g>}
    {name==='SPIRIT'&&<g {...common}><path d="M16 4c2 5 8 7 8 14a8 8 0 01-16 0c0-5 4-8 8-14z"/><path d="M16 12c1 3 4 4 4 7a4 4 0 01-8 0c0-3 2-5 4-7z"/></g>}
    {name==='FIRE'&&<path {...common} d="M17 3c1 6 7 8 7 16a8 8 0 01-16 0c0-5 3-8 7-12 0 4 2 5 2 5s2-4 0-9z"/>}
    {name==='WATER'&&<path {...common} d="M16 3S7 13 7 20a9 9 0 0018 0C25 13 16 3 16 3z"/>}
    {name==='WIND'&&<g {...common}><path d="M4 12h16c5 0 5-6 1-6-2 0-3 1-3 2M4 17h22c4 0 4 6 0 6-2 0-3-1-3-2M4 22h12"/></g>}
    {name==='LIGHTNING'&&<path {...common} d="M18 2L7 18h8l-2 12 12-17h-8z"/>}
    {name==='CORE'&&<g {...common}><circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="5"/><path d="M16 2v9M16 21v9M2 16h9M21 16h9M6 6l6 6M20 20l6 6M26 6l-6 6M12 20l-6 6"/></g>}
    {name==='SLOW'&&<g {...common}><path d="M7 8h18M7 24h18M10 8c0 5 6 5 6 8s-6 3-6 8M22 8c0 5-6 5-6 8s6 3 6 8"/></g>}
  </svg>
}
