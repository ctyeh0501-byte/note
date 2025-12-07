const DB = "notesDB";
const STORE = "notes";

function openDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
    };
    req.onsuccess = (e) => res(e.target.result);
    req.onerror = (e) => rej(e);
  });
}

async function saveNote(body) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).add({ body, time: Date.now() });
}

async function loadNotes() {
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const req = tx.objectStore(STORE).getAll();

  return new Promise((res) => {
    req.onsuccess = () => res(req.result);
  });
}

document.getElementById("saveBtn").onclick = async () => {
  const text = document.getElementById("body").value.trim();
  if (!text) return;

  await saveNote(text);
  document.getElementById("body").value = "";
  render();
};

async function render() {
  const notes = await loadNotes();
  document.getElementById("list").innerHTML = notes
    .reverse()
    .map((n) => `<li>${n.body}</li>`)
    .join("");
}

render();
