d3.csv("../music-data.csv").then(function(csvData) {
  // 시각화에 사용할 항목 정의
  const visualFields = [
    "Energy", "Danceability", "Happiness", 
    "Acousticness", "Instrumentalness", "Liveness"
  ];

  // 아티스트 목록 추출 함수
  function getArtistList(data) {
    const set = new Set();
    data.forEach(d => {
      d["아티스트"].split(",")
        .map(a => a.trim())
        .forEach(a => set.add(a));
    });
    return Array.from(set);
  }

  // 반원 그리기용 arc path 생성 (좌/우)
  function describeArc(x, y, r, startAngle, endAngle) {
    const start = polarToCartesian(x, y, r, endAngle);
    const end = polarToCartesian(x, y, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
      "L", x, y,
      "Z"
    ].join(" ");
  }

  function polarToCartesian(cx, cy, r, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: cx + (r * Math.cos(angleInRadians)),
      y: cy + (r * Math.sin(angleInRadians))
    };
  }

  // 툴팁 표시 함수
  function showTooltip(html, x, y) {
    const tooltip = document.getElementById('tooltip');
    tooltip.innerHTML = html;
    tooltip.style.display = 'block';
    tooltip.style.left = (x + 18) + 'px';
    tooltip.style.top = (y - 18) + 'px';
  }

  function hideTooltip() {
    document.getElementById('tooltip').style.display = 'none';
  }

  // 원 시각화 그리기 함수
  function drawCircles(selectedArtist = null) {
    const container = d3.select("#circle-container");
    container.html("");

    const circleSize = 54;
    const circlesPerRow = 12;
    const svgWidth = circlesPerRow * (circleSize + 10);
    const svgHeight = Math.ceil(csvData.length / circlesPerRow) * (circleSize + 18);

    const svg = container.append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);

    csvData.forEach((d, i) => {
      const x = (i % circlesPerRow) * (circleSize + 10) + circleSize/2 + 2;
      const y = Math.floor(i / circlesPerRow) * (circleSize + 18) + circleSize/2 + 2;

      const artistArr = d["아티스트"].split(",").map(a => a.trim());
      const isActive = selectedArtist && artistArr.includes(selectedArtist);

      const values = visualFields.map(f => ({ 
        key: f, 
        value: +d[f] 
      }));
      
      values.sort((a, b) => b.value - a.value);
      const [first, second] = values.slice(0, 2);

      const g = svg.append("g")
        .attr("class", "music-circle")
        .attr("transform", `translate(${x},${y})`)
        .style("cursor", "pointer")
        .on("mouseover", (event) => {
          showTooltip(
            `<b>${d["음악명"]}</b><br/>${d["아티스트"]}<br/>
            <span style="font-size:13px;">
              Energy: ${d["Energy"]} / Danceability: ${d["Danceability"]}<br/>
              Happiness: ${d["Happiness"]} / Acousticness: ${d["Acousticness"]}<br/>
              Instrumentalness: ${d["Instrumentalness"]} / Liveness: ${d["Liveness"]}
            </span>`,
            event.pageX, event.pageY
          );
        })
        .on("mouseout", hideTooltip);

      if (isActive) {
        // 왼쪽 반원 (상위 1순위 값)
        g.append("path")
          .attr("d", describeArc(0, 0, circleSize/2, 90, 270))
          .attr("fill", colors[first.key])
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5);

        // 오른쪽 반원 (상위 2순위 값)
        g.append("path")
          .attr("d", describeArc(0, 0, circleSize/2, 270, 450))
          .attr("fill", colors[second.key])
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5);
      } else {
        // 회색 원 (비활성 상태)
        g.append("circle")
          .attr("r", circleSize/2)
          .attr("fill", "#bbb")
          .attr("class", "gray-circle");
      }
    });
  }

  // 아티스트 버튼 생성 함수
  function drawButtons(artistList, selectedArtist) {
    const btnContainer = d3.select("#buttons");
    btnContainer.html("");
    
    // 전체 버튼
    btnContainer.append("button")
      .attr("class", `artist-btn ${!selectedArtist ? "selected" : ""}`)
      .text("전체")
      .on("click", () => {
        drawCircles(null);
        drawButtons(artistList, null);
      });

    // 아티스트별 버튼
    artistList.forEach(artist => {
      btnContainer.append("button")
        .attr("class", `artist-btn ${selectedArtist === artist ? "selected" : ""}`)
        .text(artist)
        .on("click", () => {
          drawCircles(artist);
          drawButtons(artistList, artist);
        });
    });
  }

  // 초기 실행
  const artistList = getArtistList(csvData);
  drawCircles();
  drawButtons(artistList, null);
});
