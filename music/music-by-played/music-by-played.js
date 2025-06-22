loadDetailPanel().then(() => {
  // CSV 데이터 로드
  d3.csv("../music-data.csv").then(function (data) {
      // 데이터 전처리
      const processedData = data.map(d => ({
          name: d["음악명"],
          artist: d["아티스트"],
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
  
      // 시각화 생성
      createRadialVisualization(processedData);
  }).catch(function (error) {
      console.error("CSV 로드 오류:", error);
  });
  
  // 부채꼴 시각화 생성 함수
  function createRadialVisualization(data) {
      const width = 800;
      const height = 800;
      const radius = Math.min(width, height) / 2;
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
          .startAngle(-Math.PI / 2)
          .endAngle(Math.PI * 1.5);
  
      const arcs = pie(data);
  
      const attributes = ["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"];
  
      const sector = svg.selectAll(".sector")
          .data(arcs)
          .enter()
          .append("g")
          .attr("class", "sector")
          .on("mouseover", function (event, d) {
              // 데이터 복제하여 전달 (참조 문제 방지)
              const dataCopy = JSON.parse(JSON.stringify(d.data));
              updateDetailPanel(dataCopy, colors);
          })
          .on("mouseout", function () {
              d3.select("#tooltip").style("opacity", 0);
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
                      d3.select("#tooltip")
                          .style("opacity", 0.9)
                          .html(`
                <strong>${d.data.name}</strong><br>
                <em>${d.data.artist}</em><br>
                ${attr}: ${value}%
              `)
                          .style("left", (event.pageX + 10) + "px")
                          .style("top", (event.pageY - 28) + "px");
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
  
      svg.append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", centerRadius)
          .attr("fill", "white")
          .attr("stroke", "#333")
          .attr("stroke-width", 2);
  
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
});
