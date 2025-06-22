fetch('/music/navigation/navigation.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('nav-container').innerHTML = html;

        // 네비게이션 바가 삽입된 후 active 클래스 부여
        const path = window.location.pathname;
        const navMap = {
            '/music/music-overview/music-overview.html': 'nav-overview',
            '/music/music-by-played/music-by-played.html': 'nav-time',
            '/music/music-by-published/music-by-published.html': 'nav-published',
            '/music/music-by-character/music-by-character.html': 'nav-character',
            '/music/music-by-artist/music-by-artist.html': 'nav-artist'
        };
        const activeId = navMap[path];
        if (activeId) {
            document.getElementById(activeId).classList.add('active');
        }
    });
