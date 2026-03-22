lucide.createIcons();

// the pages
const views = {
    Home: 'home-view',
    Games: 'games-view',
    Browser: 'browser-view'
};

const buttons = document.querySelectorAll('.sidebar-btn');
buttons.forEach(btn => {
    btn.addEventListener('click',()=>{
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click',() => {
        const label = btn.dataset.label;
        document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.content').forEach(v => v.classList.add('hidden'));
        const target = document.getElementById(views[label]);
        if (target) target.classList.remove('hidden');
    });
});

VANTA.FOG({
    el: "#home-bg",
    highlightColor: 0x1c2333,
    midtoneColor: 0x111827,
    lowlightColor: 0x0d1119,
    baseColor: 0x090c12,
    blurFactor: 0.8,
    zoom: 0.6,
    speed: 0.8
});