import { auth, db } from "./firebase.js";

import {
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged,
updateProfile // Added to save the name!
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
addDoc,
collection,
doc,
getDoc
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ==========================================================
   1. USER AUTHENTICATION (Signup, Login, Logout)
   ========================================================== */

window.signup = async () => {
const name = document.getElementById("userName").value; // Grab the name from HTML
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

if (!name) {
    alert("Please enter your name!");
    return;
}

try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Save the name to their Firebase profile!
    await updateProfile(userCredential.user, {
        displayName: name
    });

    alert("Signup successful");
    location.href = "index.html";
} catch (error) {
    alert(error.message);
}
};

window.login = async () => {
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;
await signInWithEmailAndPassword(auth, email, password);
location.href = "dashboard.html";
};

const userDisplay = document.getElementById("userEmail");
if (userDisplay) {
onAuthStateChanged(auth, (user) => {
if (user) {
    // Check if they have a saved name. If not, fallback to email.
    const displayName = user.displayName || user.email;
    userDisplay.innerText = "Welcome " + displayName;
}
else {
location.href = "index.html";
}
});
}

window.logout = async () => {
await signOut(auth);
location.href = "index.html";
};

/* ==========================================================
   2. DASHBOARD LOGIC (Tabs, File Converter & QR Generator)
   ========================================================== */

window.closeModal = () => {
document.getElementById("qrModal").style.display = "none";
};

let currentType = "messageTab";

window.switchTab = (tabId, btn) => {
currentType = tabId;
document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
document.getElementById(tabId).classList.add('active');
btn.classList.add('active');
};

const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

window.generateQR = async () => {
const genBtn = document.getElementById("generateBtn");
genBtn.disabled = true;
genBtn.innerText = "Processing...";

let docData = { type: "message" };
let docRef;

if (currentType === "messageTab") {
docData.opening = document.getElementById("opening").value;
docData.message = document.getElementById("message").value;
docData.closing = document.getElementById("closing").value;

docRef = await addDoc(collection(db, "messages"), docData);
} 
else if (currentType === "photoTab") {
const fileInput = document.getElementById("photoInput");
const file = fileInput.files[0];
if (!file) {
alert("Please select a photo first!");
genBtn.disabled = false;
genBtn.innerText = "Generate Love QR";
return;
}
if (file.size > 0.8 * 1024 * 1024) { 
alert("On the free plan, photos must be less than 800KB!");
genBtn.disabled = false;
genBtn.innerText = "Generate Love QR";
return;
}

const base64Photo = await fileToBase64(file);
docData.type = "photo";
docData.url = base64Photo; 
docRef = await addDoc(collection(db, "messages"), docData);
} 
else if (currentType === "videoTab") {
const fileInput = document.getElementById("videoInput");
const file = fileInput.files[0];
if (!file) {
alert("Please select a video first!");
genBtn.disabled = false;
genBtn.innerText = "Generate Love QR";
return;
}
if (file.size > 2.0 * 1024 * 1024) { 
alert("Videos must be less than 2MB! Anything larger breaks the free plan.");
genBtn.disabled = false;
genBtn.innerText = "Generate Love QR";
return;
}

const base64Video = await fileToBase64(file);

if (base64Video.length < 800000) {
    docData.type = "video";
    docData.url = base64Video; 
    docRef = await addDoc(collection(db, "messages"), docData);
} else {
    // CHOP INTO 4 PIECES SO IT NEVER CROSSES THE 1MB LIMIT
    const quarter = Math.floor(base64Video.length / 4);
    const part1 = base64Video.substring(0, quarter);
    const part2 = base64Video.substring(quarter, quarter * 2);
    const part3 = base64Video.substring(quarter * 2, quarter * 3);
    const part4 = base64Video.substring(quarter * 3);

    // 1. Give the UI a breather to render "Processing..."
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 2. Save parts 2, 3, and 4
    genBtn.innerText = "Saving Part 2...";
    const p2 = await addDoc(collection(db, "messages"), { type: "v-chunk", data: part2 });
    
    genBtn.innerText = "Saving Part 3...";
    const p3 = await addDoc(collection(db, "messages"), { type: "v-chunk", data: part3 });
    
    genBtn.innerText = "Saving Part 4...";
    const p4 = await addDoc(collection(db, "messages"), { type: "v-chunk", data: part4 });
    
    // 3. Save Part 1 as the main document holding all the other IDs
    genBtn.innerText = "Finalizing...";
    docData.type = "video-part1";
    docData.part1Data = part1;
    docData.p2Id = p2.id;
    docData.p3Id = p3.id;
    docData.p4Id = p4.id;
    docRef = await addDoc(collection(db, "messages"), docData);
}
}

const url = window.location.origin + "/message.html?id=" + docRef.id;
const qrDiv = document.getElementById("qr");
qrDiv.innerHTML = "";

const selectedStyle = document.querySelector('input[name="qrStyle"]:checked').value;
const apiBase = "https://quickchart.io/qr?size=200&ecLevel=H&text=" + encodeURIComponent(url);

if (selectedStyle === "heart") {
const container = document.createElement('div');
container.style.width = "220px";
container.style.height = "220px";
container.style.position = "relative";
container.style.margin = "30px auto";
container.style.display = "flex";
container.style.alignItems = "center";
container.style.justifyContent = "center";

const heartBase = document.createElement('div');
heartBase.style.width = "140px";
heartBase.style.height = "140px";
heartBase.style.background = "#d6001c";
heartBase.style.position = "absolute";
heartBase.style.transform = "rotate(45deg)";
heartBase.style.boxShadow = "0 0 20px rgba(214, 0, 28, 0.4)";

const leftCircle = document.createElement('div');
leftCircle.style.width = "140px";
leftCircle.style.height = "140px";
leftCircle.style.background = "#d6001c";
leftCircle.style.borderRadius = "50%";
leftCircle.style.position = "absolute";
leftCircle.style.left = "-70px";

const topCircle = document.createElement('div');
topCircle.style.width = "140px";
topCircle.style.height = "140px";
topCircle.style.background = "#d6001c";
topCircle.style.borderRadius = "50%";
topCircle.style.position = "absolute";
topCircle.style.top = "-70px";

heartBase.appendChild(leftCircle);
heartBase.appendChild(topCircle);
container.appendChild(heartBase);

const img = document.createElement('img');
img.src = apiBase + "&dark=000000";
img.style.width = "130px";
img.style.height = "130px";
img.style.position = "relative";
img.style.zIndex = "5";
img.style.borderRadius = "6px";
img.style.border = "3px solid white";

container.appendChild(img);
qrDiv.appendChild(container);
} else if (selectedStyle === "center-heart") {
const container = document.createElement('div');
container.style.position = "relative";
container.style.display = "inline-block";

const img = document.createElement('img');
img.src = apiBase + "&dark=000000";
img.style.display = "block";
img.style.margin = "0 auto";
img.style.borderRadius = "12px";

const heartOverlay = document.createElement('div');
heartOverlay.innerHTML = "❤️";
heartOverlay.style.position = "absolute";
heartOverlay.style.top = "50%";
heartOverlay.style.left = "50%";
heartOverlay.style.transform = "translate(-50%, -50%)";
heartOverlay.style.fontSize = "32px";
heartOverlay.style.background = "white";
heartOverlay.style.borderRadius = "50%";
heartOverlay.style.padding = "5px";
heartOverlay.style.boxShadow = "0 0 10px rgba(0,0,0,0.15)";

container.appendChild(img);
container.appendChild(heartOverlay);
qrDiv.appendChild(container);
} else {
const img = document.createElement('img');
img.src = apiBase + "&dark=000000";
img.style.display = "block";
img.style.margin = "0 auto";
img.style.borderRadius = "12px";
qrDiv.appendChild(img);
}

document.getElementById("qrModal").style.display = "flex";
genBtn.disabled = false;
genBtn.innerText = "Generate Love QR";
};

