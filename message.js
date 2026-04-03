import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function loadMessage() {
    if (!id) return;

    const docRef = doc(db, "messages", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const container = document.querySelector(".card");
        container.innerHTML = ""; // Clear loader or old fallbacks

        // 1. Check if it is a standard video
        if (data.type === "video") {
            const video = document.createElement("video");
            video.src = data.url;
            video.controls = true;
            video.style.maxWidth = "100%";
            video.style.borderRadius = "12px";
            video.style.border = "4px solid var(--primary-glow)";
            container.appendChild(video);
        }
        // 2. Check if it is a chunked video
        else if (data.type === "video-part1") {
            container.innerHTML = "<p style='color:white; font-family:sans-serif;'>Loading heavy video chunks... Please wait.</p>";

            const p2Snap = await getDoc(doc(db, "messages", data.p2Id));
            const p3Snap = await getDoc(doc(db, "messages", data.p3Id));
            const p4Snap = await getDoc(doc(db, "messages", data.p4Id));

            if (p2Snap.exists() && p3Snap.exists() && p4Snap.exists()) {
                const completeVideoBase64 = data.part1Data + p2Snap.data().data + p3Snap.data().data + p4Snap.data().data;
                
                container.innerHTML = ""; // Clear loader
                const video = document.createElement("video");
                video.src = completeVideoBase64;
                video.controls = true;
                video.style.maxWidth = "100%";
                video.style.borderRadius = "12px";
                video.style.border = "4px solid var(--primary-glow)";
                container.appendChild(video);
            }
        }
        // 3. Check if it is a photo
        else if (data.type === "photo") {
            const img = document.createElement("img");
            img.src = data.url;
            img.style.maxWidth = "100%";
            img.style.borderRadius = "12px";
            img.style.border = "4px solid var(--primary-glow)";
            container.appendChild(img);
        } 
        // 4. Default to text message
        else {
            const opening = document.createElement("h2");
            opening.id = "opening";
            opening.innerText = data.opening || "Hello!";

            const message = document.createElement("p");
            message.id = "message";
            message.innerText = data.message || "You have a hidden message.";

            const closing = document.createElement("h3");
            closing.id = "closing";
            closing.innerText = data.closing || "Scan completed.";

            container.appendChild(opening);
            container.appendChild(message);
            container.appendChild(closing);
        }
    }
}

// Run the function
loadMessage();