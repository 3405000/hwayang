d3.csv("music-data.csv").then(function (data) {
    const width = 1200;
    const hexSize = 60;
    const radius = 35;
    const padding = 10;

    const keys = ["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"];
    const angles = keys.map((_, i) => (Math.PI * 2 / keys.length) * i);
    const rotation = Math.PI / 6;

    const scaleFactor = 1.3;
    const bigRadius = radius * scaleFactor;

    const grouped = d3.group(data, d => {
        const hour = +d["시간"].split(":")[0];
        return `${hour}:00`;
    });
    const rows = Array.from(grouped.entries());
    const svgHeight = rows.length * (hexSize + padding) + 50;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", svgHeight);

    const defs = svg.append("defs");

    defs.append("filter")
        .attr("id", "blur")
        .append("feGaussianBlur")
        .attr("stdDeviation", 5);

    rows.forEach(([hour, tracks], rowIdx) => {
        tracks.forEach((track, colIdx) => {
            const cx = padding + colIdx * (hexSize + padding) + radius;
            const cy = padding + rowIdx * (hexSize + padding) + radius;

            const values = keys.map(k => +track[k]);
            const hexPoints = values.map((v, i) => {
                const r = Math.min((v / 100) * radius * scaleFactor, radius);
                const ang = angles[i];
                return [
                    cx + r * Math.cos(ang - Math.PI / 2),
                    cy + r * Math.sin(ang - Math.PI / 2)
                ];
            });

            const clipId = `hex-clip-${rowIdx}-${colIdx}`;
            defs.append("clipPath")
                .attr("id", clipId)
                .append("polygon")
                .attr("points", hexPoints.map(p => p.join(",")).join(" "));

            const group = svg.append("g").attr("cursor", "pointer");

            keys.forEach((key, i) => {
                const color = colors[key];
                const ang1 = angles[i] + rotation;
                const ang2 = angles[(i + 1) % keys.length] + rotation;

                // 값에 따라 조절하지 않고 bigRadius 고정 사용
                const x1 = cx + bigRadius * Math.cos(ang1 - Math.PI / 2);
                const y1 = cy + bigRadius * Math.sin(ang1 - Math.PI / 2);
                const x2 = cx + bigRadius * Math.cos(ang2 - Math.PI / 2);
                const y2 = cy + bigRadius * Math.sin(ang2 - Math.PI / 2);

                group.append("path")
                    .attr("d", `M${cx},${cy} L${x1},${y1} L${x2},${y2}Z`)
                    .attr("fill", color)
                    .attr("filter", "url(#blur)")
                    .attr("clip-path", `url(#${clipId})`);
            });

            group.append("polygon")
                .attr("points", hexPoints.map(p => p.join(",")).join(" "))
                .attr("fill", "none")
                .attr("stroke", "#111")
                .attr("stroke-width", 1);

            group.on("click", () => showDetail(track));
        });

        svg.append("text")
            .attr("x", 10)
            .attr("y", padding + rowIdx * (hexSize + padding) + 5)
            .text(hour)
            .attr("font-size", "12px")
            .attr("fill", "#333");
    });

    function showDetail(track) {
        const detailSvg = d3.select("#detail-svg");
        detailSvg.selectAll("*").remove();

        const detailDiv = d3.select("#detail-values");
        detailDiv.html("");

        const detailW = 280, detailH = 280;
        const cx = detailW / 2, cy = detailH / 2;
        const detailR = 100;
        const scaleFactor = 1.3;
        const keys = ["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"];
        const angles = keys.map((_, i) => (Math.PI * 2 / keys.length) * i);
        const rotation = Math.PI / 6;

        // defs 초기화 및 clipPath 설정
        const defsD = detailSvg.append("defs");
        defsD.append("filter")
            .attr("id", "detail-blur")
            .append("feGaussianBlur")
            .attr("stdDeviation", 13);

        const vals = keys.map(k => +track[k]);
        // 점 좌표 계산 (각 값에 비례, detailR 및 scaleFactor 적용)
        const points = vals.map((v, i) => {
            // 값에 따른 반경, 최대 detailR 넘지 않도록 제한
            const r = Math.min((v / 100) * detailR * scaleFactor, detailR);
            const ang = angles[i] + rotation;
            return [
                cx + r * Math.cos(ang - Math.PI / 2),
                cy + r * Math.sin(ang - Math.PI / 2)
            ];
        });

        const clipDetailId = "detail-clip-" + Math.random().toString(36).slice(2, 10);

        defsD.append("clipPath")
            .attr("id", clipDetailId)
            .append("polygon")
            .attr("points", points.map(p => p.join(",")).join(" "));

        // 색깔 부드러운 영역 생성 (6각형을 채우는 각 삼각형)
        const group = detailSvg.append("g");
        keys.forEach((key, i) => {
            const color = colors[key];
            const ang1 = angles[i] + rotation;
            const ang2 = angles[(i + 1) % keys.length] + rotation;

            // 두 꼭짓점 좌표 (최대 반경 detailR 고정)
            const x1 = cx + detailR * Math.cos(ang1 - Math.PI / 2);
            const y1 = cy + detailR * Math.sin(ang1 - Math.PI / 2);
            const x2 = cx + detailR * Math.cos(ang2 - Math.PI / 2);
            const y2 = cy + detailR * Math.sin(ang2 - Math.PI / 2);

            group.append("path")
                .attr("d", `M${cx},${cy} L${x1},${y1} L${x2},${y2}Z`)
                .attr("fill", color)
                .attr("filter", "url(#detail-blur)")
                .attr("clip-path", `url(#${clipDetailId})`);
        });

        // 외곽선 폴리곤
        detailSvg.append("polygon")
            .attr("points", points.map(p => p.join(",")).join(" "))
            .attr("fill", "none")
            .attr("stroke", "#111")
            .attr("stroke-width", 2);

        // 기준 원형 점선
        detailSvg.append("circle")
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("r", detailR)
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("stroke-dasharray", "3 2");

        // 텍스트 정보 표시
        detailDiv.append("div").html(`<b>음악명:</b> ${track["음악명 - 아티스트"] || track["음악명"] || "정보 없음"}`);
        keys.forEach(k => {
            detailDiv.append("div").html(`${k}: ${track[k]}`);
        });
    }
});
