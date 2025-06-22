loadDetailPanel().then(() => {
    // CSV 데이터 로드
    d3.csv("../music-data.csv").then(function (data) {
        // 데이터 전처리
        const processedData = data.map((d, i) => ({
            name: d["음악명"],
            artist: d["아티스트"],
            time: `${d["날짜"]} ${d["시간"]}`,
            index: i + 1, // 1-based index
            total: data.length,
            attributes: {
                Energy: +d.Energy,
                Danceability: +d.Danceability,
                Happiness: +d.Happiness,
                Acousticness: +d.Acousticness,
                Instrumentalness: +d.Instrumentalness,
                Liveness: +d.Liveness
            }
        }));

        // 시각화 생성
        createRadialVisualization(processedData);
    }).catch(function (error) {
        console.error("CSV 로드 오류:", error);
    });

    // 부채꼴 시각화 생성 함수
    function createRadialVisualization(data) {
        const width = 900;
        const height = 900;
        const radius = 800 / 2;
        const centerRadius = radius * 0.25;
        const maxAttributeRadius = radius * 0.75;

        const svg = d3.select("#visualization")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const pie = d3.pie()
            .value(1)
            .sort(null)
            .startAngle(0)
            .endAngle(2 * Math.PI);


        const arcs = pie(data);

        const attributes = ["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"];

        const sector = svg.selectAll(".sector")
            .data(arcs)
            .enter()
            .append("g")
            .attr("class", "sector")
            .on("mouseover", function (event, d) {
                // hover 시 해당 음악의 모든 색상 부채꼴 진하게 표시
                updateDetailPanel(d.data, colors);
                d3.select(this).selectAll("path")
                    .attr("opacity", 1);

                // 가운데 텍스트 n/m 업데이트
                svg.select(".center-text-index")
                    .text(`${d.data.index} / ${d.data.total}`);
            })
            .on("mouseout", function () {
                // 툴팁 관련 코드 제거
                d3.select(this).selectAll("path")
                    .attr("opacity", 0.8);

                // 마우스 아웃 시 n/m을 비우거나 기본값으로
                svg.select(".center-text-index")
                    .text("");
            });

        sector.each(function (d) {
            const group = d3.select(this);
            const totalValue = attributes.reduce((sum, attr) => sum + d.data.attributes[attr], 0);
            let currentRadius = centerRadius;

            attributes.forEach(attr => {
                const value = d.data.attributes[attr];
                const proportion = value / totalValue;
                const bandLength = proportion * maxAttributeRadius;
                const arcGenerator = d3.arc()
                    .innerRadius(currentRadius)
                    .outerRadius(currentRadius + bandLength)
                    .startAngle(d.startAngle)
                    .endAngle(d.endAngle);

                group.append("path")
                    .attr("d", arcGenerator())
                    .attr("fill", colors[attr])
                    .attr("opacity", 0.8)
                    .on("mouseover", function (event) {
                        // 툴팁 관련 코드 제거
                        d3.select(this)
                            .attr("opacity", 1);
                    })
                    .on("mouseout", function () {
                        d3.select(this)
                            .attr("opacity", 0.8);
                    });

                currentRadius += bandLength;
            });
        });

        // 중앙 흰색 원
        svg.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", centerRadius)
            .attr("fill", "#fffffb")
            .attr("stroke", "#333")
            .attr("stroke-width", 2);

        // 가운데 텍스트 그룹 (한 번만 추가)
        const centerTextGroup = svg.append("g")
            .attr("class", "center-text-group")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle");

        // 花樣年華
        centerTextGroup.append("text")
            .attr("class", "center-text-main")
            .attr("y", -5)
            .attr("font-size", "36px")
            .attr("font-weight", "bold")
            .attr("fill", "#854F1C")
            .text("花樣年華");

        // track list
        centerTextGroup.append("text")
            .attr("class", "center-text-sub")
            .attr("y", 20)
            .attr("font-size", "20px")
            .attr("fill", "black")
            .text("track list");

        // n/m (초기에는 빈 값, hover 시 갱신)
        centerTextGroup.append("text")
            .attr("class", "center-text-index")
            .attr("y", 50)
            .attr("font-size", "18px")
            .attr("fill", "black")
            .text("");

        // 음악명 텍스트 제거
        sector.append("text")
            .attr("transform", d => {
                const angle = (d.startAngle + d.endAngle) / 2;
                const labelRadius = centerRadius * 0.7;
                const x = Math.sin(angle) * labelRadius;
                const y = -Math.cos(angle) * labelRadius;
                return `translate(${x}, ${y}) rotate(${angle * 180 / Math.PI - 90})`;
            })
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("font-size", "10px")
            .text("") // 음악명 제거
            .attr("fill", "#333")
            .attr("pointer-events", "none");

        // 범례 생성
        const legend = d3.select("#legend");
        attributes.forEach(attr => {
            const legendItem = legend.append("div")
                .attr("class", "legend-item");
            legendItem.append("div")
                .attr("class", "legend-color")
                .style("background-color", colors[attr]);
            legendItem.append("div")
                .attr("class", "legend-label")
                .text(attr);
        });

        // 원의 바깥쪽 반지름 (테두리에서 살짝 바깥)
        const labelRadius = maxAttributeRadius + 120; // maxAttributeRadius는 이미 위에서 정의됨

        // 각도와 라벨 정의 (라디안 단위)
        const angleLabels = [
            { angle: (-90 * Math.PI) / 180, label: '아침 →' },                 // 0도 (3시)
            { angle: (30 * Math.PI) / 180, label: '↙ 낮' }, // 120도
            { angle: (150 * Math.PI) / 180, label: '저녁 ↖ ' } // 240도
        ];

        // 각 위치에 텍스트 추가
        angleLabels.forEach(d => {
            const x = Math.cos(d.angle) * labelRadius;
            const y = Math.sin(d.angle) * labelRadius;
            svg.append('text')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .attr('font-size', '18px')
                .attr('fill', '#333')
                .attr('font-weight', 'bold')
                .text(d.label);
        });

    }
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

