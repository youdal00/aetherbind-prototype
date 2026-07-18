import type { Coordinate, Unit } from '../types/game'
import { isAwakenedAs } from './awakening'
import { getFinalMovement } from './ether'

const DIRECTIONS:readonly Coordinate[]=[{x:-1,y:-1},{x:0,y:-1},{x:1,y:-1},{x:-1,y:0},{x:1,y:0},{x:-1,y:1},{x:0,y:1},{x:1,y:1}]
const keyOf=({x,y}:Coordinate)=>`${x},${y}`

export function getValidMoves(unit:Unit,units:Unit[],boardSize=5):Coordinate[]{
  const range=getFinalMovement(unit)
  if(range===0)return[]
  const occupied=new Set(units.map(keyOf)),results=new Map<string,Coordinate>()
  let frontier=[{x:unit.x,y:unit.y,leapUsed:false}]
  for(let step=1;step<=range;step+=1){
    const next=new Map<string,{x:number;y:number;leapUsed:boolean}>()
    for(const position of frontier)for(const direction of DIRECTIONS){
      const adjacent={x:position.x+direction.x,y:position.y+direction.y}
      const adjacentKey=keyOf(adjacent)
      const inBounds=adjacent.x>=0&&adjacent.x<boardSize&&adjacent.y>=0&&adjacent.y<boardSize
      if(!inBounds)continue
      if(!occupied.has(adjacentKey)){
        results.set(adjacentKey,adjacent);next.set(`${adjacentKey}:${position.leapUsed}`,{...adjacent,leapUsed:position.leapUsed});continue
      }
      if(!isAwakenedAs(unit,'MID')||position.leapUsed)continue
      const landing={x:adjacent.x+direction.x,y:adjacent.y+direction.y},landingKey=keyOf(landing)
      const validLanding=landing.x>=0&&landing.x<boardSize&&landing.y>=0&&landing.y<boardSize&&!occupied.has(landingKey)
      if(validLanding){results.set(landingKey,landing);next.set(`${landingKey}:true`,{...landing,leapUsed:true})}
    }
    frontier=[...next.values()]
  }
  results.delete(keyOf(unit));return[...results.values()].sort((a,b)=>a.y-b.y||a.x-b.x)
}

export function isMidLeapDestination(unit:Unit,units:Unit[],destination:Coordinate):boolean{
  if(!isAwakenedAs(unit,'MID'))return false
  return DIRECTIONS.some((direction)=>{
    const middle={x:unit.x+direction.x,y:unit.y+direction.y}
    return units.some((item)=>item.x===middle.x&&item.y===middle.y)&&destination.x===middle.x+direction.x&&destination.y===middle.y+direction.y
  })
}
