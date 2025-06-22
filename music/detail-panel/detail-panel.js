// 1. 상세 패널 HTML 로드
function loadDetailPanel() {
  return fetch('/music/detail-panel/detail-panel.html')
    .then(response => response.text())
    .then(html => {
      const container = document.getElementById('detail-container');
      if (!container) {
        console.error('detail-container element not found');
        return;
      }
      container.innerHTML = html;
    });
}

// 2. 음악 데이터 시각화 업데이트 함수
function updateDetailPanel(data, colors) {
  // 패널이 로드되었는지 확인
  const detailSvg = document.getElementById('detail-svg');
  if (!detailSvg) {
    console.error('Detail SVG not loaded yet');
    return;
  }

  // 데이터 유효성 검사
  if (!data || !data.attributes) {
    console.error('Invalid data passed to updateDetailPanel:', data);
    return;
  }

  const svg = d3.select(detailSvg);
  svg.selectAll('*').remove();

  const width = +svg.attr('width');
  const height = +svg.attr('height');
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2;

  // 블러 필터 추가
  const defs = svg.append('defs');
  const blurFilter = defs.append('filter')
    .attr('id', 'detail-blur')
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');
  blurFilter.append('feGaussianBlur')
    .attr('in', 'SourceGraphic')
    .attr('stdDeviation', '5');

  // 배경 원
  svg.append('circle')
    .attr('cx', centerX)
    .attr('cy', centerY)
    .attr('r', radius)
    .attr('fill', 'black');

  // 속성 배열
  const attributes = ["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"];
  const maxAngle = (60 * Math.PI) / 180;

  // 속성별 부채꼴 생성
  attributes.forEach((attr, i) => {
    const value = data.attributes[attr] || 0; // 값이 없으면 0으로 대체
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
      .attr('filter', 'url(#detail-blur)')
      .attr('opacity', 0.9);
  });

  // 중앙 원
  svg.append('circle')
    .attr('cx', centerX)
    .attr('cy', centerY)
    .attr('r', radius / 4)
    .attr('fill', 'white');

  // 정보 업데이트
  const infoDiv = d3.select('#detail-info');
  let infoText = `<strong>${data.name || 'Unknown'}</strong><br>`;
  infoText += `<em>${data.artist || 'Unknown'}</em><br><br>`;
  
  attributes.forEach(attr => {
    infoText += `<strong>${attr}:</strong> ${data.attributes[attr] || 0}<br>`;
  });
  
  infoText += `<br><strong>시간:</strong> ${data.time || 'Unknown'}`;
  infoDiv.html(infoText);
}
