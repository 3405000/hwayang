// CSV 데이터 로드
d3.csv("../music-data.csv").then(function(data) {
  // 데이터 전처리
  const processedData = data.map(d => ({
    name: d["음악명"],
    artist: d["아티스트"],
    time: `${d["날짜"]} ${d["시간"]}`, // 날짜와 시간 결합
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
}).catch(function(error) {
  console.error("CSV 로드 오류:", error);
});

// 부채꼴 시각화 생성 함수
function createRadialVisualization(data) {
  const width = 800;
  const height = 800;
  const radius = Math.min(width, height) / 2;
  
  // 중심 원 반지름 (전체 반지름의 1/4)
  const centerRadius = radius * 0.25;
  
  // 속성 영역의 최대 반지름 (3/4 사용)
  const maxAttributeRadius = radius * 0.75;
  
  // SVG 생성
  const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width/2},${height/2})`);

  // 부채꼴 각도 계산 (각 곡에 균등하게 분배)
  const pie = d3.pie()
    .value(1)
    .sort(null)
    .startAngle(-Math.PI / 2) // 12시 방향에서 시작
    .endAngle(Math.PI * 1.5); // 시계 방향으로 완전한 원

  const arcs = pie(data);

  // 속성 배열
  const attributes = ["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"];

  // 부채꼴 생성 그룹
  const sector = svg.selectAll(".sector")
    .data(arcs)
    .enter()
    .append("g")
    .attr("class", "sector")
    .on("mouseover", function(event, d) {
      // 상세 패널 업데이트
      updateDetailPanel(d.data);
    })
    .on("mouseout", function() {
      // 툴팁 숨기기
      d3.select("#tooltip").style("opacity", 0);
    });

  // 각 부채꼴에 대해 속성값 총합 계산 및 비율에 따른 반지름 분할
  sector.each(function(d) {
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
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("opacity", 0.8)
        .on("mouseover", function(event) {
          // 툴팁 표시
          d3.select("#tooltip")
            .style("opacity", 0.9)
            .html(`
              <strong>${d.data.name}</strong><br>
              <em>${d.data.artist}</em><br>
              ${attr}: ${value}%
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
          
          // 현재 호 강조
          d3.select(this)
            .attr("opacity", 1)
            .attr("stroke-width", 2);
        })
        .on("mouseout", function() {
          // 호 스타일 복원
          d3.select(this)
            .attr("opacity", 0.8)
            .attr("stroke-width", 1);
        });
      
      currentRadius += bandLength;
    });
  });

  // 중심 원 그리기
  svg.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", centerRadius)
    .attr("fill", "white")
    .attr("stroke", "#333")
    .attr("stroke-width", 2);

  // 곡명 레이블 추가 (중심 원 위에)
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
    .text(d => d.data.name)
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

  // 검정 배경 원 그리기
  svg.append('circle')
    .attr('cx', centerX)
    .attr('cy', centerY)
    .attr('r', radius)
    .attr('fill', 'black');

  // 속성 배열
  const attributes = ["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"];
  const maxAngle = (60 * Math.PI) / 180; // 60도 (라디안)

  // 각 속성별 부채꼴 그리기
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
      .attr('opacity', 0.8)
      .attr('stroke', 'white')
      .attr('stroke-width', 1);
  });

  // 흰색 중심 원 그리기 (전체의 1/4 크기)
  svg.append('circle')
    .attr('cx', centerX)
    .attr('cy', centerY)
    .attr('r', radius / 4)
    .attr('fill', 'white');

  // 텍스트 정보 업데이트
  const infoDiv = d3.select('#detail-info');
  let infoText = `<strong>${data.name}</strong><br>`;
  infoText += `<em>${data.artist}</em><br><br>`;
  
  // 속성 값 추가
  attributes.forEach(attr => {
    infoText += `<strong>${attr}:</strong> ${data.attributes[attr]}<br>`;
  });
  
  // 시간 정보 추가
  infoText += `<br><strong>시간:</strong> ${data.time}`;
  
  infoDiv.html(infoText);
}
