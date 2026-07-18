import { useEffect, useMemo, useRef, useState } from 'react'
import { ETHER_NAMES, MAX_ATTACHED_ETHERS } from '../data/etherConfig'
import { createInitialUnits } from '../data/initialUnits'
import { UNIT_STATS } from '../data/unitStats'
import type { PlayerEtherState } from '../types/ether'
import type { GameMode, Player, Unit } from '../types/game'
import { calculateDamage, getAttackableTargets, resolveAttack } from '../utils/combat'
import { createPlayerEtherState, drawEther, getBaseAttack, getBaseMovement, getEtherAttachLimit, getFinalAttack, getFinalMovement, hasLightning } from '../utils/ether'
import { getValidMoves, isMidLeapDestination } from '../utils/getValidMoves'
import { validateInitialState } from '../utils/validateInitialState'
import { Board } from './Board'
import { CorePanel } from './CorePanel'
import { EtherHand } from './EtherHand'
import type { CoreState } from '../types/core'
import { createCoreState, endCoreOverdrive, getCoreController, resolveCoreAtTurnEnd, startCoreOverdrive, syncCoreController } from '../utils/core'
import { applyResidualEtherArea, awakenSpiritAfterAttachment, isAwakenedAs, resolveAwakeningsAtTurnEnd } from '../utils/awakening'
import { chooseBestAction, chooseEtherAttachment, delay } from '../ai/AIController'
import { EMPTY_GAME_RESULT, type GameEndReason, type GameResult } from '../types/gameResult'
import { ConfirmModal, type ConfirmKind } from './ConfirmModal'
import { GameResultModal } from './GameResultModal'

const MODE_LABELS: Record<GameMode,string>={PLAYER_VS_AI:'컴퓨터와 플레이',LOCAL_PLAYER_VS_PLAYER:'사람과 플레이'}
const otherPlayer=(player:Player):Player=>player==='1P'?'2P':'1P'
const createEtherStates=():Record<Player,PlayerEtherState>=>({
  '1P':createPlayerEtherState('1P',3),
  '2P':createPlayerEtherState('2P',4),
})

