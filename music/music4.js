d3.csv("music-data.csv").then(function (data) {
    const width = 1000;
    const heightPerValue = 20;
    const paddingTop = 30;
    const paddingSides = 30;
    const maxWidth = 100;
    const keys = ["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"];
    const colors = {
        Energy: "#F94144",
        Danceability: "#F3722C",
        Happiness: "#F9C74F",
        Acousticness: "#90BE6D",
        Instrumentalness: "#43AA8B",
        Liveness: "#577590"
    };

    const height = data.length * heightPerValue + paddingTop * 2;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // 1. 각 행마다 값 내림차순 정렬
    const rowData = data.map((d, i) => {
        const values = keys.map(k => ({
            key: k,
            value: +d[k],
            originalIndex: i
        }));

        values.sort((a, b) => b.value - a.value);

        return {
            index: i,
            name: d["음악명 - 아티스트"] || d["음악명"] || "",
            values: values
        };
    });

    // 2. 각 도형의 좌표 계산
    const colSpacing = maxWidth + 30;
    rowData.forEach((row, i) => {
        row.values.forEach((d, j) => {
            const halfWidth = maxWidth * (d.value / 100) / 2;
            const cx = paddingSides + j * colSpacing;
            const cy = paddingTop + i * heightPerValue;

            d.x0 = cx - halfWidth;
            d.x1 = cx + halfWidth;
            d.y = cy;
        });
    });

    // 3. 항목별로 선을 그리기 위한 구조 생성
    const keyTracks = {};
    keys.forEach(k => keyTracks[k] = []);

    rowData.forEach(row => {
        row.values.forEach((d, colIdx) => {
            keyTracks[d.key].push({
                x: paddingSides + colIdx * colSpacing,
                y: paddingTop + row.index * heightPerValue
            });
        });
    });

    // 4. area generator
    const areaGenerator = d3.area()
        .x0(d => d.x0)
        .x1(d => d.x1)
        .y(d => d.y)
        .curve(d3.curveBasis);

    // 5. 항목별 흐름선 (line) 그리기
    const line = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveMonotoneY);

    keys.forEach(k => {
        svg.append("path")
            .datum(keyTracks[k])
            .attr("fill", "none")
            .attr("stroke", colors[k])
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.8)
            .attr("d", line);
    });

    // 6. 각 행의 도형 그리기
    rowData.forEach(row => {
        row.values.forEach(d => {
            svg.append("path")
                .datum([d])
                .attr("d", areaGenerator)
                .attr("fill", colors[d.key])
                .attr("opacity", 0.6);
        });
    });

    // 7. 텍스트(음악명) 표시
    const labelsGroup = svg.append("g").attr("class", "labels");

    rowData.forEach(row => {
        labelsGroup.append("text")
            .attr("x", 10)
            .attr("y", paddingTop + row.index * heightPerValue + 5)
            .attr("font-size", "10px")
            .attr("fill", "#555")
            .attr("data-index", row.index)
            .text(row.name);
    });

    // 8. hover용 가로선 + 텍스트 강조
    const hoverLine = svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("stroke", "#999")
        .attr("stroke-width", 1)
        .attr("opacity", 0);

    svg.append("rect")
        .attr("x", 0)
        .attr("y", paddingTop)
        .attr("width", width)
        .attr("height", height - paddingTop)
        .attr("fill", "transparent")
        .on("mousemove", function (event) {
            const [_, mouseY] = d3.pointer(event);
            let idx = Math.floor((mouseY - paddingTop + heightPerValue / 2) / heightPerValue);
            if (idx < 0) idx = 0;
            if (idx >= data.length) idx = data.length - 1;

            const yPos = paddingTop + idx * heightPerValue + 5;

            hoverLine
                .attr("y1", yPos)
                .attr("y2", yPos)
                .attr("opacity", 1);

            labelsGroup.selectAll("text")
                .attr("font-weight", "normal")
                .attr("fill", "#555");

            labelsGroup.selectAll("text")
                .filter(function () {
                    return +d3.select(this).attr("data-index") === idx;
                })
                .attr("font-weight", "bold")
                .attr("fill", "#000");
        })
        .on("mouseout", function () {
            hoverLine.attr("opacity", 0);
            labelsGroup.selectAll("text")
                .attr("font-weight", "normal")
                .attr("fill", "#555");
        });

    // 9. 열 제목 (동적으로 가장 처음 나타나는 key명 출력)
    const firstRowKeys = rowData[0].values.map(d => d.key);
    firstRowKeys.forEach((key, i) => {
        svg.append("text")
            .attr("x", paddingSides + i * colSpacing)
            .attr("y", paddingTop - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "#333")
            .text(key);
    });
});