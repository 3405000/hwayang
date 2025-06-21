d3.csv("music-data.csv").then(function (data) {
    const width = 1000;
    const heightPerValue = 20; // 데이터 한 행 당 세로 간격
    const paddingTop = 30;
    const paddingSides = 30;
    const keys = ["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"];

    const maxWidth = 100; // 최대 너비 (값이 100일 때)
    const height = data.length * heightPerValue + paddingTop * 2;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // 각 key의 x 좌표 (열 위치)
    const xPositions = keys.map((_, i) => paddingSides + i * (maxWidth + 30));

    // 영역 그리기용 area generator 생성
    // x0: 왼쪽 x, x1: 오른쪽 x, y: 세로 위치
    const areaGenerator = d3.area()
        .x0(d => d.x0)
        .x1(d => d.x1)
        .y(d => d.y)
        .curve(d3.curveBasis);

    keys.forEach((key, keyIdx) => {
        const points = data.map((d, i) => {
            const val = +d[key];
            const halfWidth = maxWidth * (val / 100) / 2;
            const cx = xPositions[keyIdx];
            const cy = paddingTop + i * heightPerValue;
            return {
                x0: cx - halfWidth,
                x1: cx + halfWidth,
                y: cy
            };
        });

        svg.append("path")
            .datum(points)
            .attr("d", areaGenerator)
            .attr("fill", colors[key])
            .attr("opacity", 0.6);
    });

    // 음악명 텍스트들 그룹으로 묶기
    const labelsGroup = svg.append("g").attr("class", "labels");

    data.forEach((d, i) => {
        labelsGroup.append("text")
            .attr("x", 10)
            .attr("y", paddingTop + i * heightPerValue + 5)
            .attr("font-size", "10px")
            .attr("fill", "#555")
            .attr("data-index", i)
            .text(d["음악명"] || d["음악명"] || "");
    });

    // 가로선 추가 (처음에는 숨김)
    const hoverLine = svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("stroke", "#999")
        .attr("stroke-width", 1)
        .attr("opacity", 0);

    // 투명한 사각형을 덮어 이벤트 처리용으로 만듦
    svg.append("rect")
        .attr("x", 0)
        .attr("y", paddingTop)
        .attr("width", width)
        .attr("height", height - paddingTop)
        .attr("fill", "transparent")
        .on("mousemove", function(event) {
            const [_, mouseY] = d3.pointer(event);
            // hover한 데이터 인덱스 계산
            let idx = Math.floor((mouseY - paddingTop + heightPerValue / 2) / heightPerValue);
            if (idx < 0) idx = 0;
            if (idx >= data.length) idx = data.length - 1;

            const yPos = paddingTop + idx * heightPerValue + 5;

            // 가로선 위치 업데이트 및 표시
            hoverLine
                .attr("y1", yPos)
                .attr("y2", yPos)
                .attr("opacity", 1);

            // 모든 텍스트 기본 스타일로 리셋
            labelsGroup.selectAll("text")
                .attr("font-weight", "normal")
                .attr("fill", "#555");

            // 해당 인덱스 텍스트 볼드, 색 변경
            labelsGroup.selectAll("text")
                .filter(function() {
                    return +d3.select(this).attr("data-index") === idx;
                })
                .attr("font-weight", "bold")
                .attr("fill", "#000");
        })
        .on("mouseout", function() {
            // 가로선 숨기기
            hoverLine.attr("opacity", 0);

            // 텍스트 스타일 원복
            labelsGroup.selectAll("text")
                .attr("font-weight", "normal")
                .attr("fill", "#555");
        });

    // 축 역할 텍스트 (key명)
    keys.forEach((key, i) => {
        svg.append("text")
            .attr("x", xPositions[i])
            .attr("y", paddingTop - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "#333")
            .text(key);
    });
});
