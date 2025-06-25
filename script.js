// ✅ Firebase Setup – Project B only
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBsYc3qIZHTwgbHE09xIN76XjfBvHjzwNI",
  authDomain: "marta-d4934.firebaseapp.com",
  projectId: "marta-d4934",
  storageBucket: "marta-d4934.appspot.com",
  messagingSenderId: "496764815994",
  appId: "1:496764815994:web:4b413995a0a67e400e89c3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

let cond = null; // 🌍 Global assignment key
let audioPlaying = null;

// 🎙️ Speaker Conditions – Project B
const conditions = {
  F_SSE: ["ZY","XN","YR","MW","RN","PR","BN","BK","XL","RF","WN","GQ"],
  F_ScotsL: ["OS","VG","KL","SJ","MM","MC","JY","KK","JT","KP","ZP","FN"],
  F_ScotsP: ["KZ","DI","IT","RX","LM","VW","JS","KY","KX","HG","MP","PM"],
  M_SSE: ["DM","XU","TV","MB","KN","DG","EQ","EL","TD","QE","GI","WI"],
  M_ScotsL: ["FI","TK","QN","EK","VI","RU","WW","US","MF","KD","HS","PP"],
  M_ScotsP: ["UI","WR","HY","HZ","BF","EW","UN","VO","PX","CQ","TE","JG"]
};

// 📊 Age-Group Condition Priorities
const conditionTargets = {
  "5-6": { F_SSE: 2 },
  "9-10": { F_ScotsL: 3, M_SSE: 1 },
  "11-12": { F_ScotsL: 3, F_ScotsP: 3, F_SSE: 4, M_ScotsL: 3, M_ScotsP: 3 },
  "13-15": { F_ScotsL: 6, F_ScotsP: 1, F_SSE: 1, M_SSE: 2 }
};

// 🧠 Assignment Logic with Scottish flag
function getConditionByAgePriority(age, isScottish) {
  if (!isScottish) {
    const all = Object.keys(conditions);
    return all[Math.floor(Math.random() * all.length)];
  }

  const ageBracket = (() => {
    if (age >= 5 && age <= 6) return "5-6";
    if (age >= 7 && age <= 8) return "7-8";
    if (age >= 9 && age <= 10) return "9-10";
    if (age >= 11 && age <= 12) return "11-12";
    if (age >= 13 && age <= 15) return "13-15";
    if (age >= 16 && age <= 17) return "16-17";
    return null;
  })();

  if (ageBracket && conditionTargets[ageBracket]) {
    const available = Object.entries(conditionTargets[ageBracket])
      .filter(([_, count]) => count > 0);

    if (available.length > 0) {
      const [selected] = available[Math.floor(Math.random() * available.length)];
      conditionTargets[ageBracket][selected]--;
      return selected;
    }
  }

  const all = Object.keys(conditions);
  return all[Math.floor(Math.random() * all.length)];
}

