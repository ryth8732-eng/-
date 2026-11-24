// 우송대학교 입학종합서비스 학과 홈페이지 목록 (2026-11-24)
const departmentDirectory="https://ent.wsu.ac.kr/page/index.jsp?code=eguide0100";
const departmentSites = [
  ["자유전공학부", "https://global.wsu.ac.kr"],
  ["솔브릿지경영학부", "https://www.solbridge.ac.kr"],
  ["AI경영학과", "https://aim.wsu.ac.kr"],
  ["AI·빅데이터학과", "https://tech.endicott.ac.kr/"],
  ["글로벌호스피탈리티학과", "https://sihom.wsu.ac.kr"],
  ["철도건설시스템학부(글로벌철도학과)", "https://sira.wsu.ac.kr"],
  ["철도건설시스템학부(철도건설시스템전공)", "https://civil.wsu.ac.kr"],
  ["철도건설시스템학부(건축공학전공)", "https://arch.wsu.ac.kr"],
  ["철도경영학과", "https://biz.wsu.ac.kr"],
  ["철도시스템학부(철도전기시스템전공)", "https://railsignal.wsu.ac.kr"],
  ["철도시스템학부(철도소프트웨어전공)", "https://railwaysoftware.wsu.ac.kr"],
  ["철도차량시스템학과", "https://rail.wsu.ac.kr"],
  ["철도자율전공학부", "https://railfree.wsu.ac.kr"],
  ["테크노미디어융합학부(글로벌미디어영상학과)", "https://sima.wsu.ac.kr"],
  ["테크노미디어융합학부(미디어디자인·영상전공)", "https://design.wsu.ac.kr"],
  ["게임멀티미디어학부(게임소프트웨어전공)", "https://game.wsu.ac.kr"],
  ["게임멀티미디어학부(게임그래픽전공)", "https://gamegraphics.wsu.ac.kr"],
  ["소프트웨어학부(컴퓨터공학전공)", "https://cs.wsu.ac.kr"],
  ["소프트웨어학부(컴퓨터‧소프트웨어전공)", "https://it.wsu.ac.kr"],
  ["글로벌조리학부(글로벌조리전공)", "https://sica.wsu.ac.kr"],
  ["글로벌조리학부(Lyfe조리전공)", "https://sicaipb.wsu.ac.kr"],
  ["글로벌조리학부(글로벌외식,조리경영전공)", "https://sires.wsu.ac.kr"],
  ["외식조리학부(외식조리전공)", "https://culinary.wsu.ac.kr"],
  ["외식조리학부(한식·조리과학전공)", "https://culinaryos.wsu.ac.kr"],
  ["외식조리학부(외식,조리경영전공)", "https://foodservice2.wsu.ac.kr"],
  ["제과제빵·조리학부(제과제빵·조리전공)", "https://bpc.wsu.ac.kr/main/index.jsp"],
  ["제과제빵·조리학부(글로벌제과제빵학과)", "https://wgbpc.wsu.ac.kr/main/index.jsp"],
  ["외식조리영양학과", "https://csnn.wsu.ac.kr"],
  ["호텔관광경영학과", "https://tour.wsu.ac.kr"],
  ["외식조리자율전공학부", "https://chefcareer.wsu.ac.kr"],
  ["사회복지학과", "https://welfare.wsu.ac.kr"],
  ["작업치료학과", "https://ot.wsu.ac.kr"],
  ["언어치료ㆍ청각재활학과", "https://speech.wsu.ac.kr"],
  ["보건의료경영학과", "https://healthbiz.wsu.ac.kr"],
  ["유아교육과", "https://childedu.wsu.ac.kr"],
  ["뷰티디자인경영학과", "https://beauty.wsu.ac.kr"],
  ["응급구조학과", "https://emergency.wsu.ac.kr"],
  ["소방·안전학부", "https://fire2.wsu.ac.kr"],
  ["간호학과", "https://nursing.wsu.ac.kr"],
  ["물리치료학과", "https://pt.wsu.ac.kr"],
  ["스포츠건강재활학과", "https://at.wsu.ac.kr"],
  ["동물관리학부(동물의료관리학과)", "https://animal.wsu.ac.kr"],
  ["동물관리학부(토탈펫케어학과)", "https://petcare.wsu.ac.kr"],
  ["보건복지자율전공학부", "https://nexthealth-welfare.wsu.ac.kr"],
  ["휴먼디지털인터페이스학부", "https://www.jcfs.ac.kr"],
];
function departmentKey(value){
  return value.toLowerCase().replace(/[\s·ㆍ‧,]/g,'');
}
function departmentNames(name){
  const major=name.match(/\(([^)]+)\)$/);
  return (major?[name,major[1]]:[name]).map(departmentKey);
}
function buildingDepartments(code){
  const names=(D[code]||[]).map(departmentKey);
  return departmentSites.filter(([name])=>departmentNames(name).some(alias=>names.includes(alias)));
}
function departmentLinks(rows){
  const label={ko:'학과 홈페이지',en:'Department websites',ja:'学科ホームページ',zh:'院系网站'}[appLang];
  const all={ko:'전체 학과 안내',en:'All departments',ja:'全学科案内',zh:'全部院系'}[appLang];
  const link=(name,url)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)} ↗</a>`;
  return `<div class="departmentLinks"><strong>${label}</strong>${rows.map(([name,url])=>link(localizePlace(name),url)).join('')}${link(all,departmentDirectory)}</div>`;
}
