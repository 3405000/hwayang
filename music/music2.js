d3.csv("music-data.csv").then(function (data) {
    const width = 1000;
    const padding = 30; // 좌우 여백
    const rowHeight = 80; // 각 행 높이
    const minRadius = 0;
    const maxRadius = 60;

    const keys = ["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"];

    const centerSpacing = (width - padding * 2) / keys.length;
    const svgHeight = data.length * rowHeight + 50;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", svgHeight);

    data.forEach((d, rowIdx) => {
        keys.forEach((key, i) => {
            const val = +d[key];
            const radius = minRadius + (val / 100) * (maxRadius - minRadius);

            const cx = padding + centerSpacing * i + centerSpacing / 2;
            const cy = rowHeight * rowIdx + rowHeight / 2;

            svg.append("circle")
                .attr("cx", cx)
                .attr("cy", cy)
                .attr("r", radius)
                .attr("fill", colors[key])  // 수정된 부분
                .attr("opacity", 0.5);      // 투명도 50%
        });

        svg.append("text")
            .attr("x", 10)
            .attr("y", rowHeight * rowIdx + rowHeight / 2 + 5)
            .text(d["음악명 - 아티스트"] || d["음악명"] || "")
            .attr("font-size", "12px")
            .attr("fill", "#333");
    });
});
