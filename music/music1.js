d3.csv("music-data.csv").then(function (data) {
    const width = 1200;
    const hexSize = 60;
    const radius = 35;
    const padding = 10;

    const keys = ["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"];
    const angles = keys.map((_, i) => (Math.PI * 2 / keys.length) * i);

    const rotation = Math.PI / 6;  // 30도 회전 각도

    // 시간대별로 그룹핑
    const grouped = d3.group(data, d => {
        const [hourStr] = d["시간"].split(":");
        const hour = parseInt(hourStr);
        return `${hour}:00`;
    });

    const rows = Array.from(grouped.entries()); // [[ '10:00', [track1, track2] ], [ '11:00', [...]]]

    const svgHeight = rows.length * (hexSize + padding) + 50;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", svgHeight);

    const defs = svg.append("defs");

    rows.forEach(([hour, tracks], rowIdx) => {
        tracks.forEach((track, colIdx) => {
            const cx = padding + colIdx * (hexSize + padding) + radius;
            const cy = padding + rowIdx * (hexSize + padding) + radius;

            const values = keys.map(key => +track[key]);
            const hexPoints = values.map((val, i) => {
                const r = (val / 100) * radius;
                const angle = angles[i];
                return [
                    cx + r * Math.cos(angle - Math.PI / 2),
                    cy + r * Math.sin(angle - Math.PI / 2)
                ];
            });

            const maskId = `hex-mask-${rowIdx}-${colIdx}`;

            // 마스크 정의
            defs.append("mask")
                .attr("id", maskId)
                .append("polygon")
                .attr("points", hexPoints.map(p => p.join(",")).join(" "))
                .attr("fill", "white");

            // 육각형 그룹을 묶는 <g>
            const group = svg.append("g")
                .attr("transform", `translate(0,0)`)
                .attr("cursor", "pointer");

            // 마스크를 적용한 그라데이션 그룹
            const gradGroup = group.append("g").attr("mask", `url(#${maskId})`);

            // 육각형 꼭짓점 방향으로 부채꼴 그라데이션 영역 생성 (30도 회전 적용)
            keys.forEach((key, i) => {
                const color = colors[key];

                // 30도 회전된 각도 사용
                const angle = angles[i] + rotation;
                const nextAngle = angles[(i + 1) % keys.length] + rotation;

                const x1 = cx + radius * Math.cos(angle - Math.PI / 2);
                const y1 = cy + radius * Math.sin(angle - Math.PI / 2);
                const x2 = cx + radius * Math.cos(nextAngle - Math.PI / 2);
                const y2 = cy + radius * Math.sin(nextAngle - Math.PI / 2);

                const gradId = `grad-${rowIdx}-${colIdx}-${i}`;

                const grad = defs.append("linearGradient")
                    .attr("id", gradId)
                    .attr("gradientUnits", "userSpaceOnUse")
                    .attr("x1", cx)
                    .attr("y1", cy)
                    .attr("x2", x1)
                    .attr("y2", y1);

                grad.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", "white");

                grad.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", color);

                gradGroup.append("path")
                    .attr("d", `M ${cx},${cy} L ${x1},${y1} L ${x2},${y2} Z`)
                    .attr("fill", `url(#${gradId})`);
            });

            // 육각형 테두리 (기존 각도 유지)
            group.append("polygon")
                .attr("points", hexPoints.map(p => p.join(",")).join(" "))
                .attr("fill", "none")
                .attr("stroke", "#111")
                .attr("stroke-width", 1);

            // 그룹 위치 이동
            group.attr("transform", `translate(0,0)`); // cx, cy 이미 계산에 반영됨

            // 클릭 이벤트 등록
            group.on("click", () => showDetail(track));
        });

        // 시간 라벨
        svg.append("text")
            .attr("x", 10)
            .attr("y", padding + rowIdx * (hexSize + padding) + 5)
            .text(hour)
            .attr("font-size", "12px")
            .attr("fill", "#333");
    });

    // 상세보기 함수
    function showDetail(track) {
        const detailSvg = d3.select("#detail-svg");
        detailSvg.selectAll("*").remove();

        const detailDiv = d3.select("#detail-values");
        detailDiv.html("");

        const detailWidth = 280;
        const detailHeight = 280;
        const cx = detailWidth / 2;
        const cy = detailHeight / 2;
        const detailRadius = 100;

        let defs = detailSvg.select("defs");
        if (!defs.empty()) defs.remove();
        defs = detailSvg.append("defs");

        const values = keys.map(k => +track[k]);
        const angles = keys.map((_, i) => (Math.PI * 2 / keys.length) * i);
        const rotation = Math.PI / 6;  // 30도 회전

        const hexPoints = values.map((val, i) => {
            const r = (val / 100) * detailRadius;
            const angle = angles[i];
            return [
                cx + r * Math.cos(angle - Math.PI / 2),
                cy + r * Math.sin(angle - Math.PI / 2)
            ];
        });

        const maskId = "detail-hex-mask";
        defs.append("mask")
            .attr("id", maskId)
            .append("polygon")
            .attr("points", hexPoints.map(p => p.join(",")).join(" "))
            .attr("fill", "white");

        const gradGroup = detailSvg.append("g").attr("mask", `url(#${maskId})`);

        keys.forEach((key, i) => {
            const color = colors[key];

            const angle = angles[i] + rotation;
            const nextAngle = angles[(i + 1) % keys.length] + rotation;

            const x1 = cx + detailRadius * Math.cos(angle - Math.PI / 2);
            const y1 = cy + detailRadius * Math.sin(angle - Math.PI / 2);
            const x2 = cx + detailRadius * Math.cos(nextAngle - Math.PI / 2);
            const y2 = cy + detailRadius * Math.sin(nextAngle - Math.PI / 2);

            const gradId = `detail-grad-${i}`;

            const grad = defs.append("linearGradient")
                .attr("id", gradId)
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", cx)
                .attr("y1", cy)
                .attr("x2", x1)
                .attr("y2", y1);

            grad.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "white")
                .attr("stop-opacity", 0);

            grad.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", color)
                .attr("stop-opacity", 1);

            gradGroup.append("path")
                .attr("d", `M ${cx},${cy} L ${x1},${y1} L ${x2},${y2} Z`)
                .attr("fill", `url(#${gradId})`);
        });

        detailSvg.append("polygon")
            .attr("points", hexPoints.map(p => p.join(",")).join(" "))
            .attr("fill", "none")
            .attr("stroke", "#111")
            .attr("stroke-width", 2);

        // 기준 원 추가
        detailSvg.append("circle")
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("r", detailRadius)
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("stroke-dasharray", "3 2");

        // 상세 데이터 값 표시
        detailDiv.append("div").html(`<b>음악명:</b> ${track["음악명 - 아티스트"] || track["음악명 - 아티스트"] || "정보 없음"}`);
        keys.forEach((key, i) => {
            detailDiv.append("div").html(`${key}: ${track[key]}`);
        });
    }
});
