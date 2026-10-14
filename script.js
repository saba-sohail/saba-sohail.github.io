const container = document.querySelector('.main-container');
let resizeTimer;

document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
        const section = button.getAttribute('data-section');
        showSection(section);

        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }

    container.scrollTop = 0;
    container.classList.add('resizing');
    fitHeight();
    // Fallback in case no height transition runs (e.g. sections are the same height)
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => container.classList.remove('resizing'), 450);
}

// Size the container to the active section so its height animates between sections
function fitHeight() {
    const activeSection = container.querySelector('.content-section.active');
    if (!activeSection) return;

    const style = getComputedStyle(container);
    const extra = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
        + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    container.style.height = `${activeSection.offsetHeight + extra}px`;
}

// Refit when content reflows (window resize, fonts or images loading)
document.querySelectorAll('.content-section').forEach(section => {
    new ResizeObserver(() => {
        if (section.classList.contains('active')) fitHeight();
    }).observe(section);
});

fitHeight();

// Project filters: one button per category label, plus "All"
const projectFilters = document.querySelector('.projects-navbar');
const projects = document.querySelectorAll('.project');
const categories = [...new Set([...projects].map(p => p.querySelector('.category').textContent.trim()))];

['All', ...categories].forEach((category, i) => {
    const btn = document.createElement('button');
    btn.className = 'proj-btn' + (i === 0 ? ' active' : '');
    btn.textContent = category;
    btn.addEventListener('click', () => {
        projectFilters.querySelectorAll('.proj-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        projects.forEach(p => {
            p.hidden = category !== 'All' && p.querySelector('.category').textContent.trim() !== category;
        });
    });
    projectFilters.appendChild(btn);
});
