// 상세 패널 로드 및 초기화
loadDetailPanel().then(() => {
  // CSV 데이터 로드
  d3.csv("../music-data.csv").then(function (data) {
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
  }).catch(function (error) {
    console.error("CSV 로드 오류:", error);
  });
});

function drawYearCircles(data) {
  // 1. 모든 년도 찾기 (빈 년도 포함)
  const minYear = d3.min(data, d => d.year);
  const maxYear = d3.max(data, d => d.year);
  const allYears = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  // 2. 년도별 데이터 그룹화
  const yearMap = new Map();
  allYears.forEach(year => yearMap.set(year, []));
  data.forEach(d => {
    if (yearMap.has(d.year)) {
      yearMap.get(d.year).push(d);
    }
  });

  // 3. SVG 영역 크기 계산
  const rowHeight = 70;
  const margin = { left: 70, top: 30, right: 20, bottom: 30 };
  const circleRadius = 28;
  const circleGap = circleRadius * 2 + 10; // 원 사이 간격

  // 4. 교차 배치 좌표 계산 (홀수/짝수 행 교차)
  // 4. 한 행에 일렬로 배치 (col: 0,1,2,...)
  const yearRows = [];
  allYears.forEach((year, rowIdx) => {
    const items = yearMap.get(year);
    const circles = [];
    if (items && items.length > 0) {
      items.forEach((item, col) => {
        circles.push({
          ...item,
          col: col,
          row: rowIdx,
          x: col * circleGap
        });
      });
    }
    yearRows.push({
      year,
      circles,
      row: rowIdx
    });
  });


  // 5. SVG 생성
  const maxCols = d3.max(yearRows, yr =>
    yr.circles.length > 0 ? d3.max(yr.circles, c => c.col) + 1 : 0
  );

  const width = margin.left + margin.right + maxCols * circleGap + circleRadius * 2;
  const height = margin.top + margin.bottom + allYears.length * rowHeight;

  const svg = d3.select("#year-circles")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // 6. 년도 레이블 (모든 년도 표시)
  // 년도 레이블 조건 함수
  function isLabelYear(year, minYear, maxYear) {
    return year === minYear || year === maxYear || year % 1 === 0;
  }

  // 6. 년도 레이블 (5단위, 처음, 마지막만)
  svg.selectAll(".year-label")
    .data(yearRows.filter(d => isLabelYear(d.year, minYear, maxYear)))
    .enter()
    .append("text")
    .attr("class", "year-label")
    .attr("x", margin.left - 10)
    .attr("y", d => margin.top + d.row * rowHeight + rowHeight / 2)
    .text(d => d.year);


  // 7. 원 그룹 그리기 (부채꼴로)
  yearRows.forEach(yr => {
    if (yr.circles.length > 0) {
      svg.selectAll(".circle-group-" + yr.year)
        .data(yr.circles)
        .enter()
        .append("g")
        .attr("class", "circle-group")
        .attr("transform", d =>
          `translate(${margin.left + d.x + circleRadius},${margin.top + yr.row * rowHeight + rowHeight / 2})`
        )
        .on("mouseover", function (event, d) {
          // hover 시 상세 패널 업데이트
          updateDetailPanel(d, colors);
          d3.select(this).raise().select("circle.outer").attr("stroke", "#333").attr("stroke-width", 2);
        })
        .on("mouseout", function () {
          d3.select(this).select("circle.outer").attr("stroke", "none");
        })
        .each(function (d) {
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
    }
  });
}
