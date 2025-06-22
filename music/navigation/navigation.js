// 현재 페이지에 따라 active 클래스 부여
function setActiveNavItem() {
  // 실제 환경에서는 window.location.pathname을 사용
  // 데모를 위해 '발매일' 페이지가 활성화된 것으로 가정
  const activeId = 'nav-published';

  // 모든 nav-item에서 active 클래스 제거
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });

  // 현재 페이지에 해당하는 항목에 active 클래스 추가
  const activeElement = document.getElementById(activeId);
  if (activeElement) {
    activeElement.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', setActiveNavItem);

// 실제 환경에서 사용할 코드 예시:
const path = window.location.pathname;
const navMap = {
  '/music-overview/music-overview.html': 'nav-overview',
  '/music-by-played/music-by-played.html': 'nav-time',
  '/music-by-published/music-by-published.html': 'nav-published',
  '/music-by-character/music-by-character.html': 'nav-character',
  '/music-by-artist/music-by-artist.html': 'nav-artist'
};
const activeId = navMap[path];
if (activeId) {
  document.getElementById(activeId).classList.add('active');
}
