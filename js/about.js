/* About page timeline and learning-process interaction. */
const timelineItems = document.querySelectorAll('.about-timeline-item');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      timelineItems.forEach(item => item.classList.toggle('timeline-active', item === entry.target));
    });
  }, { threshold: 0.55 });
  timelineItems.forEach(item => observer.observe(item));
}
const journeySection = document.querySelector('.about-journey-section');
const progressFill = document.querySelector('.timeline-progress-fill');
function updateTimelineProgress() {
  if (!journeySection || !progressFill) return;
  const rect = journeySection.getBoundingClientRect();
  const distance = rect.height - window.innerHeight;
  const progress = distance > 0 ? Math.min(Math.max(-rect.top / distance, 0), 1) : 1;
  progressFill.style.height = `${progress * 100}%`;
}
window.addEventListener('scroll', updateTimelineProgress, { passive: true });
window.addEventListener('resize', updateTimelineProgress);
updateTimelineProgress();
const thinkingSteps = document.querySelectorAll('.thinking-step');
const thinkingTitle = document.getElementById('thinking-title');
const thinkingDescription = document.getElementById('thinking-description');
const thinkingNumber = document.querySelector('.thinking-display-number');
const thinkingData = {

    learn: {

        number: "01",

        title: "Learn",

        description:
            "Start with curiosity. Understand how something works before trying to change it."

    },

    question: {

        number: "02",

        title: "Question",

        description:
            "Ask why it works, what could be different, and whether there is a better way to approach the problem."

    },

    build: {

        number: "03",

        title: "Build",

        description:
            "Turn an idea into something real. Even a rough first version teaches more than an idea sitting on paper."

    },

    break: {

        number: "04",

        title: "Break",

        description:
            "Things don't always work the first time. Debugging forces me to understand the system instead of guessing."

    },

    improve: {

        number: "05",

        title: "Improve",

        description:
            "Take what I learned from the first version and make the system clearer, stronger, and more useful."

    }

};



function updateThinkingDisplay(key) {
  const data = thinkingData[key];
  if (!data || !thinkingTitle || !thinkingDescription || !thinkingNumber) return;
  thinkingSteps.forEach(button => {
    const active = button.dataset.thinking === key;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  thinkingTitle.textContent = data.title;
  thinkingDescription.textContent = data.description;
  thinkingNumber.textContent = data.number;
}
if (thinkingDescription) thinkingDescription.setAttribute('aria-live', 'polite');
thinkingSteps.forEach(button => button.addEventListener('click', () => updateThinkingDisplay(button.dataset.thinking)));
updateThinkingDisplay('learn');
