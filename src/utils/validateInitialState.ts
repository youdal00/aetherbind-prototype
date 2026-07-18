import { INITIAL_UNITS } from '../data/initialUnits'
import type { Unit } from '../types/game'

export function validateInitialState(units: Unit[]): boolean {
  const errors: string[] = []
  if (units.length !== 10) errors.push(`Expected 10 units, received ${units.length}`)
  if (units.filter((unit) => unit.owner === '1P').length !== 5) errors.push('1P must have 5 units')
  if (units.filter((unit) => unit.owner === '2P').length !== 5) errors.push('2P must have 5 units')
  const expectedComposition = { KING: 1, KNIGHT: 2, ARCHER: 1, SPIRIT: 1 } as const
  ;(['1P', '2P'] as const).forEach((owner) => {
    Object.entries(expectedComposition).forEach(([type, expectedCount]) => {
      const actualCount = units.filter((unit) => unit.owner === owner && unit.type === type).length
      if (actualCount !== expectedCount) errors.push(`${owner} must have ${expectedCount} ${type}, received ${actualCount}`)
    })
  })
  if (new Set(units.map((unit) => unit.id)).size !== units.length) errors.push('Duplicate unit id')
  if (new Set(units.map((unit) => `${unit.x},${unit.y}`)).size !== units.length) errors.push('Duplicate unit coordinate')
  if (units.some((unit) => unit.x === 2 && unit.y === 2)) errors.push('A unit occupies the core at (2,2)')
  if (units.some((unit) => unit.owner === '1P' && unit.y !== 4)) errors.push('All 1P units must be on y=4')
  if (units.some((unit) => unit.owner === '2P' && unit.y !== 0)) errors.push('All 2P units must be on y=0')
  const expected = new Map(INITIAL_UNITS.map((unit) => [unit.id, `${unit.owner}:${unit.type}:${unit.x},${unit.y}`]))
  units.forEach((unit) => {
    if (expected.get(unit.id) !== `${unit.owner}:${unit.type}:${unit.x},${unit.y}`) errors.push(`Incorrect initial state: ${unit.id}`)
  })
  if (errors.length) {
    errors.forEach((error) => console.error(`Initial board validation failed: ${error}`))
    return false
  }
  console.log('Initial board validation passed')
  return true
}
