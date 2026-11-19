/* Interactive concept preview; all values are illustrative. */
const demoSteps = document.querySelectorAll('.demo-step');
const demoContent = document.getElementById('demo-content');
const demoTitle = document.getElementById('demo-title');
const demoProgress = document.querySelector('.demo-progress span');
const demoProgressFill = document.querySelector('.demo-progress-fill');
const demoData = {

    profile: {

        title: "Your Immigration Journey",

        progress: 25,

        label: "PROFILE COMPLETE",

        icon: "✓",

        heading: "Your profile is ready.",

        description:
            "MaplePath uses your information to create a personalized immigration journey.",

        iconClass: "success"

    },


    pathway: {

        title: "Choose Your Pathway",

        progress: 45,

        label: "PATHWAY SELECTED",

        icon: "→",

        heading: "Canadian Experience Class",

        description:
            "MaplePath organizes your selected immigration pathway into a clear sequence of steps.",

        iconClass: "pathway"

    },


    journey: {

        title: "Your Personalized Journey",

        progress: 68,

        label: "CURRENT STEP",

        icon: "◉",

        heading: "Track your progress.",

        description:
            "See where you are in your immigration journey and understand what comes next.",

        iconClass: "journey"

    },


    timeline: {

        title: "Community Timeline",

        progress: 90,

        label: "COMMUNITY DATA",

        icon: "◌",

        heading: "Understand real timelines.",

        description:
            "Community timeline data can help users see how long similar steps have taken for other applicants.",

        iconClass: "timeline"

    }

};



function changeDemoStep(step) {
  const data = demoData[step];
  if (!data || !demoContent || !demoTitle || !demoProgress || !demoProgressFill) return;
  demoSteps.forEach(button => {
    const active = button.dataset.step === step;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  demoTitle.textContent = data.title;
  demoProgress.textContent = `${data.progress}%`;
  demoProgressFill.style.width = `${data.progress}%`;
  demoContent.innerHTML = `<div class="demo-content-icon ${data.iconClass}" aria-hidden="true">${data.icon}</div>
    <span class="demo-content-label">${data.label}</span><h4>${data.heading}</h4><p>${data.description}</p>`;
}
if (demoContent) {
  demoContent.setAttribute('aria-live', 'polite');
  demoSteps.forEach(button => button.addEventListener('click', () => changeDemoStep(button.dataset.step)));
  changeDemoStep('profile');
}
