import type { Coordinate, Unit } from '../types/game'
import { UnitToken } from './UnitToken'
import type { Player } from '../types/game'
import { GameIcon } from './GameIcon'

interface BoardProps {
  units: Unit[]
  selectedUnitId: string | null
  validMoves: Coordinate[]
  attackableTargetIds: string[]
  onCellClick: (x: number, y: number) => void
  coreController: Player | null
  coreOverdrive: boolean
}

export function Board({ units, selectedUnitId, validMoves, attackableTargetIds, onCellClick, coreController, coreOverdrive }: BoardProps) {
  return <div className="board" role="grid" aria-label="5×5 게임 보드">
    {Array.from({ length: 25 }, (_, index) => {
      const x = index % 5
      const y = Math.floor(index / 5)
      const unit = units.find((item) => item.x === x && item.y === y)
      const core = x === 2 && y === 2
      const validMove = validMoves.some((move) => move.x === x && move.y === y)
      const attackable = unit ? attackableTargetIds.includes(unit.id) : false
      return <button className={`cell${core ? ` core${coreController ? ` controlled-${coreController.toLowerCase()}` : ''}${coreOverdrive ? ' core-overdrive' : ''}` : ''}${validMove ? ' valid-move' : ''}${attackable ? ' attackable' : ''}`} key={`${x}-${y}`} role="gridcell" onClick={() => onCellClick(x, y)} aria-label={`칸 ${x}, ${y}${core ? ', 코어' : ''}${validMove ? ', 이동 가능' : ''}${attackable ? ', 공격 가능' : ''}`}>
        <span className="coordinate">{x},{y}</span>{core && <span className="core-mark"><GameIcon name="CORE"/><b>CORE</b></span>}{unit && <UnitToken unit={unit} selected={unit.id === selectedUnitId} />}
      </button>
    })}
  </div>
}
