// 전역 데이터 저장소
let globalData = [];

// CSV 데이터 로드
d3.csv("music-data.csv").then(function(csvData) {
  // 데이터 파싱 및 저장
  globalData = csvData.map(d => ({
    name: d["음악명 - 아티스트"] || d["음악명"] || "",
    artist: d["아티스트"] || "",
    Energy: +d.Energy,
    Danceability: +d.Danceability,
    Happiness: +d.Happiness,
    Acousticness: +d.Acousticness,
    Instrumentalness: +d.Instrumentalness,
    Liveness: +d.Liveness
  }));

  // 첫 번째 시각화 초기화
  showCircles('Energy');

  // 두 번째 시각화 생성
  drawAreaChart();
}).catch(function(error) {
  console.error("CSV 로드 오류:", error);
});

// 원형 차트 표시 함수
function showCircles(attribute) {
  if (!globalData.length) return;

  // 버튼 active 처리
  document.querySelectorAll('#buttons button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('#buttons button').forEach(btn => {
    if (btn.textContent === attribute) btn.classList.add('active');
  });

  const container = document.getElementById('circle-container');
  container.innerHTML = '';
  const centerX = container.clientWidth / 2;
  const centerY = container.clientHeight / 2;

  // 값의 최대값 기준으로 크기 보정
  const maxValue = Math.max(...globalData.map(d => d[attribute]));
  const minSize = 0, maxSize = 50;

  // 노드 데이터 생성
  const nodes = globalData.map((d, i) => {
    const value = d[attribute];
    const size = minSize + (value / maxValue) * (maxSize - minSize);
    return {
      id: i,
      r: size / 2,
      x: centerX + (Math.random() - 0.5) * 200,
      y: centerY + (Math.random() - 0.5) * 200,
      data: d
    };
  });

  // 원 생성
  const circles = d3.select(container)
    .selectAll(".circle")
    .data(nodes)
    .enter()
    .append("div")
    .attr("class", "circle")
    .style("width", d => `${d.r * 2}px`)
    .style("height", d => `${d.r * 2}px`)
    .style("background", colors[attribute])
    .each(function(d) {
      const circle = d3.select(this);
      circle
        .attr('data-name', d.data.name)
        .attr('data-artist', d.data.artist)
        .attr('data-value', d.data[attribute]);
    });

  // 툴팁 이벤트 연결 (기존 이벤트 핸들러 유지)

  // 충돌 방지 시뮬레이션
  const simulation = d3.forceSimulation(nodes)
    .force("collide", d3.forceCollide().radius(d => d.r + 1).iterations(5))
    .force("center", d3.forceCenter(centerX, centerY))
    .force("charge", d3.forceManyBody().strength(5))
    .alphaDecay(0.05)
    .on("tick", () => {
      circles.each(function(d) {
        d3.select(this)
          .style("left", `${d.x - d.r}px`)
          .style("top", `${d.y - d.r}px`);
      });
    });
}


// 영역 차트 생성 함수
function drawAreaChart() {
  if (!globalData.length) return;

  const keys = ["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"];
  const width = 1000;
  const heightPerValue = 50;
  const paddingTop = 30;
  const paddingSides = 30;
  const maxWidth = 100;
  const height = globalData.length * heightPerValue + paddingTop * 2;

  // SVG 컨테이너 생성
  const svg = d3.select("#area-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "#fff")
    .style("border-radius", "10px");

  // 각 행마다 값 내림차순 정렬
  const rowData = globalData.map((d, i) => {
    const values = keys.map(k => ({
      key: k,
      value: d[k],
      originalIndex: i
    }));

    values.sort((a, b) => b.value - a.value);
    return {
      index: i,
      name: d.name,
      values: values
    };
  });

  // 각 도형의 좌표 계산
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

  // 항목별로 선을 그리기 위한 구조 생성
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

  // area generator
  const areaGenerator = d3.area()
    .x0(d => d.x0)
    .x1(d => d.x1)
    .y(d => d.y)
    .curve(d3.curveBasis);

  // 항목별 흐름선 (line) 그리기
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

  // 각 행의 도형 그리기
  rowData.forEach(row => {
    row.values.forEach(d => {
      svg.append("path")
        .datum([d])
        .attr("d", areaGenerator)
        .attr("fill", colors[d.key])
        .attr("opacity", 0.6);
    });
  });

  // 텍스트(음악명) 표시
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

  // hover용 가로선 + 텍스트 강조
  const hoverLine = svg.append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("stroke", "#999")
    .attr("stroke-width", 1)
    .attr("opacity", 0);

  // hover 시 원 표시를 위한 그룹 추가
  const hoverCirclesGroup = svg.append("g")
    .attr("class", "hover-circles")
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
      if (idx >= globalData.length) idx = globalData.length - 1;

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

      // 1) hoverCirclesGroup 초기화
      hoverCirclesGroup.selectAll("circle").remove();

      // 2) 해당 행의 값 가져오기
      const hoveredRow = rowData[idx];

      // 3) 각 항목별 원 그리기
      hoveredRow.values.forEach((d, colIdx) => {
        const radius = (maxWidth * (d.value / 100)) / 2;
        const cx = paddingSides + colIdx * colSpacing;
        const cy = yPos;

        hoverCirclesGroup.append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", radius)
          .attr("fill", colors[d.key])
          .attr("opacity", 0.5);
      });

      // 4) 원 그룹 보이기
      hoverCirclesGroup.attr("opacity", 1);
    })
    .on("mouseout", function () {
      hoverLine.attr("opacity", 0);
      labelsGroup.selectAll("text")
        .attr("font-weight", "normal")
        .attr("fill", "#555");
      hoverCirclesGroup.attr("opacity", 0);
      hoverCirclesGroup.selectAll("circle").remove();
    });

  // 열 제목 표시
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
}
