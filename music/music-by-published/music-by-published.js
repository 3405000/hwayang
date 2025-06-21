// CSV 데이터 로드
d3.csv("../music-data.csv").then(function(data) {
  // 데이터 전처리
  const processedData = data.map(d => ({
    name: d["음악명"],
    artist: d["아티스트"],
    year: +d["발매일"],
    time: `${d["날짜"]} ${d["시간"]}`,
    attributes: {
      Energy: +d.Energy,
      Danceability: +d.Danceability,
      Happiness: +d.Happiness,
      Acousticness: +d.Acousticness,
      Instrumentalness: +d.Instrumentalness,
      Liveness: +d.Liveness
    }
  }));

  drawYearCircles(processedData);
}).catch(function(error) {
  console.error("CSV 로드 오류:", error);
});

function drawYearCircles(data) {
  // 1. 년도별로 그룹화, 정렬
  const yearMap = d3.group(data, d => d.year);
  const years = Array.from(yearMap.keys()).sort((a, b) => a - b);

  // 2. SVG 영역 크기 계산
  const rowHeight = 70;
  const margin = { left: 70, top: 30, right: 20, bottom: 30 };
  const circleRadius = 28;
  const overlapRatio = 2/3; // 2/3만큼 겹치게
  const circleGap = circleRadius * 2 * (1 - overlapRatio) + 2; // +2는 미세 여유

  // 3. 각 년도별로 원 배치 좌표 계산 (충돌 방지)
  const yearRows = [];
  years.forEach((year, rowIdx) => {
    const items = yearMap.get(year);
    const circles = [];
    items.forEach(item => {
      let col = 0;
      while (circles.some(c =>
        Math.abs(col - c.col) < 1 &&
        Math.abs(rowIdx - c.row) < 2 &&
        Math.abs((col - c.col) * circleGap) < circleRadius * 2
      )) {
        col++;
      }
      circles.push({ ...item, col, row: rowIdx });
    });
    yearRows.push({ year, circles });
  });

  // 4. SVG 생성
  const maxCols = d3.max(yearRows, yr => d3.max(yr.circles, c => c.col)) + 1;
  const width = margin.left + margin.right + maxCols * circleGap + circleRadius * 2;
  const height = margin.top + margin.bottom + years.length * rowHeight;

  const svg = d3.select("#year-circles")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // 5. 년도 레이블
  svg.selectAll(".year-label")
    .data(yearRows)
    .enter()
    .append("text")
    .attr("class", "year-label")
    .attr("x", margin.left - 10)
    .attr("y", (d, i) => margin.top + i * rowHeight + rowHeight / 2)
    .text(d => d.year);

  // 6. 원 그룹 그리기 (부채꼴로)
  yearRows.forEach((yr, rowIdx) => {
    svg.selectAll(".circle-group-" + yr.year)
      .data(yr.circles)
      .enter()
      .append("g")
      .attr("class", "circle-group")
      .attr("transform", d =>
        `translate(${margin.left + d.col * circleGap + circleRadius},${margin.top + rowIdx * rowHeight + rowHeight / 2})`
      )
      .on("mouseover", function(event, d) {
        updateDetailPanel(d);
        d3.select(this).raise().select("circle.outer").attr("stroke", "#333").attr("stroke-width", 2);
      })
      .on("mouseout", function() {
        d3.select(this).select("circle.outer").attr("stroke", "none");
      })
      .each(function(d) {
        // 바깥 검정 원
        d3.select(this).append("circle")
          .attr("class", "outer")
          .attr("r", circleRadius)
          .attr("fill", "black")
          .attr("stroke", "none");
        // 6개 부채꼴로 속성 시각화
        const attributes = ["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"];
        const maxAngle = (60 * Math.PI) / 180;
        attributes.forEach((attr, i) => {
          const value = d.attributes[attr];
          const startAngle = i * maxAngle;
          const endAngle = startAngle + (value / 100) * maxAngle;
          const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(circleRadius)
            .startAngle(startAngle)
            .endAngle(endAngle);
          d3.select(this).append('path')
            .attr('d', arc)
            .attr('fill', colors[attr])
            .attr('opacity', 0.8);
        });
        // 흰색 중심 원
        d3.select(this).append("circle")
          .attr("r", circleRadius / 3.5)
          .attr("fill", "white");
      });
  });
}

// 상세 패널 업데이트 함수
function updateDetailPanel(data) {
    const svg = d3.select('#detail-svg');
    svg.selectAll('*').remove();

    const width = +svg.attr('width');
    const height = +svg.attr('height');
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2;

    // 블러 필터 추가 (상세 패널 전용)
    const defs = svg.append("defs");
    const blurFilter = defs.append("filter")
        .attr("id", "detail-blur")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
    blurFilter.append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", "5");

    svg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', radius)
        .attr('fill', 'black');

    const attributes = ["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"];
    const maxAngle = (60 * Math.PI) / 180;

    attributes.forEach((attr, i) => {
        const value = data.attributes[attr];
        const startAngle = i * maxAngle;
        const endAngle = startAngle + (value / 100) * maxAngle;
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
            .startAngle(startAngle)
            .endAngle(endAngle);

        svg.append('path')
            .attr('d', arc)
            .attr('transform', `translate(${centerX},${centerY})`)
            .attr('fill', colors[attr])
            .attr('filter', "url(#detail-blur)")
            .attr('opacity', 0.9);
    });

    svg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', radius / 4)
        .attr('fill', 'white');

    const infoDiv = d3.select('#detail-info');
    let infoText = `<strong>${data.name}</strong><br>`;
    infoText += `<em>${data.artist}</em><br><br>`;
    attributes.forEach(attr => {
        infoText += `<strong>${attr}:</strong> ${data.attributes[attr]}<br>`;
    });
    infoText += `<br><strong>시간:</strong> ${data.time}`;
    infoDiv.html(infoText);
}
