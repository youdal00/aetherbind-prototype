import { useEffect } from 'react'

const Stat=({hp,atk,move}:{hp:number;atk:number;move:number})=><span className="stat-line">HP {hp}<i/>ATK {atk}<i/>MOVE {move}</span>

export function Rules({onBack}:{onBack:()=>void}){
  useEffect(()=>{const key=(event:KeyboardEvent)=>{if(event.key==='Escape')onBack()};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[onBack])
  return <main className="screen rules rules-page">
    <header className="rules-header"><div><p className="eyebrow">AETHERBIND · FIELD ARCHIVE</p><h1>게임 규칙</h1><p>5×5 전장에서 에테르와 코어를 지배해 상대 왕을 쓰러뜨리세요.</p></div><button className="quiet" onClick={onBack}>← 로비로</button></header>
    <nav className="rules-nav"><a href="#goal">목표</a><a href="#units">기물</a><a href="#turn">턴</a><a href="#ether">에테르</a><a href="#core-rules">코어</a><a href="#awakening">정령 각성</a><a href="#victory">승리</a></nav>
    <article className="rules-content">
      <section id="goal" className="rule-section hero-rule"><p className="section-number">01</p><div><h2>게임 목표와 초기 배치</h2><p>Aetherbind는 5×5 보드에서 진행되는 2인용 턴제 전략 게임입니다. 각 플레이어는 정령 1, 기사 2, 왕 1, 궁수 1로 구성된 5개 기물을 사용하며, 상대 왕의 HP를 0 이하로 만들면 즉시 승리합니다.</p><div className="setup-board"><div><b>2P</b><span>궁수</span><span>기사</span><span>왕</span><span>기사</span><span>정령</span></div><div className="empty-row"/><div className="core-row"><strong>CORE<br/><small>(2,2)</small></strong></div><div className="empty-row"/><div><b>1P</b><span>정령</span><span>기사</span><span>왕</span><span>기사</span><span>궁수</span></div></div></div></section>

      <section id="units" className="rule-section"><p className="section-number">02</p><div><h2>기물</h2><div className="unit-rule-grid">
        <div className="rule-card"><em>K</em><h3>왕</h3><Stat hp={12} atk={2} move={1}/><p>8방향 1칸 이동과 인접 공격. 왕이 처치되면 즉시 패배합니다.</p></div>
        <div className="rule-card"><em>N</em><h3>기사 ×2</h3><Stat hp={6} atk={2} move={2}/><p>8방향 인접 이동을 최대 2회 사용하며 방향을 바꿀 수 있습니다. 직접 공격으로 적을 처치하면 그 칸으로 전진합니다.</p></div>
        <div className="rule-card"><em>A</em><h3>궁수</h3><Stat hp={4} atk={2} move={1}/><p>반드시 이동한 뒤 8방향 직선 1~2칸을 공격합니다. 중간 기물을 통과해 공격할 수 없습니다. 거리 1은 최종 ATK 절반(내림, 최소 1), 거리 2는 전부 적용합니다.</p></div>
        <div className="rule-card"><em>S</em><h3>정령</h3><Stat hp={3} atk={1} move={1}/><p>8방향 이동과 인접 공격. 에테르 2개가 부착되는 순간 시점에 맞는 형태로 각성합니다.</p></div>
      </div><div className="rule-note">모든 기물은 보드 밖이나 점유된 칸으로 이동할 수 없고, 기본적으로 다른 기물을 통과할 수 없습니다.</div></div></section>

      <section id="turn" className="rule-section"><p className="section-number">03</p><div><h2>턴 진행</h2><div className="flow"><span>필요하면 에테르 부착</span><b>→</b><span>기물 1개 행동</span><b>→</b><span>턴 종료</span><b>→</b><span>상대 턴</span></div><p>한 턴에는 기본적으로 한 기물만 행동합니다. 이동만, 공격만, 이동 후 공격이 가능하고 공격 후에는 이동할 수 없습니다. 아무 행동 없이 턴을 넘기는 것도 가능합니다.</p></div></section>

      <section id="ether" className="rule-section"><p className="section-number">04</p><div><h2>에테르 덱과 부착</h2><p>각 플레이어는 불·물·바람·번개를 각 5장씩 가진 독립 덱으로 시작합니다. 1P 시작 손패는 3장, 후공 2P는 4장입니다. 최초 1P 턴을 제외하고 자기 턴 시작마다 1장을 드로우하며 최대 손패는 7장입니다. 초과 드로우는 버림 더미로 갑니다.</p><div className="ether-rule-grid">
        <div className="ether-rule fire"><b>🔥 불</b><span>지속 ATK +1 · 중첩</span></div><div className="ether-rule water"><b>💧 물</b><span>부착 순간 HP 1 회복</span></div><div className="ether-rule wind"><b>🌪 바람</b><span>지속 MOVE +1 · 중첩</span></div><div className="ether-rule lightning"><b>⚡ 번개</b><span>주 대상 뒤 기물 고정 피해 1</span></div>
      </div><ul><li>일반 턴에는 행동 시작 전 에테르 1개만 부착할 수 있습니다.</li><li>살아 있는 자신의 기물에만 부착하며, 기물당 최대 3개입니다.</li><li>번개 후방 피해는 적과 아군 모두 받을 수 있고 여러 번개가 있어도 1입니다.</li><li>기물이 사망하면 부착 에테르는 소유자의 버림 더미로 이동합니다.</li></ul></div></section>

      <section id="core-rules" className="rule-section"><p className="section-number">05</p><div><h2>코어와 코어 폭주</h2><p>중앙 (2,2)은 모든 기물이 점령할 수 있는 코어입니다. 자신의 턴 종료 시 코어를 점령하고 있으면 유지 카운터가 증가합니다. 코어가 비거나 상대에게 빼앗기면 카운터는 초기화됩니다.</p><div className="overdrive-card"><strong>CORE OVERDRIVE</strong><p>코어를 두 번 연속 유지하면 다음 자신의 턴에 발동합니다.</p><span>추가 에테르 1장 드로우</span><span>해당 턴 에테르 부착 횟수 제한 해제</span><small>기물당 3개 및 행동 시작 전 부착 제한은 유지 · 한 턴 동안 지속</small></div></div></section>

      <section id="awakening" className="rule-section"><p className="section-number">06</p><div><h2>정령 각성</h2><p>정령은 두 번째 에테르가 부착되는 순간 각성하며, 소유자의 자기 턴 기준 3턴 동안 유지됩니다. 모든 각성 정령은 <b>HP 4 / ATK 2 / MOVE 2</b>가 되고 HP를 1 회복합니다. 종료 시 HP 3 / ATK 1 / MOVE 1로 돌아가며 HP가 3을 넘으면 3으로 조정됩니다. 부착 에테르는 유지됩니다.</p><div className="awakening-grid">
        <div><b>EARLY · 초반</b><span>자기 턴 1~3회차</span><Stat hp={4} atk={2} move={2}/><h3>무료 이동</h3><p>자기 턴마다 한 번 행동력을 소비하지 않고 이동합니다. 이후 다른 기물 또는 같은 정령이 정상 행동할 수 있으며 무료 이동으로 공격할 수는 없습니다.</p></div>
        <div><b>MID · 중반</b><span>자기 턴 4~6회차</span><Stat hp={4} atk={2} move={2}/><h3>도약</h3><p>한 이동 행동에서 한 번, 인접한 아군이나 적을 넘어 같은 방향의 빈칸에 착지합니다. 8방향이며 이동력 1을 사용합니다.</p></div>
        <div><b>LATE · 후반</b><span>자기 턴 7회차+</span><Stat hp={4} atk={2} move={2}/><h3>잔류 에테르</h3><p>직접 공격한 주 대상 중심 3×3 범위의 모든 적에게 다음 자기 턴 MOVE -1을 적용합니다. 0까지 감소하며 중첩되지 않습니다.</p></div>
      </div><div className="rule-note">각성 종료 후 자동 재각성하지 않습니다. 기존 에테르를 유지한 채 새로운 세 번째 에테르가 부착되면 현재 시점 기준으로 다시 각성할 수 있습니다.</div></div></section>

      <section id="victory" className="rule-section final-rule"><p className="section-number">07</p><div><h2>승리·항복·게임 모드</h2><div className="final-grid"><div><h3>승리 조건</h3><p>상대 왕 처치 시 즉시 승리합니다. 게임 중 항복하면 상대 플레이어가 승리합니다.</p></div><div><h3>컴퓨터와 플레이</h3><p>1P 인간 대 2P AI. 인간이 항복하면 컴퓨터가 승리합니다.</p></div><div><h3>사람과 플레이</h3><p>한 컴퓨터에서 번갈아 플레이하며 턴 전환 화면으로 다음 플레이어의 손패를 보호합니다.</p></div></div></div></section>
    </article>
    <footer className="rules-footer"><button className="primary" onClick={onBack}>← 로비로 돌아가기</button><span>ESC를 눌러 돌아갈 수 있습니다.</span></footer>
  </main>
}
