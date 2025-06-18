d3.csv("music-data.csv").then(function (data) {
    const width = 1200;
    const hexSize = 60;
    const radius = 35;
    const padding = 10;

    const keys = ["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"];
    const colors = {
        Energy: "#F94144",
        Danceability: "#F3722C",
        Happiness: "#F9C74F",
        Acousticness: "#90BE6D",
        Instrumentalness: "#43AA8B",
        Liveness: "#577590"
    };

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

            // track 값 배열
            const values = keys.map(k => +track[k]);

            // clipPath 생성
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

            // drawHexagonShape 호출
            drawHexagonShape(group, {x: cx, y: cy}, values, radius, colors, keys, {
                rotation,
                applyBlurFilterId: "blur",
                clipPathId: clipId,
                showAverage: false
            });

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

        // defs 초기화 및 blur 필터
        const defsD = detailSvg.append("defs");
        defsD.append("filter")
            .attr("id", "detail-blur")
            .append("feGaussianBlur")
            .attr("stdDeviation", 13);

        const vals = keys.map(k => +track[k]);

        // clipPath는 drawHexagonShape 내부에서 처리 안하므로 직접 생성
        const points = vals.map((v, i) => {
            const r = Math.min((v / 100) * detailR * scaleFactor, detailR);
            const ang = angles[i];
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

        // detailSvg에 그룹 생성
        const group = detailSvg.append("g");

        // drawHexagonShape 호출, 평균값 도형 포함
        drawHexagonShape(group, {x: cx, y: cy}, vals, detailR, colors, keys, {
            rotation,
            applyBlurFilterId: "detail-blur",
            clipPathId: clipDetailId,
            showAverage: true,
            data // 전체 데이터 전달 (평균 계산용)
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

    function drawHexagonShape(svgGroup, center, values, radius, colors, keys, options = {}) {
        const rotation = options.rotation || 0;
        const applyBlurFilterId = options.applyBlurFilterId || null;
        const clipPathId = options.clipPathId || null;
        const showAverage = options.showAverage || false;
        const dataAll = options.data || null;

        const scaleFactor = 1.3;

        // 중심 좌표
        const cx = center.x;
        const cy = center.y;

        // 1) 값 기반 점 좌표 계산
        const anglesLocal = keys.map((_, i) => (Math.PI * 2 / keys.length) * i);
        const points = values.map((v, i) => {
            const r = Math.min((v / 100) * radius * scaleFactor, radius);
            const ang = anglesLocal[i] + rotation;
            return [
                cx + r * Math.cos(ang - Math.PI / 2),
                cy + r * Math.sin(ang - Math.PI / 2)
            ];
        });

        // 2) 색상 부드러운 영역 (6각형 삼각형들)
        keys.forEach((key, i) => {
            const color = colors[key];
            const ang1 = anglesLocal[i] + rotation;
            const ang2 = anglesLocal[(i + 1) % keys.length] + rotation;

            const x1 = cx + radius * Math.cos(ang1 - Math.PI / 2);
            const y1 = cy + radius * Math.sin(ang1 - Math.PI / 2);
            const x2 = cx + radius * Math.cos(ang2 - Math.PI / 2);
            const y2 = cy + radius * Math.sin(ang2 - Math.PI / 2);

            const path = svgGroup.append("path")
                .attr("d", `M${cx},${cy} L${x1},${y1} L${x2},${y2}Z`)
                .attr("fill", color);

            if (applyBlurFilterId) {
                path.attr("filter", `url(#${applyBlurFilterId})`);
            }

            if (clipPathId) {
                path.attr("clip-path", `url(#${clipPathId})`);
            }
        });

        // 3) 평균값 도형 선 추가 (옵션에 따라)
        if (showAverage && dataAll) {
            const avgVals = keys.map(k => d3.mean(dataAll, d => +d[k]));

            const avgPoints = avgVals.map((v, i) => {
                const r = Math.min((v / 100) * radius * scaleFactor, radius);
                const ang = anglesLocal[i] + rotation;
                return [
                    cx + r * Math.cos(ang - Math.PI / 2),
                    cy + r * Math.sin(ang - Math.PI / 2)
                ];
            });

            svgGroup.append("polygon")
                .attr("points", avgPoints.map(p => p.join(",")).join(" "))
                .attr("fill", "none")
                .attr("stroke", "#444")
                .attr("stroke-width", 1.5)
                .attr("stroke-dasharray", "4 2");
        }

        // 4) 외곽선 폴리곤 (옵션: clipPath 없으면 외곽선 직접 그림)
        if (!clipPathId) {
            svgGroup.append("polygon")
                .attr("points", points.map(p => p.join(",")).join(" "))
                .attr("fill", "none")
                .attr("stroke", "#111")
                .attr("stroke-width", 2);
        }

        return points;
    }
});
