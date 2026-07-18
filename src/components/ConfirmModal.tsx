export type ConfirmKind='SURRENDER'|'LOBBY'
export function ConfirmModal({kind,onCancel,onConfirm}:{kind:ConfirmKind;onCancel:()=>void;onConfirm:()=>void}){
  const lobby=kind==='LOBBY'
  return <div className="confirm-backdrop" role="dialog" aria-modal="true"><div className="confirm-panel"><h2>{lobby?'게임을 종료하고 로비로 돌아가시겠습니까?':'정말 항복하시겠습니까?'}</h2><p>{lobby?'현재 게임 진행 상황은 저장되지 않습니다.':'항복하면 현재 게임은 종료됩니다.'}</p><div><button className="quiet" onClick={onCancel}>취소</button><button className="danger" onClick={onConfirm}>{lobby?'로비로':'항복'}</button></div></div></div>
}
