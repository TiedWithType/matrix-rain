const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

let fontSize = 12;
let letters =
 'アァイイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789'.split(
  '',
 );
let columns, drops;
let textColor = '#00ff00';
let bgColor = '#000000';
let trailOpacity = 0.05;
let speed = 30;
let lastFrameTime = 0;

const dialog = document.getElementById('settingsDialog');
const openButton = document.getElementById('toggleSettings');
const closeButton = document.getElementById('closeSettings');
const resetButton = document.getElementById('resetSettings');
const exportButton = document.getElementById('exportSettings');
const importButton = document.getElementById('importSettings');
const importFile = document.getElementById('importFile');

const textColorInput = document.getElementById('textColor');
const bgColorInput = document.getElementById('bgColor');
const opacityInput = document.getElementById('opacity');
const speedInput = document.getElementById('speed');
const hexToRGBA = (hex, alpha) => {
 const r = parseInt(hex.substring(1, 3), 16);
 const g = parseInt(hex.substring(3, 5), 16);
 const b = parseInt(hex.substring(5, 7), 16);
 return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const initialize = () => {
 canvas.width = window.innerWidth;
 canvas.height = window.innerHeight;
 columns = Math.floor(canvas.width / fontSize);
 drops = Array(columns).fill(1);
};

const drawMatrix = (timestamp = 0) => {
 if (timestamp - lastFrameTime < 1000 / speed) {
  requestAnimationFrame(drawMatrix);
  return;
 }
 lastFrameTime = timestamp;

 ctx.fillStyle = hexToRGBA(bgColor, trailOpacity);
 ctx.fillRect(0, 0, canvas.width, canvas.height);

 ctx.fillStyle = textColor;
 ctx.font = `${fontSize}px monospace`;

 drops.forEach((y, x) => {
  const text = letters[Math.floor(Math.random() * letters.length)];
  ctx.fillText(text, x * fontSize, y * fontSize);

  if (y * fontSize > canvas.height && Math.random() > 0.98) {
   drops[x] = 0;
  }

  drops[x]++;
 });

 requestAnimationFrame(drawMatrix);
};

const saveSettings = () => {
 const settings = {
  textColor,
  bgColor,
  trailOpacity,
  speed,
 };
 localStorage.setItem('matrixSettings', JSON.stringify(settings));
};

const loadSettings = () => {
 const saved = localStorage.getItem('matrixSettings');
 if (!saved) return;

 const settings = JSON.parse(saved);
 textColor = settings.textColor || '#00ff00';
 bgColor = settings.bgColor || '#000000';
 trailOpacity = settings.trailOpacity || 0.05;
 speed = settings.speed || 30;

 textColorInput.value = textColor;
 bgColorInput.value = bgColor;
 opacityInput.value = trailOpacity * 100;
 speedInput.value = speed;
};

const resetSettings = () => {
 localStorage.removeItem('matrixSettings');
 location.reload();
};

const exportSettings = () => {
 const settings = localStorage.getItem('matrixSettings') || '{}';
 const blob = new Blob([settings], { type: 'application/json' });
 const link = document.createElement('a');
 link.href = URL.createObjectURL(blob);
 link.download = 'matrix-settings.json';
 link.click();
};

const importSettings = () => {
 importFile.click();
};

importFile.addEventListener('change', (e) => {
 const file = e.target.files[0];
 if (!file) return;
 const reader = new FileReader();
 reader.onload = () => {
  try {
   const settings = JSON.parse(reader.result);
   localStorage.setItem('matrixSettings', JSON.stringify(settings));
   location.reload();
  } catch (err) {
   alert('Nieprawidłowy plik ustawień.');
  }
 };
 reader.readAsText(file);
});

openButton.addEventListener('click', () => dialog.showModal());
closeButton.addEventListener('click', () => dialog.close());
resetButton.addEventListener('click', resetSettings);
exportButton.addEventListener('click', exportSettings);
importButton.addEventListener('click', importSettings);

textColorInput.addEventListener('input', (e) => {
 textColor = e.target.value;
 saveSettings();
});

bgColorInput.addEventListener('input', (e) => {
 bgColor = e.target.value;
 saveSettings();
});

opacityInput.addEventListener('input', (e) => {
 trailOpacity = parseInt(e.target.value, 10) / 100;
 saveSettings();
});

speedInput.addEventListener('input', (e) => {
 speed = parseInt(e.target.value, 10);
 saveSettings();
});

window.addEventListener('resize', initialize);

loadSettings();
initialize();
drawMatrix();