// 🧩 Speaker Button Generator
function createSpeakerDiv(initials) {
  const div = document.createElement('div');
  div.className = 'draggable';
  div.dataset.id = initials;

  const audio = document.createElement('audio');
  audio.src = `audio/${initials}.wav`;
  audio.preload = 'none';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = initials;
  btn.className = 'speaker-button';

  btn.addEventListener('click', () => {
    if (audioPlaying && audioPlaying !== audio) {
      audioPlaying.pause();
      audioPlaying.currentTime = 0;
      const lastBtn = audioPlaying.parentElement?.querySelector('.speaker-button');
      if (lastBtn) lastBtn.classList.remove('playing');
    }

    if (audio.paused) {
      audio.play();
      audioPlaying = audio;
      btn.classList.add('playing');
    } else {
      audio.pause();
      audioPlaying = null;
      btn.classList.remove('playing');
    }

    audio.onended = () => {
      btn.classList.remove('playing');
      if (audioPlaying === audio) audioPlaying = null;
    };
  });

  div.appendChild(btn);
  div.appendChild(audio);
  div.setAttribute('data-x', 0);
  div.setAttribute('data-y', 0);
  return div;
}
function initSorting(conditionKey) {
  const speakers = conditions[conditionKey];
  const wrapper = document.getElementById('task-wrapper');
  wrapper.querySelectorAll('.draggable').forEach(el => el.remove());

  const isMobile = window.innerWidth < 768;
  const left = isMobile ? -160 : -140;
  const right = isMobile ? -80 : -75;
  const step = 50;
  let leftRow = 0;
  let rightRow = 0;

  speakers.forEach((initials, i) => {
    const speaker = createSpeakerDiv(initials);
    speaker.style.position = 'absolute';
    speaker.style.zIndex = '10';
    const x = i % 2 === 0 ? left : right;
    const y = 60 + (i % 2 === 0 ? leftRow++ : rightRow++) * step;
    speaker.style.left = `${x}px`;
    speaker.style.top = `${y}px`;
    wrapper.appendChild(speaker);
  });

  interact('.draggable').draggable({
    inertia: false,
    modifiers: [],
    autoScroll: true,
    touchAction: 'none',
    listeners: {
      start(event) { event.target.classList.add('dragging'); },
      move(event) {
        const el = event.target;
        let x = (parseFloat(el.getAttribute('data-x')) || 0) + event.dx;
        let y = (parseFloat(el.getAttribute('data-y')) || 0) + event.dy;
        el.style.transform = `translate(${x}px, ${y}px)`;
        el.setAttribute('data-x', x);
        el.setAttribute('data-y', y);
      },
      end(event) { event.target.classList.remove('dragging'); }
    }
  });
}

function hideError() {
  const errEl = document.getElementById('error-message');
  errEl.textContent = '';
  errEl.style.display = 'none';
}

function showError(msg) {
  const errEl = document.getElementById('error-message');
  errEl.textContent = msg;
  errEl.style.display = 'block';
}

function checkOrientationWarning() {
  const rotateWarning = document.getElementById('rotate-warning');
  const isPortrait = window.matchMedia("(orientation: portrait)").matches;
  const isActive = document.body.classList.contains('task-active');
  if (rotateWarning) {
    rotateWarning.style.display = (isPortrait && isActive) ? 'flex' : 'none';
  }
}

window.addEventListener('resize', checkOrientationWarning);
window.addEventListener('orientationchange', checkOrientationWarning);

document.addEventListener('DOMContentLoaded', () => {
  hideError();
  setupInstructionToggles();
  handleAutoStartFromURL();
  setupManualFormFlow();
  setupSubmissionHandler();
});

function setupInstructionToggles() {
  const hideBtn = document.getElementById('hide-instructions');
  const showBtn = document.getElementById('show-instructions');
  const instructions = document.getElementById('instructions');
  if (!hideBtn || !showBtn || !instructions) return;

  hideBtn.onclick = () => {
    instructions.classList.add('hide');
    hideBtn.style.display = 'none';
    showBtn.style.display = 'inline-block';
  };

  showBtn.onclick = () => {
    instructions.classList.remove('hide');
    hideBtn.style.display = 'inline-block';
    showBtn.style.display = 'none';
  };
}

function handleAutoStartFromURL() {
  const params = new URLSearchParams(window.location.search);
  const age = parseInt(params.get("age"));
  const gender = params.get("gender");
  const scottish = params.get("scottish") || sessionStorage.getItem('scottish');

  if (age && gender && scottish) {
    const isScottish = scottish === 'Yes';
    cond = getConditionByAgePriority(age, isScottish);
    if (!conditions[cond]) {
      showError("Something went wrong assigning your task. Please refresh and try again.");
      return;
    }

    sessionStorage.setItem('taskStartTime', Date.now());
    document.getElementById('intro-box').style.display = 'none';
    document.getElementById('sorting-section').style.display = 'flex';
    document.body.classList.add('task-active');
    checkOrientationWarning();
    requestAnimationFrame(() => requestAnimationFrame(() => initSorting(cond)));
  }
}

