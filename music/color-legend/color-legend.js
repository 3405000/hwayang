document.addEventListener('DOMContentLoaded', function() {
  // Only run if the component exists on the page
  if (document.querySelector('.color-legend')) {
    const attributes = [
      {
        id: 'energy',
        title: 'Energy',
        subtitle: '강렬함, 열정',
        description: '음악이 얼마나 강렬하고 활동적인가?',
        colorClass: 'energy-bg'
      },
      {
        id: 'danceability',
        title: 'Danceability',
        subtitle: '활기, 즐거움',
        description: '음악이 얼마나 춤을 추기에 적절한가?',
        colorClass: 'danceability-bg'
      },
      {
        id: 'happiness',
        title: 'Happiness',
        subtitle: '밝음, 행복',
        description: '음악이 얼마나 밝고 긍정적인가?',
        colorClass: 'happiness-bg'
      },
      {
        id: 'acousticness',
        title: 'Acousticness',
        subtitle: '자연, 편안함',
        description: '음악이 얼마나 어쿠스틱한가?',
        colorClass: 'acousticness-bg'
      },
      {
        id: 'instrumentalness',
        title: 'Instrumentalness',
        subtitle: '차분함, 집중',
        description: '음악에서 얼마나 악기 연주가 많이 느껴지는가?',
        colorClass: 'instrumentalness-bg'
      },
      {
        id: 'liveness',
        title: 'Liveness',
        subtitle: '생동감, 현장감',
        description: '음악에서 얼마나 생생한 현장감이 느껴지는가?',
        colorClass: 'liveness-bg'
      }
    ];
    
    const buttonsContainer = document.querySelector('.buttons-container');
    const descriptionContainer = document.querySelector('.description-container');
    const defaultMessage = document.querySelector('.default-message');
    
    // Create color buttons
    attributes.forEach(attr => {
      const button = document.createElement('button');
      button.className = `color-button ${attr.colorClass}`;
      button.dataset.attribute = attr.id;
      button.innerHTML = `<span class="button-label">${attr.title}</span>`;
      
      button.addEventListener('mouseover', function() {
        // Remove active class from all buttons
        document.querySelectorAll('.color-button').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Add active class to current button
        this.classList.add('active');
        
        // Update description
        if (defaultMessage) defaultMessage.style.display = 'none';
        descriptionContainer.innerHTML = `
          <h2 class="attribute-title">${attr.title}</h2>
          <h3 class="attribute-subtitle">${attr.subtitle}</h3>
          <p class="attribute-description">${attr.description}</p>
        `;
      });
      
      buttonsContainer.appendChild(button);
    });
    
    // Add mouseleave event to reset to default
    buttonsContainer.addEventListener('mouseleave', function() {
      document.querySelectorAll('.color-button').forEach(btn => {
        btn.classList.remove('active');
      });
      
      if (defaultMessage) {
        defaultMessage.style.display = 'block';
      } else {
        descriptionContainer.innerHTML = `
          <p class="default-message">색상 버튼에 마우스를 올려 속성 설명을 확인하세요</p>
        `;
      }
    });
  }
});
