(() => {
  // Character n-gram TF-IDF nearest-neighbor classifier, fitted locally from example utterances.
  const examples = {
    food:['식당 학생식당 학식','밥 먹을 곳','배고파 식사하고 싶어','점심 저녁 메뉴','아침밥 조식','cafeteria lunch dinner breakfast'],
    cafe:['카페 커피 한잔','커피 마시고 싶어','카페라떼 아메리카노','coffee cafe'],
    cvs:['편의점 매점','과자 생수 살 곳','convenience store'],
    atm:['현금 뽑기','은행 현금인출기','ATM cash bank'],
    gym:['헬스장 운동하고 싶어','체력단련 스포츠센터','fitness gym'],
    doc:['증명서 발급','우편 보내기','post office certificate'],
    lib:['도서관 열람실','조용히 공부할 곳','책 빌리기','library study room']
  };
  const clean = s => s.toLowerCase().normalize('NFKC').replace(/[^가-힣a-z0-9]/g,'');
  function features(text){
    const chars=clean(text), grams=new Set();
    for(const size of [2,3])for(let i=0;i<=chars.length-size;i++)grams.add(chars.slice(i,i+size));
    return grams;
  }
  const samples=Object.entries(examples).flatMap(([kind,lines])=>lines.map(line=>({kind,grams:features(line)})));
  const weights=new Map();
  for(const {grams} of samples)for(const gram of grams)weights.set(gram,(weights.get(gram)||0)+1);
  for(const [gram,count] of weights)weights.set(gram,(1+Math.log((1+samples.length)/(1+count)))**2);
  function mass(grams){return [...grams].reduce((sum,g)=>sum+(weights.get(g)||4),0)}
  function classify(text){
    const q=features(text);
    let best=null,score=0.15;
    for(const sample of samples){
      const shared=[...sample.grams].filter(g=>q.has(g));
      const similarity=mass(shared)/Math.sqrt(mass(q)*mass(sample.grams));
      if(similarity>score){best=sample.kind;score=similarity}
    }
    return best;
  }
  function requestedTime(q){
    const kst=new Date(Date.now()+9*3600000);
    if(/내일/.test(q))kst.setUTCDate(kst.getUTCDate()+1);
    const match=q.match(/(오전|오후|저녁|아침|밤)?\s*(\d{1,2})(?:시(?:\s*(\d{1,2})분)?|:(\d{2}))/);
    let minute=null;
    if(match){
      let h=Number(match[2]),m=Number(match[3]||match[4]||0);
      if(match[1] && h<=12){h%=12;if(/오후|저녁|밤/.test(match[1]))h+=12}
      if(h<24 && m<60)minute=h*60+m;
    }else if(/지금|현재/.test(q))minute=kst.getUTCHours()*60+kst.getUTCMinutes();
    const day=q.match(/([일월화수목금토])요일/);
    if(day){const offset=('일월화수목금토'.indexOf(day[1])-kst.getUTCDay()+7)%7;kst.setUTCDate(kst.getUTCDate()+offset)}
    return {minute,date:kst.toISOString().slice(0,10),weekday:kst.getUTCDay()};
  }
  const dialog=$('campusAssistant'),answers=$('assistantAnswers');
  $('askCampus').onclick=()=>{dialog.showModal();$('assistantQuery').focus()};
  $('assistantClose').onclick=()=>dialog.close();
  function find(q){
    const text=clean(q), kind=classify(q),category=CATS.find(c=>c.k===kind);
    const code=q.match(/(?:^|[^a-z0-9])([we]\d{1,2}|s[1-5]|0[1346])(?![a-z0-9])/i)?.[1].toUpperCase();
    const named=B.filter(b=>code?b.code===code:text.includes(clean(b.name)));
    const list=[];
    for(const b of code||named.length?named:B){
      if(/서캠/.test(q)&&b.c!=='W'||/동캠/.test(q)&&b.c!=='E')continue;
      const labels=[...new Set([...b.items.map(x=>x.n),...b.fl.map(x=>x.n)])];
      const exact=labels.filter(n=>clean(n).length>=2&&text.includes(clean(n)));
      const facilities=exact.length?exact:labels.filter(n=>category?.re.test(n));
      let hours=facilityHours[b.code]||[];
      if(kind==='food')hours=hours.filter(e=>e===cafeteriaHours||e.start);
      else if(kind==='lib')hours=b.code==='W1'?hours:[];
      else if(kind||exact.length)hours=[];
      if(/아침밥|조식|breakfast/i.test(q))hours=hours.filter(e=>e.start);
      if(!named.length&&!facilities.length&&!(kind&&hours.length))continue;
      list.push({b,facilities,hours,exact:exact.length});
    }
    return list.sort((a,b)=>b.exact-a.exact||b.hours.length-a.hours.length);
  }
  function addMapActions(article,b,routeLabel){
      for(const [label,action] of [['지도에서 보기',openSheet],[routeLabel,startGuide]]){
        if(action===startGuide&&!positionOf(b))continue;
        const button=document.createElement('button');button.textContent=label;
        button.onclick=()=>{dialog.close();action(b)};
        article.append(button);
      }
  }
  function answerRoom(q){
    const text=q.normalize('NFKC').toUpperCase();
    const code=text.match(/(?:^|[^A-Z0-9])([WES]\d{1,2})(?!\d)/)?.[1];
    const remainder=code?text.replace(code,' '):text;
    const number=remainder.match(/(?:^|[^A-Z0-9])([A-Z]?\d{3,4}(?:-\d+)?)(?:\s*호|(?![A-Z0-9:-]))/)?.[1];
    const byName=B.filter(b=>clean(q).includes(clean(b.name)));
    const buildings=code?B.filter(b=>b.code===code):byName.length?byName:B;
    const classroomQuery=/강의실|강의장|CLASSROOM/.test(text);
    const roomQuery=/호실|몇\s*호|\d\s*호|ROOM/.test(text);
    if(!roomQuery&&!classroomQuery&&!(number&&(code||byName.length||remainder.trim()===number)))return false;
    if(/홈페이지|사이트/.test(q))return false;
    let count=0;
    for(const b of buildings){
      if(/서캠/.test(q)&&b.c!=='W'||/동캠/.test(q)&&b.c!=='E')continue;
      const named=b.items.filter(x=>clean(x.n)&&clean(q).includes(clean(x.n)));
      const items=b.items.filter(x=>{
        if(!x.room)return false;
        if(number)return x.room.toUpperCase().match(/^([A-Z]?\d{3,4}(?:-\d+)?)(?=호|\s|$)/)?.[1]===number;
        if(named.length)return named.includes(x);
        return classroomQuery && /강의실|강의장/.test(x.n);
      });
      if(!items.length)continue;
      const card=document.createElement('article');
      card.innerHTML='<strong>'+esc(b.code+' '+b.name)+'</strong>';
      for(const x of items){
        const floor=floorOf(x.room);
        card.innerHTML+='<p>'+esc([floor==null?'':floor+'층',x.room,x.n].filter(Boolean).join(' · '))+
          (x.url?' <a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">학교 자료</a>':'')+'</p>';
      }
      addMapActions(card,b,'건물까지 길찾기');
      answers.append(card);count++;
    }
    const note=document.createElement('p');
    note.textContent=count?(count>1?'여러 건물이 일치합니다. 시간표의 건물 번호를 확인하세요.':'지도에 등록된 호실입니다.'):'등록 자료에서 해당 호실을 확인하지 못했습니다. 시간표의 건물 번호와 호실을 확인해 주세요.';
    answers.prepend(note);
    return true;
  }
  $('assistantForm').onsubmit=event=>{
    event.preventDefault();
    const q=$('assistantQuery').value.trim(), rows=find(q),time=requestedTime(q);
    answers.replaceChildren();
    if(answerRoom(q))return;
    const wantsWebsite=/홈페이지|사이트|학과\s*안내|website/i.test(q);
    const query=departmentKey(q).replace(/홈페이지|사이트|주소|알려줘|바로가기|website/g,'').trim();
    const matched=departmentSites.filter(([name])=>departmentNames(name).some(alias=>
      departmentKey(q).includes(alias)||(query.length>=2 && alias.includes(query))));
    if(wantsWebsite||matched.length){
      answers.insertAdjacentHTML('beforeend',departmentLinks(matched));
      if(wantsWebsite)return;
    }
    const summary=document.createElement('p');
    summary.textContent=rows.length?(time.minute===null?'지도에 등록된 시설과 운영시간입니다.':time.date+' 한국 시간 기준입니다. 공휴일·임시 휴무는 학교 안내를 확인하세요.'):'일치하는 장소를 찾지 못했습니다. 건물 번호나 시설명을 넣어 보세요.';
    answers.append(summary);
    for(const {b,facilities,hours} of rows){
      const article=document.createElement('article');
      article.innerHTML='<strong>'+esc(b.code+' '+b.name)+'</strong>';
      if(facilities.length)article.innerHTML+='<p>'+esc(facilities.slice(0,3).join(' · '))+'</p>';
      if(!hours.length)article.innerHTML+='<p>운영시간 확인 필요</p>';
      for(const entry of hours){
        const dayOK=(!entry.weekdays||time.weekday>0&&time.weekday<6)&&(!entry.start||entry.start<=time.date&&time.date<=entry.end);
        const inWindow=entry.windows.some(([start,end])=>time.minute>=start&&time.minute<end);
        const status=time.minute===null?'':dayOK&&inWindow?'안내 시간에 포함 · ':'안내 시간 외 · ';
        article.innerHTML+='<p>'+esc(status+entry[appLang])+' <a target="_blank" rel="noopener noreferrer" href="'+esc(entry.url)+'">학교 안내</a></p>';
      }
      addMapActions(article,b,'길찾기');
      answers.append(article);
    }
  };
})();