function setupManualFormFlow() {
  const form = document.getElementById('age-gender-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideError();

    const age = parseInt(document.getElementById('age').value.trim());
    const gender = document.getElementById('gender').value;
    const scottish = document.getElementById('scottish').value;

    if (!age || age < 4 || age > 17) {
      showError("Please enter a valid age between 4 and 17.");
      return;
    }

    if (!gender) {
      showError("Please select a gender.");
      return;
    }

    sessionStorage.setItem('scottish', scottish);
    const isScottish = scottish === 'Yes';
    cond = getConditionByAgePriority(age, isScottish);
    if (!conditions[cond]) {
      showError("Something went wrong assigning your task. Please refresh and try again.");
      return;
    }

    sessionStorage.setItem('taskStartTime', Date.now());
    document.getElementById('intro-box').style.display = 'none';
    document.getElementById('sorting-section').style.display = 'flex';
    document.body.classList.add('task-active');
    checkOrientationWarning();
    requestAnimationFrame(() => requestAnimationFrame(() => initSorting(cond)));
  });
}

function setupSubmissionHandler() {
  const submitBtn = document.getElementById('submit-button');
  if (!submitBtn) return;

  const loadingOverlay = document.getElementById('submission-loading');
  if (loadingOverlay) loadingOverlay.style.display = 'none';

  submitBtn.addEventListener('click', () => {
    const grid = document.getElementById('sorting-container');
    if (!grid) return;

    const icons = document.querySelectorAll('.draggable');
    const gridRect = grid.getBoundingClientRect();
    let allInside = true;
    const iconData = [];

    icons.forEach(icon => {
      const rect = icon.getBoundingClientRect();
      const inside = rect.left >= gridRect.left &&
                     rect.right <= gridRect.right &&
                     rect.top >= gridRect.top &&
                     rect.bottom <= gridRect.bottom;

      icon.classList.toggle('out-of-bounds', !inside);
      if (!inside) allInside = false;

      iconData.push({
        id: icon.dataset.id,
        x: parseFloat(icon.getAttribute('data-x')) || 0,
        y: parseFloat(icon.getAttribute('data-y')) || 0,
        insideGrid: inside
      });
    });

    if (!allInside) {
      alert("Oops! Please place all icons fully inside the grid before submitting.");
      return;
    }

    const confirmed = confirm("Are you sure you want to submit the task?");
    if (!confirmed) return;

    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    html2canvas(document.getElementById('task-wrapper')).then(canvas => {
      const screenshotData = canvas.toDataURL('image/png');
      const age = parseInt(document.getElementById('age').value.trim());
      const gender = document.getElementById('gender').value;
      const scottish = document.getElementById('scottish')?.value || sessionStorage.getItem('scottish') || null;
      sessionStorage.setItem('scottish', scottish);

      const start = Number(sessionStorage.getItem('taskStartTime')) || Date.now();
      const duration = Math.round((Date.now() - start) / 1000);
      const timestamp = new Date().toISOString();

      const submissionData = {
        age,
        gender,
        scottish,
        condition: cond,
        timestamp,
        duration_seconds: duration,
        icons: iconData,
        completion: "complete"
      };

      console.log("🔥 SUBMITTING TO FIRESTORE:", submissionData);

      addDoc(collection(db, "submissions"), submissionData)
      .then(docRef => {
        const filePath = `screenshots/${docRef.id}.png`;
        const fileRef = ref(storage, filePath);

        const byteString = atob(screenshotData.split(',')[1]);
        const intArray = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
          intArray[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([intArray], { type: 'image/png' });

        return uploadBytes(fileRef, blob)
          .then(() => updateDoc(doc(db, "submissions", docRef.id), {
            screenshot: filePath
          }))
          .then(() => getDownloadURL(fileRef))
          .then(downloadURL => {
            sessionStorage.setItem('assignedCondition', cond);
            window.location.href = `thankyou.html?cond=${cond}&screenshot=${encodeURIComponent(downloadURL)}`;
          });
      })
      .catch(err => {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        console.error("❌ Submission failed:", err);
        alert("There was a problem saving your work. Please check your connection and try again.");
      });
    });
  });
}
