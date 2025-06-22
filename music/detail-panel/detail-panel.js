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
// attributes와 colors는 외부에서 이미 정의되어 있다고 가정
const DETAIL_ATTRIBUTES = ["Energy", "Danceability", "Happiness", "Acousticness", "Instrumentalness", "Liveness"];

function updateDetailPanel(data, colors) {
    const detailPanel = document.getElementById('detail-panel');

    // 데이터가 null인 경우 패널 숨기고 종료
    if (!data || !data.attributes) {
        console.error('Invalid data passed to updateDetailPanel:', data);
        detailPanel.style.display = 'none'; // 패널 숨김
        return;
    }

    // 유효한 데이터인 경우 패널 표시
    detailPanel.style.display = 'block';

    // 헤더 업데이트
    document.getElementById('detail-name').textContent = data.name || 'Unknown';
    document.getElementById('detail-artist').textContent = data.artist || 'Unknown';
    document.getElementById('detail-time').textContent = `played at ${data.time || 'Unknown'}`;

    // 시각화 업데이트
    const svg = d3.select('#detail-svg');
    svg.selectAll('*').remove();

    const width = 250;
    const height = 250;
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

    // 속성별 부채꼴 생성
    const maxAngle = (60 * Math.PI) / 180;
    DETAIL_ATTRIBUTES.forEach((attr, i) => {
        const value = data.attributes[attr] || 0;
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

    // 속성 정보 업데이트
    const attributesContainer = document.getElementById('detail-attributes');
    attributesContainer.innerHTML = '';
    DETAIL_ATTRIBUTES.forEach(attr => {
        const row = document.createElement('div');
        row.className = 'attribute-row';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'attribute-name';
        nameSpan.textContent = attr;

        const valueSpan = document.createElement('span');
        valueSpan.className = 'attribute-value';
        valueSpan.textContent = data.attributes[attr] || 0;

        row.appendChild(nameSpan);
        row.appendChild(valueSpan);
        attributesContainer.appendChild(row);
    });
}

