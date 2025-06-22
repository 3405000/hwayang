window.addEventListener('scroll', function () {
    const navBtn = document.getElementById('nav-artist');
    // (window.innerHeight + window.scrollY) : 현재 보이는 화면의 맨 아래 위치
    // document.body.offsetHeight : 전체 문서의 높이
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 2) {
        navBtn.style.display = 'flex';
    } else {
        navBtn.style.display = 'none';
    }
});
