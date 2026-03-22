lucide.createIcons();

let games = [];
let fGames = [];
let aGames = [];

const COVER_URL = "https://cdn.jsdelivr.net/gh/gn-math/covers@main";
const HTML_URL = "https://cdn.jsdelivr.net/gh/gn-math/html@main";

async function fetchGames() {
    try {
        let zonesUrl = "https://cdn.jsdelivr.net/gh/gn-math/html@main";
        try {
            const sharesponse = await fetch("https://api.github.com/repos/gn-math/assets/commits?t="+Date.now());
            if (sharesponse && sharesponse.status===200) {
                const shajson = await sharesponse.json();
                const sha = shajson[0]['sha'];
                if (sha) {
                    zonesUrl = `https://cdn.jsdelivr.net/gh/gn-math/assets@${sha}/zones.json`;
                }
            }
        } catch (e) {
            console.log('failed to load.');
        }
        const res = await fetch(zonesUrl + "?t="+Date.now());
        const gnMathZones = await res.json();
        games = gnMathZones
        .filter(zone => zone.id !==-1 && zone.id!==1&&zone.id!==64)
        .map(zone => {
            let url = zone.url.replace("{HTML_URL}",HTML_URL).replace("{COVER_URL}",COVER_URL);
            if (zone.id === 0) {
                url = "https://cdn.jsdelivr.net/gh/bubbls/youtube-playables@main/bowmasters/index.html";
            }
            return {
                name: zone.name,
                icon: zone.cover.replace("{COVER_URL}",COVER_URL).replace("{HTML_URL}",HTML_URL),
                url:url
            };
        });
        localStorage.setItem('krypton_games_list',JSON.stringify(games));
        aGames = [...games];
        fGames = [...games];
        renderGames();
    } catch (error) {
        console.error('failed to load games',error);
        const cachedGames= localStorage.getItem('krypton_games_list');
        if (cachedGames) {
            games = JSON.parse(cachedGames);
            aGames = [...games];
            fGames = [...games];
            renderGames();
        }
    }
}

function genFallback(name) {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    return `<div class="fallback-icon">${initials}</div>`;
}

function createGC(game) {
    const card = document.createElement('div');
    card.className = 'gcard';
    card.innerHTML = `
    <div class="gicon">
        <img src="${game.icon}" alt="${game.name}" loading="lazy">
        <div class="gicon-overlay"><span>${game.name}</span></div>
    </div>`;
    const img = card.querySelector('img');
    if (!game.icon) {
        img.parentElement.innerHTML=genFallback(game.name);
    } else {
        img.addEventListener('error',() => {
            img.parentElement.innerHTML = genFallback(game.name);
        });
    }
    card.addEventListener('click',()=>openGame(game));
    return card;
}

async function openGame(game) {
    try {
        const res = await fetch(game.url);
        const html = await res.text();
        const frame = document.getElementById('zoneFrame');
        if (!frame) return;
        frame.style.display = 'block';
        frame.contentDocument.open();
        frame.contentDocument.write(html);
        frame.contentDocument.close();
        document.querySelector('.gametainer').style.display = 'none';
        const removeAds = frame.contentDocument.createElement('script');
        removeAds.textContent = `
            function removeAds() {
                ['sidebarad1','sidebarad2'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.remove();
                });
            }
            removeAds();
            const observer = new MutationObserver(removeAds);
            observer.observe(document.body, { childList: true, subtree: true });`;
        frame.contentDocument.body.appendChild(removeAds);
        frame.contentDocument.body.style.backgroundColor = '#0a0d13';
        document.getElementById('closeGame').style.display='block';
        document.getElementById('fsBtn').style.display='block';
        lucide.createIcons();
    } catch (err) {
        console.error('error fetching game: ',err);
        alert('Failed to load game!')
    }
}

function closeGame() {
    const frame = document.getElementById('zoneFrame');
    frame.remove();
    const nFrame = document.createElement('iframe');
    nFrame.id = 'zoneFrame';
    nFrame.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;border:none;z-index:9999;';
    document.body.appendChild(nFrame);
    document.getElementById('closeGame').style.display = 'none';
    document.getElementById('fsBtn').style.display = 'none';
    document.querySelector('.gametainer').style.display = 'flex';
}

function tglFullscreen() {
    const iframe = document.getElementById('zoneFrame');
    const icon = document.querySelector('#fsBtn i');
    if (!document.fullscreenElement) {
        iframe.requestFullscreen();
        icon.setAttribute('data-lucide', 'minimize');
    } else {
        document.exitFullscreen();
        icon.setAttribute('data-lucide', 'maximize');
    }
    lucide.createIcons();
}

function renderGames() {
    const grid = document.getElementById('gameGrid');
    const emptyState=document.getElementById('emptyState');
    if (!grid) return;
    grid.innerHTML = '';
    if (fGames.length===0) {
        grid.style.display ='grid';
        emptyState.style.display='none';
        fGames.forEach((game,index)=> {
            const card=createGC(game);
            card.style.animationDelay = `${index*0.05}s`;
            grid.appendChild(card);
        });
    }
    lucide.createIcons();
}

function searchGames(query) {
    if (!query) {
        fGames=[...aGames];
    } else {
        const lQuery = query.toLowerCase();
        fGames = aGames.filter(game => game.name.toLowerCase().includes(lQuery));
    }
    renderGames();
}

document.getElementById('gameSearch').addEventListener('input',(e)=>{
    searchGames(e.target.value.trim());
});

fetchGames();