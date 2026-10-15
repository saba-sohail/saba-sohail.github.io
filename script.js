const container = document.querySelector('.main-container');
// Matches the CSS breakpoint where the nav is hidden and all sections stack
const phone = window.matchMedia('(max-width: 480px)');
let resizeTimer;

document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
        const section = button.getAttribute('data-section');
        showSection(section);

        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

// In-text links to a section: switch tabs on desktop, scroll down to it on phones
document.querySelectorAll('.section-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const sectionId = link.getAttribute('href').slice(1);
        if (phone.matches) {
            document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
        } else {
            document.querySelector(`.nav-btn[data-section="${sectionId}"]`).click();
        }
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

    // Shrink the timeline so only it scrolls, not the whole container
    const timeline = activeSection.querySelector('.timeline');
    if (timeline) {
        timeline.style.maxHeight = '';
    }

    // Phones stack every section and scroll the page, so there's nothing to fit
    if (phone.matches) {
        container.style.height = '';
        return;
    }

    if (timeline) {
        const overflow = activeSection.offsetHeight + extra - availableHeight();
        if (overflow > 0) {
            timeline.style.maxHeight = `${Math.max(120, timeline.clientHeight - overflow)}px`;
        }
    }

    container.style.height = `${activeSection.offsetHeight + extra}px`;
}

// Space left for the container below the navbar
function availableHeight() {
    const body = getComputedStyle(document.body);
    return document.body.clientHeight
        - parseFloat(body.paddingTop) - parseFloat(body.paddingBottom)
        - document.querySelector('.navbar').offsetHeight - parseFloat(body.rowGap);
}

window.addEventListener('resize', fitHeight);

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

// Phones: experience cards collapse to title + dates, tap to show details
const jobs = document.querySelectorAll('.timeline .job');

function setupJobToggles() {
    jobs.forEach(job => {
        if (phone.matches) {
            job.setAttribute('role', 'button');
            job.setAttribute('tabindex', '0');
            job.setAttribute('aria-expanded', job.classList.contains('open'));
        } else {
            job.removeAttribute('role');
            job.removeAttribute('tabindex');
            job.removeAttribute('aria-expanded');
        }
    });
}

jobs.forEach(job => {
    const toggle = () => {
        if (!phone.matches) return;
        job.classList.toggle('open');
        job.setAttribute('aria-expanded', job.classList.contains('open'));
    };
    job.addEventListener('click', toggle);
    job.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
        }
    });
});

phone.addEventListener('change', setupJobToggles);
setupJobToggles();
