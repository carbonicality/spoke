lucide.createIcons();

const input = document.getElementById('urlInput');
const frame = document.getElementById('browserFrame');

const connection = new BareMux.BareMuxConnection("/sail/baremux/worker.js");
connection.setTransport("/sail/libcurl/index.mjs",
    [{websocket: "wss://wisp.classroom.lat/"}] // change this to any wisp!
);

const {ScramjetController} = $scramjetLoadController();
const scramjet = new ScramjetController({
    files: {
        all:"/sail/scram/scramjet.all.js",
        wasm:"/sail/scram/scramjet.wasm.wasm",
        sync:"/sail/scram/scramjet.sync.js"
    },
    prefix: "/sail/go/"
});
scramjet.init();

function navigate() {
    let val = input.value.trim();
    if (!val) return;
    if (!val.includes('.') && !val.startsWith('http')) {
        val = 'https://duckduckgo.com/?q='+encodeURIComponent(val);
    } else if (!val.startsWith('http://') && !val.startsWith('https://')) {
        val = 'https://'+val;
    }
    frame.src = scramjet.encodeUrl(val);
}

document.getElementById('goBtn').addEventListener('click',navigate);
document.getElementById('backBtn').addEventListener('click',()=>frame.contentWindow.history.back());
document.getElementById('fwdBtn').addEventListener('click',()=>frame.contentWindow.history.forward());
document.getElementById('refreshBtn').addEventListener('click',()=>frame.contentWindow.location.reload());

input.addEventListener('keydown', (e)=>{
    if (e.key==='Enter') navigate();
});

frame.addEventListener('load',()=>{
    try {
        const encoded = frame.contentWindow.location.href;
        if(!encoded || encoded==='about:blank') return;
        try {
            const decoded = scramjet.decodeUrl(encoded);
            if (decoded) input.value =decoded;
        } catch {
            input.value=encoded;
        }
    } catch (e) {}
});