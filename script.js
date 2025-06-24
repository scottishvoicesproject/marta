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

// 🎙️ Speaker Conditions – Project B
const conditions = {
  F_SSE: ["ZY","XN","YR","MW","RN","PR","BN","BK","XL","RF","WN","GQ"],
  F_ScotsL: ["OS","VG","KL","SJ","MM","MC","JY","KK","JT","KP","ZP","FN"],
  F_ScotsP: ["KZ","DI","IT","RX","LM","VW","JS","KY","KX","HG","MP","PM"],
  M_SSE: ["DM","XU","TV","MB","KN","DG","EQ","EL","TD","QE","GI","WI"],
  M_ScotsL: ["FI","TK","QN","EK","VI","RU","WW","US","MF","KD","HS","PP"],
  M_ScotsP: ["UI","WR","HY","HZ","BF","EW","UN","VO","PX","CQ","TE","JG"]
};

// 📊 Age-Group Condition Priorities – Project B
const conditionTargets = {
  "5-6": { F_SSE: 2 },
  "9-10": { F_ScotsL: 3, M_SSE: 1 },
  "11-12": { F_ScotsL: 3, F_ScotsP: 3, F_SSE: 4, M_ScotsL: 3, M_ScotsP: 3 },
  "13-15": { F_ScotsL: 6, F_ScotsP: 1, F_SSE: 1, M_SSE: 2 }
};

// 🧠 Assignment Logic with Quota Fallback
function getConditionByAgePriority(age) {
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

  // 🌀 Random fallback across all conditions
  const allConditions = Object.keys(conditions);
  return allConditions[Math.floor(Math.random() * allConditions.length)];
}