window.downloadQR = () => {
const qrDiv = document.getElementById("qr");
const img = qrDiv.querySelector("img");
const link = document.createElement("a");
link.href = img.src;
link.download = "qr-message.png";
link.click();
};

window.printQR = () => {
window.print();
};

/* ==========================================================
   3. RECEIVER LOGIC (Runs when viewer opens message.html)
   ========================================================== */
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (id) {
    const docRef = doc(db, "messages", id);
    
    // We run this in an async function to prevent top-level await issues
    const initReceiver = async () => {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const container = document.querySelector(".card");

            if (!container) return; // Stop if we are on dashboard.html

            // 1. Clear placeholder cards if it's not a background fragment
            if (data.type !== "v-chunk" && data.type !== "video-part2") {
                container.innerHTML = ""; 
            }

            // 2. Render Based on Type
            if (data.type === "photo") {
                const img = document.createElement("img");
                img.src = data.url;
                img.style.maxWidth = "100%";
                img.style.borderRadius = "12px";
                img.style.border = "4px solid var(--primary-glow)";
                container.appendChild(img);
            } 
            else if (data.type === "video") {
                const video = document.createElement("video");
                video.src = data.url;
                video.controls = true;
                video.style.maxWidth = "100%";
                video.style.borderRadius = "12px";
                video.style.border = "4px solid var(--primary-glow)";
                container.appendChild(video);
            }
            else if (data.type === "video-part1") {
                container.innerHTML = "<p style='color:white; font-family:sans-serif;'>Loading heavy video chunks... Please wait.</p>";

                const p2Snap = await getDoc(doc(db, "messages", data.p2Id));
                const p3Snap = await getDoc(doc(db, "messages", data.p3Id));
                const p4Snap = await getDoc(doc(db, "messages", data.p4Id));

                if (p2Snap.exists() && p3Snap.exists() && p4Snap.exists()) {
                    const completeVideoBase64 = data.part1Data + p2Snap.data().data + p3Snap.data().data + p4Snap.data().data;
                    
                    container.innerHTML = ""; 
                    const video = document.createElement("video");
                    video.src = completeVideoBase64;
                    video.controls = true;
                    video.style.maxWidth = "100%";
                    video.style.borderRadius = "12px";
                    video.style.border = "4px solid var(--primary-glow)";
                    container.appendChild(video);
                }
            }
            else if (data.type === "message" || (!data.type && data.opening)) {
                container.innerHTML = ""; 

                // 1. Create a container strictly for the heart to force visibility
                const heartTop = document.createElement("div");
                heartTop.innerText = "❤️";
                heartTop.style.fontSize = "45px";
                heartTop.style.textAlign = "center";
                heartTop.style.marginBottom = "15px";
                heartTop.style.display = "block !important"; // Overrides any hiding CSS
                heartTop.style.color = "#ff4d4d !important"; // Forces it to be red if font-awesome is acting up
                container.appendChild(heartTop);

                // 2. Render the message text
                const opening = document.createElement("h2");
                opening.id = "opening";
                opening.innerText = data.opening || "";

                const message = document.createElement("p");
                message.id = "message";
                message.innerText = data.message || "";

                const closing = document.createElement("h3");
                closing.id = "closing";
                closing.innerText = data.closing || "";

                container.appendChild(opening);
                container.appendChild(message);
                container.appendChild(closing);
            }
        }
    };
    
    initReceiver();
}