// 속성별 색상 설정
const colorScale = d3.scaleOrdinal()
  .domain(["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"])
  .range(["#FF6B6B", "#FFD166", "#06D6A0", "#118AB2", "#073B4C", "#EF476F"]);

// CSV 데이터 로드
d3.csv("../music-data.csv").then(function(data) {
  // 데이터 전처리
  const processedData = data.map(d => ({
    name: d["음악명"],
    artist: d["아티스트"],
    releaseDate: d["발매일"],
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
  
  // 속성 영역의 내부 반지름 (중심 원 바깥에서 시작)
  const innerRadius = centerRadius + 10;
  
  // 속성 영역의 최대 반지름
  const outerRadius = radius - 20;
  
  // 속성 영역 높이 (6개 속성 균등 분할)
  const bandHeight = (outerRadius - innerRadius) / 6;

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

  // 부채꼴 생성
  const sector = svg.selectAll(".sector")
    .data(arcs)
    .enter()
    .append("g")
    .attr("class", "sector");

  // 속성별 부채꼴 그리기
  const attributes = ["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"];
  
  attributes.forEach((attr, attrIndex) => {
    sector.append("path")
      .attr("class", "attribute-arc")
      .attr("data-attribute", attr)
      .attr("data-index", (d, i) => i)
      .attr("d", d => {
        const arc = d3.arc()
          .innerRadius(innerRadius + attrIndex * bandHeight)
          .outerRadius(innerRadius + attrIndex * bandHeight + 
                      (d.data.attributes[attr] / 100) * bandHeight)
          .startAngle(d.startAngle)
          .endAngle(d.endAngle);
        return arc(d);
      })
      .attr("fill", colorScale(attr))
      .attr("opacity", 0.8)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .on("mouseover", function(event, d) {
        // 툴팁 표시
        const tooltip = d3.select("#tooltip");
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(`
          <strong>${d.data.name}</strong><br>
          <em>${d.data.artist} (${d.data.releaseDate})</em><br>
          ${attr}: ${d.data.attributes[attr]}%
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
        
        // 현재 호 강조
        d3.select(this)
          .attr("opacity", 1)
          .attr("stroke-width", 2);
      })
      .on("mouseout", function() {
        // 툴팁 숨기기
        d3.select("#tooltip")
          .style("opacity", 0);
        
        // 호 스타일 복원
        d3.select(this)
          .attr("opacity", 0.8)
          .attr("stroke-width", 1);
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
      // 각 부채꼴의 중앙 각도 계산
      const angle = (d.startAngle + d.endAngle) / 2;
      // 레이블 위치 계산 (중심에서 약간 안쪽)
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
      .style("background-color", colorScale(attr));
    
    legendItem.append("div")
      .attr("class", "legend-label")
      .text(attr);
  });
}
