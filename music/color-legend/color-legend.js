document.addEventListener('DOMContentLoaded', function () {
    // Only run if the component exists on the page
    if (document.querySelector('.color-legend-l')) {
        const attributes = [
            {
                id: 'energy-l',
                title: 'Energy',
                subtitle: '강렬함, 열정',
                description: '음악이 얼마나 강렬하고 활동적인가?',
                colorClass: 'energy-bg-l'
            },
            {
                id: 'danceability-l',
                title: 'Danceability',
                subtitle: '활기, 즐거움',
                description: '음악이 얼마나 춤을 추기에 적절한가?',
                colorClass: 'danceability-bg-l'
            },
            {
                id: 'happiness-l',
                title: 'Happiness',
                subtitle: '밝음, 행복',
                description: '음악이 얼마나 밝고 긍정적인가?',
                colorClass: 'happiness-bg-l'
            },
            {
                id: 'acousticness-l',
                title: 'Acousticness',
                subtitle: '자연, 편안함',
                description: '음악이 얼마나 어쿠스틱한가?',
                colorClass: 'acousticness-bg-l'
            },
            {
                id: 'instrumentalness-l',
                title: 'Instrumentalness',
                subtitle: '차분함, 집중',
                description: '음악에서 얼마나 악기 연주가 많이 느껴지는가?',
                colorClass: 'instrumentalness-bg-l'
            },
            {
                id: 'liveness-l',
                title: 'Liveness',
                subtitle: '생동감, 현장감',
                description: '음악에서 얼마나 생생한 현장감이 느껴지는가?',
                colorClass: 'liveness-bg-l'
            }
        ];

        const buttonsContainer = document.querySelector('.buttons-container-l');
        const descriptionContainer = document.querySelector('.description-container-l');
        const defaultMessage = document.querySelector('.default-message-l');

        // Create color buttons
        attributes.forEach(attr => {
            const button = document.createElement('button');
            button.className = `color-button-l ${attr.colorClass}`;
            button.dataset.attribute = attr.id;
            button.innerHTML = `<span class="button-label-l">${attr.title}</span>`;

            button.addEventListener('mouseover', function () {
                // 모든 버튼에서 active 제거
                document.querySelectorAll('.color-button-l').forEach(btn => {
                    btn.classList.remove('active-l');
                });
                // 현재 버튼 active
                this.classList.add('active-l');

                // 설명창 업데이트
                if (defaultMessage) defaultMessage.style.display = 'none';
                descriptionContainer.innerHTML = `
          <h2 class="attribute-title-l">${attr.title}</h2>
          <h3 class="attribute-subtitle-l">${attr.subtitle}</h3>
          <p class="attribute-description-l">${attr.description}</p>
        `;
            });
            buttonsContainer.appendChild(button);
        });

        // Add mouseleave event to reset to default
        buttonsContainer.addEventListener('mouseleave', function () {
            document.querySelectorAll('.color-button-l').forEach(btn => {
                btn.classList.remove('active-l');
            });

            if (defaultMessage) {
                defaultMessage.style.display = 'block';
            } else {
                descriptionContainer.innerHTML = `
      <h2 class="attribute-title-l">${attr.title}</h2>
      <h3 class="attribute-subtitle-l">${attr.subtitle}</h3>
      <p class="attribute-description-l">${attr.description}</p>
    `;
            }
        });
    }
});
