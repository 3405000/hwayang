d3.csv("../music-data.csv").then(function (csvData) {
    // 시각화에 사용할 항목 정의
    const visualFields = [
        "Energy", "Danceability", "Happiness",
        "Acousticness", "Instrumentalness", "Liveness"
    ];

    // 아티스트 등장 횟수로 정렬된 목록 추출
    function getArtistListSortedByCount(data) {
        const countMap = {};
        data.forEach(d => {
            d["아티스트"].split(",")
                .map(a => a.trim())
                .forEach(a => {
                    countMap[a] = (countMap[a] || 0) + 1;
                });
        });
        // [{name: 'Chet Baker', count: 2}, ...] 형태로 변환 후 정렬
        return Object.entries(countMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .map(obj => obj.name);
    }

    // 반원 그리기용 arc path 생성 (좌/우, 90도 회전 적용)
    function describeArc(x, y, r, startAngle, endAngle) {
        const start = polarToCartesian(x, y, r, endAngle);
        const end = polarToCartesian(x, y, r, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        return [
            "M", start.x, start.y,
            "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
            "L", x, y,
            "Z"
        ].join(" ");
    }

    function polarToCartesian(cx, cy, r, angleInDegrees) {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: cx + (r * Math.cos(angleInRadians)),
            y: cy + (r * Math.sin(angleInRadians))
        };
    }

    // 원 시각화 그리기 함수
    function drawCircles(selectedArtist = null) {
        const container = d3.select("#circle-container");
        container.html("");

        const circleSize = 54;
        const circlesPerRow = 15; // 한 행에 15개씩
        const svgWidth = circlesPerRow * (circleSize + 10);
        const svgHeight = Math.ceil(csvData.length / circlesPerRow) * (circleSize + 18);

        const svg = container.append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

        csvData.forEach((d, i) => {
            const x = (i % circlesPerRow) * (circleSize + 10) + circleSize / 2 + 2;
            const y = Math.floor(i / circlesPerRow) * (circleSize + 18) + circleSize / 2 + 2;

            const artistArr = d["아티스트"].split(",").map(a => a.trim());
            // 전체 선택 시 모든 원을 색상으로 표시
            const isActive = selectedArtist ?
                artistArr.includes(selectedArtist) :
                true;

            const values = visualFields.map(f => ({
                key: f,
                value: +d[f]
            }));
            values.sort((a, b) => b.value - a.value);
            const [first, second] = values.slice(0, 2);

            const g = svg.append("g")
                .attr("class", "music-circle")
                .attr("transform", `translate(${x},${y})`);

            if (isActive) {
                // 왼쪽 반원 (상위 1순위 값) - 90도 회전 적용
                g.append("path")
                    .attr("d", describeArc(0, 0, circleSize / 2, 0, 180))
                    .attr("fill", colors[first.key]);

                // 오른쪽 반원 (상위 2순위 값) - 90도 회전 적용
                g.append("path")
                    .attr("d", describeArc(0, 0, circleSize / 2, 180, 360))
                    .attr("fill", colors[second.key]);
            } else {
                // 회색 원 (비활성 상태)
                g.append("circle")
                    .attr("r", circleSize / 2)
                    .attr("fill", "#bbb")
                    .attr("class", "gray-circle");
            }
        });
    }

    // 아티스트 버튼 생성 함수
    function drawButtons(artistList, selectedArtist) {
        const btnContainer = d3.select("#buttons");
        btnContainer.html("");

        // 전체 버튼
        btnContainer.append("button")
            .attr("class", `artist-btn ${!selectedArtist ? "selected" : ""}`)
            .text("전체 보기")
            .on("click", () => {
                drawCircles(null);
                drawButtons(artistList, null);
            });

        // 아티스트별 버튼
        artistList.forEach(artist => {
            btnContainer.append("button")
                .attr("class", `artist-btn ${selectedArtist === artist ? "selected" : ""}`)
                .text(artist)
                .on("click", () => {
                    drawCircles(artist);
                    drawButtons(artistList, artist);
                });
        });
    }

    // 초기 실행
    const artistList = getArtistListSortedByCount(csvData);
    drawCircles();
    drawButtons(artistList, null);
});

document.addEventListener('DOMContentLoaded', function() {
    const howToBtn = document.getElementById('how-to-btn');
    const overlay = document.getElementById('how-to-overlay');
    const closeBtn = document.getElementById('close-how-to-btn');

    howToBtn.addEventListener('click', function() {
        overlay.style.display = 'flex';
    });

    closeBtn.addEventListener('click', function() {
        overlay.style.display = 'none';
    });

    // ESC 키로도 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            overlay.style.display = 'none';
        }
    });
});