export function Game({mode,onBack}:{mode:GameMode;onBack:()=>void}) {
  const [units,setUnits]=useState(createInitialUnits)
  const [etherStates,setEtherStates]=useState(createEtherStates)
  const [currentPlayer,setCurrentPlayer]=useState<Player>('1P')
  const [turnNumber,setTurnNumber]=useState(1)
  const [selectedUnitId,setSelectedUnitId]=useState<string|null>(null)
  const [selectedEtherId,setSelectedEtherId]=useState<string|null>(null)
  const [activeUnitId,setActiveUnitId]=useState<string|null>(null)
  const [hasMoved,setHasMoved]=useState(false)
  const [hasAttacked,setHasAttacked]=useState(false)
  const [actionCompleted,setActionCompleted]=useState(false)
  const [etherAttachCount,setEtherAttachCount]=useState(0)
  const [turnOverlay,setTurnOverlay]=useState(false)
  const [gameResult,setGameResult]=useState<GameResult>(EMPTY_GAME_RESULT)
  const [coreState,setCoreState]=useState<CoreState>(createCoreState)
  const [playerTurnCount,setPlayerTurnCount]=useState<Record<Player,number>>({'1P':1,'2P':0})
  const [earlyFreeMoveUsed,setEarlyFreeMoveUsed]=useState<Record<Player,boolean>>({'1P':false,'2P':false})
  const [freeMoveMode,setFreeMoveMode]=useState(false)
  const [aiThinking,setAiThinking]=useState(false)
  const [aiMessage,setAiMessage]=useState('')
  const aiAbortRef=useRef<AbortController|null>(null)
  const gameResultRef=useRef<GameResult>(EMPTY_GAME_RESULT)
  const gameSessionRef=useRef(1)
  const transitioningRef=useRef(false)
  const [isTransitioning,setIsTransitioning]=useState(false)
  const [confirmModal,setConfirmModal]=useState<ConfirmKind|null>(null)
  const [aiRunNonce,setAiRunNonce]=useState(0)
  const winner=gameResult.winner

  const selectedUnit=units.find((unit)=>unit.id===selectedUnitId)??null
  const activeUnit=units.find((unit)=>unit.id===activeUnitId)??null
  const validMoves=useMemo(()=>selectedUnit&&!hasMoved&&!hasAttacked&&!actionCompleted?getValidMoves(selectedUnit,units,5):[],[selectedUnit,units,hasMoved,hasAttacked,actionCompleted])
  const attackableTargets=useMemo(()=>{
    if(!selectedUnit||freeMoveMode||hasAttacked||actionCompleted||(selectedUnit.type==='ARCHER'&&!hasMoved))return[]
    return getAttackableTargets(selectedUnit,units)
  },[selectedUnit,units,freeMoveMode,hasMoved,hasAttacked,actionCompleted])

  const cancelActiveAI=()=>{aiAbortRef.current?.abort();aiAbortRef.current=null;setAiThinking(false);setAiMessage('')}
  const endGame=(winningPlayer:Player,losingPlayer:Player,reason:GameEndReason)=>{
    if(gameResultRef.current.isGameOver)return
    const result:GameResult={isGameOver:true,winner:winningPlayer,loser:losingPlayer,reason}
    gameResultRef.current=result;cancelActiveAI();setTurnOverlay(false);setConfirmModal(null);setSelectedUnitId(null);setGameResult(result)
  }
  const resetGame=()=>{
    if(transitioningRef.current)return
    transitioningRef.current=true;setIsTransitioning(true);cancelActiveAI();gameSessionRef.current+=1
    setUnits(createInitialUnits());setEtherStates(createEtherStates());setCurrentPlayer('1P');setTurnNumber(1);setSelectedUnitId(null);setSelectedEtherId(null);setActiveUnitId(null);setHasMoved(false);setHasAttacked(false);setActionCompleted(false);setEtherAttachCount(0);setTurnOverlay(false);setCoreState(createCoreState());setPlayerTurnCount({'1P':1,'2P':0});setEarlyFreeMoveUsed({'1P':false,'2P':false});setFreeMoveMode(false);setConfirmModal(null)
    const empty={...EMPTY_GAME_RESULT};gameResultRef.current=empty;setGameResult(empty)
    queueMicrotask(()=>{transitioningRef.current=false;setIsTransitioning(false)})
  }
  const leaveToLobby=()=>{
    if(transitioningRef.current)return
    transitioningRef.current=true;setIsTransitioning(true);cancelActiveAI();gameSessionRef.current+=1;onBack()
  }
  const requestLobby=()=>{if(aiThinking)cancelActiveAI();setConfirmModal('LOBBY')}
  const cancelConfirmation=()=>{setConfirmModal(null);if(mode==='PLAYER_VS_AI'&&currentPlayer==='2P'&&!gameResultRef.current.isGameOver)setAiRunNonce((nonce)=>nonce+1)}
  const confirmSurrender=()=>{const loser=mode==='PLAYER_VS_AI'?'1P':currentPlayer;endGame(otherPlayer(loser),loser,'SURRENDER')}

  useEffect(()=>{
    if(!confirmModal)return
    const onKeyDown=(event:KeyboardEvent)=>{if(event.key==='Escape')cancelConfirmation()}
    window.addEventListener('keydown',onKeyDown);return()=>window.removeEventListener('keydown',onKeyDown)
  },[confirmModal])

  useEffect(()=>{
    validateInitialState(units)
    console.table(units.map(({id,owner,type,x,y})=>({id,owner,type,x,y})))
    console.log('1P starting hand:',etherStates['1P'].hand.map((card)=>card.type))
    console.log('2P starting hand:',etherStates['2P'].hand.map((card)=>card.type))
  },[])

  useEffect(()=>{
    if(winner)return
    const controller=getCoreController(units)
    setCoreState((state)=>{
      if(state.controller!==controller){
        if(state.controller)console.log(`${state.controller} lost core control`)
        console.log(controller?`Core controlled by ${controller}`:'Core is uncontrolled')
      }
      return syncCoreController(state,controller)
    })
  },[units,winner])

  const resetActionState=()=>{setSelectedUnitId(null);setSelectedEtherId(null);setActiveUnitId(null);setHasMoved(false);setHasAttacked(false);setActionCompleted(false);setEtherAttachCount(0);setFreeMoveMode(false)}

  const drawForPlayer=(player:Player,overdriveBonus=false)=>setEtherStates((states)=>{
    const result=drawEther(states[player])
    if(result.drawn)console.log(`${player} drew ${result.drawn.type}`)
    if(result.drawn&&overdriveBonus)console.log(`${player} overdrive bonus draw: ${result.drawn.type}`)
    if(result.discarded)console.log(`Hand full. Discarded drawn ether: ${result.discarded.type}`)
    return {...states,[player]:result.state}
  })

  const advanceTurn=(next:Player,showOverlay:boolean,turnEndUnits=units)=>{
    const endedUnits=resolveAwakeningsAtTurnEnd(turnEndUnits,currentPlayer)
    setUnits(endedUnits)
    let resolved=resolveCoreAtTurnEnd(currentPlayer,endedUnits,coreState)
    resolved=endCoreOverdrive(currentPlayer,resolved)
    const started=startCoreOverdrive(next,resolved)
    setCoreState(started.state)
    resetActionState();drawForPlayer(next);if(started.activated)drawForPlayer(next,true)
    setPlayerTurnCount((counts)=>({...counts,[next]:counts[next]+1}))
    setEarlyFreeMoveUsed((used)=>({...used,[next]:false}))
    setCurrentPlayer(next);setTurnNumber((turn)=>turn+1);setTurnOverlay(showOverlay)
  }

  const endTurn=()=>{
    if(winner||turnOverlay||confirmModal||aiThinking||(mode==='PLAYER_VS_AI'&&currentPlayer==='2P'))return
    const next=otherPlayer(currentPlayer)
    advanceTurn(next,mode==='LOCAL_PLAYER_VS_PLAYER')
    console.log(`Turn ended. ${next} turn begins.`)
  }

  const discardFromDefeated=(defeated:Unit[])=>setEtherStates((states)=>{
    const next={...states}
    ;(['1P','2P'] as const).forEach((owner)=>{
      const cards=defeated.filter((unit)=>unit.owner===owner).flatMap((unit)=>unit.attachedEthers)
      if(cards.length){next[owner]={...next[owner],discardPile:[...next[owner].discardPile,...cards]};console.log(`Discarded attached ethers: ${cards.map((card)=>card.type).join(', ')}`)}
    })
    return next
  })

  const attachSelectedEther=(target:Unit):boolean=>{
    if(!selectedEtherId)return false
    const card=etherStates[currentPlayer].hand.find((item)=>item.id===selectedEtherId)
    const attachLimit=getEtherAttachLimit(coreState.overdriveActive[currentPlayer])
    const allowed=card&&target.owner===currentPlayer&&!activeUnitId&&!hasMoved&&!hasAttacked&&!actionCompleted&&etherAttachCount<attachLimit&&target.attachedEthers.length<MAX_ATTACHED_ETHERS
    if(!card||!allowed)return true
    const beforeHp=target.hp
    setUnits((current)=>current.map((unit)=>{
      if(unit.id!==target.id)return unit
      const attached={...unit,hp:card.type==='WATER'?Math.min(unit.maxHp,unit.hp+1):unit.hp,attachedEthers:[...unit.attachedEthers,card]}
      return awakenSpiritAfterAttachment(attached,playerTurnCount[currentPlayer])
    }))
    setEtherStates((states)=>({...states,[currentPlayer]:{...states[currentPlayer],hand:states[currentPlayer].hand.filter((item)=>item.id!==card.id)}}))
    setEtherAttachCount((count)=>count+1);setSelectedEtherId(null)
    console.log(`${currentPlayer} attached ${card.type} to ${target.id}`)
    if(card.type==='WATER')console.log(`WATER healed ${target.id} for ${Math.min(1,target.maxHp-beforeHp)}\nHP: ${beforeHp} -> ${Math.min(target.maxHp,beforeHp+1)}`)
    if(card.type==='FIRE')console.log(`Final attack: ${getFinalAttack(target)} -> ${getFinalAttack(target)+1}`)
    if(card.type==='WIND')console.log(`Final movement: ${getFinalMovement(target)} -> ${getFinalMovement(target)+1}`)
    return true
  }

  const handleCellClick=(x:number,y:number)=>{
    if(winner||turnOverlay||confirmModal||actionCompleted||aiThinking||(mode==='PLAYER_VS_AI'&&currentPlayer==='2P'))return
    const clicked=units.find((unit)=>unit.x===x&&unit.y===y)
    if(clicked&&selectedEtherId&&attachSelectedEther(clicked))return
    console.log(`Clicked cell: ${x}, ${y}`)
    if(clicked){
      if(clicked.owner!==currentPlayer){
        if(!selectedUnit||!attackableTargets.some((target)=>target.id===clicked.id))return
        setSelectedEtherId(null);setActiveUnitId(selectedUnit.id);setHasAttacked(true);setActionCompleted(true)
        const damage=calculateDamage(selectedUnit,clicked)
        const result=resolveAttack(units,selectedUnit.id,clicked.id,damage,hasLightning(selectedUnit))
        console.log(`${selectedUnit.id} attacked ${clicked.id} for ${damage} damage`)
        if(result.chainTarget)console.log(`LIGHTNING chain hit ${result.chainTarget.id} for 1`)
        const residualArea=isAwakenedAs(selectedUnit,'LATE')
          ?applyResidualEtherArea(result.units,{x:clicked.x,y:clicked.y},selectedUnit.owner)
          :{units:result.units,affectedIds:[]}
        const resolvedUnits=residualArea.units
        if(isAwakenedAs(selectedUnit,'LATE')){
          console.log(`${selectedUnit.id} triggered Residual Ether area at (${clicked.x},${clicked.y})`)
          console.log('Residual Ether affected:',residualArea.affectedIds)
        }
        setUnits(resolvedUnits);discardFromDefeated(result.defeated)
        result.defeated.forEach((unit)=>console.log(`${unit.id} defeated`))
        if(selectedUnit.type==='KNIGHT'&&result.mainTargetDefeated)console.log(`Knight capture move:\n(${selectedUnit.x},${selectedUnit.y}) -> (${clicked.x},${clicked.y})`)
        const deadKing=result.defeated.find((unit)=>unit.type==='KING')
        if(deadKing){const victor=otherPlayer(deadKing.owner);endGame(victor,deadKing.owner,'KING_DEFEATED');console.log(`${victor} wins`)}
        setSelectedUnitId(null);return
      }
      if(activeUnitId&&clicked.id!==activeUnitId)return
      if(clicked.id===selectedUnitId){if(!activeUnitId)setSelectedUnitId(null);return}
      setFreeMoveMode(false);setSelectedUnitId(clicked.id);console.log('Selected unit:',clicked);console.log('Valid moves:',getValidMoves(clicked,units,5));return
    }
    const canMove=selectedUnit&&validMoves.some((move)=>move.x===x&&move.y===y)
    if(!selectedUnit||!canMove){if(!activeUnitId)setSelectedUnitId(null);return}
    setSelectedEtherId(null)
    if(freeMoveMode){
      setUnits((current)=>current.map((unit)=>unit.id===selectedUnit.id?{...unit,x,y}:unit))
      setEarlyFreeMoveUsed((used)=>({...used,[currentPlayer]:true}));setFreeMoveMode(false);setSelectedUnitId(null)
      console.log(`${selectedUnit.id} used EARLY free move`);return
    }
    const updatedUnits=units.map((unit)=>unit.id===selectedUnit.id?{...unit,x,y}:unit)
    const movedUnit=updatedUnits.find((unit)=>unit.id===selectedUnit.id)!
    setActiveUnitId(movedUnit.id);setSelectedUnitId(movedUnit.id);setHasMoved(true)
    if(isMidLeapDestination(selectedUnit,units,{x,y}))console.log(`${selectedUnit.id} used MID leap`)
    setUnits(updatedUnits)
    console.log(`Moved ${selectedUnit.id} from (${selectedUnit.x},${selectedUnit.y}) to (${x},${y})`)
    if(movedUnit.type==='ARCHER')console.log('Archer targets after move:',getAttackableTargets(movedUnit,updatedUnits).map((target)=>target.id))
  }

  useEffect(()=>{
    if(mode!=='PLAYER_VS_AI'||currentPlayer!=='2P'||turnOverlay||winner)return
    const controller=new AbortController();aiAbortRef.current=controller
    const sessionId=gameSessionRef.current
    const wait=async(ms:number)=>{await delay(ms,controller.signal);if(sessionId!==gameSessionRef.current)throw new DOMException('Stale session','AbortError')}
    const run=async()=>{
      try{
        setAiThinking(true);setAiMessage('AI가 전장을 분석하고 있습니다…');await wait(450)
        let workingUnits=units
        let workingEthers=etherStates
        const attachLimit=coreState.overdriveActive['2P']?3:1
        let attached=0
        while(attached<attachLimit){
          const choice=chooseEtherAttachment(workingEthers['2P'].hand,workingUnits)
          if(!choice)break
          const card=choice.card,target=workingUnits.find((unit)=>unit.id===choice.unit.id)!
          workingUnits=workingUnits.map((unit)=>{
            if(unit.id!==target.id)return unit
            const next={...unit,hp:card.type==='WATER'?Math.min(unit.maxHp,unit.hp+1):unit.hp,attachedEthers:[...unit.attachedEthers,card]}
            return awakenSpiritAfterAttachment(next,playerTurnCount['2P'])
          })
          workingEthers={...workingEthers,'2P':{...workingEthers['2P'],hand:workingEthers['2P'].hand.filter((item)=>item.id!==card.id)}}
          attached+=1;setAiMessage(`AI가 ${ETHER_NAMES[card.type]} 에테르를 ${target.id}에 부착했습니다`);setUnits(workingUnits);setEtherStates(workingEthers);console.log(`AI chose ${card.type} for ${target.id}`);await wait(350)
          if(!coreState.overdriveActive['2P'])break
        }

        const earlySpirit=workingUnits.find((unit)=>unit.owner==='2P'&&isAwakenedAs(unit,'EARLY'))
        if(earlySpirit&&!earlyFreeMoveUsed['2P']){
          const moves=getValidMoves(earlySpirit,workingUnits,5).sort((a,b)=>(Math.abs(a.x-2)+Math.abs(a.y-2))-(Math.abs(b.x-2)+Math.abs(b.y-2)))
          const free=moves[0]
          if(free&&(Math.abs(free.x-2)+Math.abs(free.y-2)<Math.abs(earlySpirit.x-2)+Math.abs(earlySpirit.y-2))){
            workingUnits=workingUnits.map((unit)=>unit.id===earlySpirit.id?{...unit,...free}:unit);setUnits(workingUnits);setEarlyFreeMoveUsed((used)=>({...used,'2P':true}));setAiMessage('AI 정령이 EARLY 무료 이동을 사용했습니다');console.log(`${earlySpirit.id} used EARLY free move`);await wait(400)
          }
        }

        const action=chooseBestAction({units:workingUnits,player:'2P',coreHoldCount:coreState.holdCount,coreController:getCoreController(workingUnits)})
        if(action){
          setSelectedUnitId(action.unitId);setAiMessage(`AI가 ${action.unitId} 행동을 선택했습니다`);await wait(350)
          if(action.moveTo){workingUnits=workingUnits.map((unit)=>unit.id===action.unitId?{...unit,...action.moveTo}:unit);setUnits(workingUnits);setAiMessage(`AI가 (${action.moveTo.x}, ${action.moveTo.y})로 이동했습니다`);await wait(450)}
          if(action.attackTargetId){
            const attacker=workingUnits.find((unit)=>unit.id===action.unitId),target=workingUnits.find((unit)=>unit.id===action.attackTargetId)
            if(attacker&&target&&getAttackableTargets(attacker,workingUnits).some((unit)=>unit.id===target.id)){
              const damage=calculateDamage(attacker,target),result=resolveAttack(workingUnits,attacker.id,target.id,damage,hasLightning(attacker))
              const residual=isAwakenedAs(attacker,'LATE')?applyResidualEtherArea(result.units,{x:target.x,y:target.y},attacker.owner):{units:result.units,affectedIds:[]}
              workingUnits=residual.units
              for(const defeated of result.defeated)if(defeated.attachedEthers.length)workingEthers={...workingEthers,[defeated.owner]:{...workingEthers[defeated.owner],discardPile:[...workingEthers[defeated.owner].discardPile,...defeated.attachedEthers]}}
              setUnits(workingUnits);setEtherStates(workingEthers);setAiMessage(`AI가 ${target.id}을 공격해 ${damage} 피해를 주었습니다`);console.log(`${attacker.id} attacked ${target.id} for ${damage} damage`);await wait(450)
              const deadKing=result.defeated.find((unit)=>unit.type==='KING')
              if(deadKing){const victor=otherPlayer(deadKing.owner);endGame(victor,deadKing.owner,'KING_DEFEATED');console.log(`${victor} wins`);return}
            }
          }
        }else setAiMessage('AI가 가능한 행동이 없어 턴을 종료합니다')
        await wait(350);setSelectedUnitId(null);setAiMessage('');setAiThinking(false);advanceTurn('1P',false,workingUnits)
      }catch(error){
        if(!(error instanceof DOMException&&error.name==='AbortError')){
          console.error('AI turn failed:',error);setSelectedUnitId(null);setAiMessage('AI 행동 오류로 턴을 종료합니다');setAiThinking(false);advanceTurn('1P',false,units)
        }
      }
    }
    void run()
    return()=>{controller.abort();if(aiAbortRef.current===controller)aiAbortRef.current=null}
  },[currentPlayer,mode,turnOverlay,winner,aiRunNonce])

  const p1=units.filter((unit)=>unit.owner==='1P').length,p2=units.filter((unit)=>unit.owner==='2P').length
  const currentHand=etherStates[currentPlayer].hand
  const opponent=otherPlayer(currentPlayer)
  const showHand=!turnOverlay&&!winner&&(mode==='LOCAL_PLAYER_VS_PLAYER'||currentPlayer==='1P')
  const overdriveActive=coreState.overdriveActive[currentPlayer]

  return <main className="screen game"><header><div><p className="eyebrow">AETHERBIND</p><h1>에테르바인드</h1></div><div className="mode"><span>게임 모드</span><strong>{MODE_LABELS[mode]}</strong><span>현재 턴: {turnNumber} · 개인 턴: {playerTurnCount[currentPlayer]}</span><span className="current-player">현재 플레이어: {currentPlayer}</span></div><div className="header-actions"><button className="surrender-button" disabled={Boolean(winner||turnOverlay||aiThinking||(mode==='PLAYER_VS_AI'&&currentPlayer==='2P'))} onClick={()=>setConfirmModal('SURRENDER')}>항복</button><button className="quiet" disabled={Boolean(winner)} onClick={requestLobby}>로비로</button></div></header>
    <section className="board-wrap"><div className="player-label enemy">2P · CRIMSON</div><Board units={units} selectedUnitId={selectedUnitId} validMoves={validMoves} attackableTargetIds={attackableTargets.map((target)=>target.id)} onCellClick={handleCellClick} coreController={coreState.controller} coreOverdrive={overdriveActive}/><div className="player-label ally">1P · AZURE</div>{selectedUnit&&<div className="selection-info"><span>선택 기물</span><strong>{selectedUnit.owner} · {UNIT_STATS[selectedUnit.type].name}</strong><small>HP {selectedUnit.hp} / {selectedUnit.maxHp}</small><small>공격력 {getBaseAttack(selectedUnit)} → {getFinalAttack(selectedUnit)}</small><small>이동력 {getBaseMovement(selectedUnit)} → {getFinalMovement(selectedUnit)}</small><small>에테르 {selectedUnit.attachedEthers.length}/3</small><small className="ether-list">{selectedUnit.attachedEthers.map((card)=>ETHER_NAMES[card.type]).join(' / ')||'없음'}</small>{selectedUnit.residualEther&&<small className="debuff-info">잔류 에테르 · 다음 자기 턴 MOVE -1</small>}{selectedUnit.awakening.active&&<><small className="awakening-info">각성: {selectedUnit.awakening.type} · 남은 {selectedUnit.awakening.turnsRemaining}턴</small><small>특수 능력: {selectedUnit.awakening.type==='EARLY'?'무료 이동':selectedUnit.awakening.type==='MID'?'도약':'잔류 에테르'}</small></>}{isAwakenedAs(selectedUnit,'EARLY')&&selectedUnit.owner===currentPlayer&&!earlyFreeMoveUsed[currentPlayer]&&!activeUnitId&&!actionCompleted&&<button disabled={Boolean(confirmModal)} className={`free-move-button${freeMoveMode?' active':''}`} onClick={()=>setFreeMoveMode((active)=>!active)}>{freeMoveMode?'무료 이동 취소':'무료 이동'}</button>}</div>}</section><CorePanel state={coreState}/>
    {!turnOverlay&&!(mode==='PLAYER_VS_AI'&&currentPlayer==='2P')&&<div className="ether-zone">{showHand&&<EtherHand cards={currentHand} selectedId={selectedEtherId} disabled={Boolean(confirmModal||aiThinking||activeUnitId||actionCompleted||etherAttachCount>=getEtherAttachLimit(overdriveActive))} onSelect={(id)=>setSelectedEtherId((selected)=>selected===id?null:id)}/>}<div className="ether-summary">{overdriveActive?'CORE OVERDRIVE · 무제한 부착 · ':''}{mode==='PLAYER_VS_AI'?'AI':opponent} 손패: {etherStates[opponent].hand.length}장 · 덱 {etherStates[currentPlayer].deck.length} · 버림 {etherStates[currentPlayer].discardPile.length}</div></div>}
    {mode==='PLAYER_VS_AI'&&currentPlayer==='2P'&&<div className="ai-status"><span className="ai-pulse"/> <strong>AI TURN</strong><span>{aiMessage||'AI가 준비 중입니다…'}</span></div>}
    <footer className="game-footer"><div className="counts"><span>총 기물 수 <strong>{units.length}</strong></span><span>1P 기물 <strong>{p1}</strong></span><span>2P 기물 <strong>{p2}</strong></span></div><div className="turn-controls"><span>{activeUnit?`행동 중: ${activeUnit.owner} ${UNIT_STATS[activeUnit.type].name}`:aiThinking?'AI 행동 중':'행동 대기'}</span><button className="primary end-turn" disabled={Boolean(winner||turnOverlay||confirmModal||aiThinking||(mode==='PLAYER_VS_AI'&&currentPlayer==='2P'))} onClick={endTurn}>턴 종료</button></div></footer>
    {turnOverlay&&!winner&&mode==='LOCAL_PLAYER_VS_PLAYER'&&<div className="turn-backdrop" role="dialog" aria-modal="true"><div className="turn-panel"><p className="eyebrow">TURN {turnNumber}</p>{overdriveActive&&<strong className="overdrive-notice">CORE OVERDRIVE 활성</strong>}<h2>{currentPlayer}의 턴입니다</h2><p>준비되면 턴을 시작하세요.</p><button className="primary" onClick={()=>setTurnOverlay(false)}>턴 시작</button></div></div>}
    {confirmModal&&!winner&&<ConfirmModal kind={confirmModal} onCancel={cancelConfirmation} onConfirm={confirmModal==='SURRENDER'?confirmSurrender:leaveToLobby}/>} 
    {gameResult.isGameOver&&<GameResultModal result={gameResult} mode={mode} onRestart={resetGame} onLobby={leaveToLobby} disabled={isTransitioning}/>} 
  </main>
}
