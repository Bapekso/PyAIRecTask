import { useState } from "react";

// Lista głosów i ich ID
const voicesList: Record<string, string> = {
  Clyde: "2EiwWnXFnvU5JabPnv8n",
  Roger: "CwhRBWXzGAHq8TQ4Fs17",
  Sarah: "EXAVITQu4vr4xnSDxMaL",
  Laura: "FGY2WhTYpPnrIDTdsKH5",
  Charlie: "IKne3meq5aSn9XLyUdCD",
  George: "JBFqnCBsd6RMkjVDRZzb",
  Callum: "N2lVS1w4EtoT3dr4eOWO",
  River: "SAz9YHcvj6GT2YYXdXww",
  Harry: "SOYHLrjzK2X1ezoPC6cr",
  Liam: "TX3LPaxmHKxFdv7VOQHJ",
  Alice: "Xb7hH8MSUJpSbSDYk0k2",
  Matilda: "XrExE9yKIg1WjnnlVkGX",
  Will: "bIHbv24MWmeRgasZH58o",
  Jessica: "cgSgspJ2msm6clMCkdW9",
  Eric: "cjVigY5qzO86Huf0OWal",
  Chris: "iP95p4xoKVk53GoZ742B",
  Brian: "nPczCjzI2devNBz1zQrb",
  Daniel: "onwK4e9ZLuTAKqWW03F9",
  Lily: "pFZP5JQG7iQjIQuC4Bku",
  Bill: "pqHfZKP75CvOlQylNhV4",
};

// Ładowanie próbek głosów z mp3_files
const voiceFiles = import.meta.glob("/mp3_files/*.mp3", { eager: true, as: "url" }) as Record<string, string>;
const voiceSamples = Object.entries(voiceFiles).map(([path, url]) => ({
  name: path.split("/").pop()?.replace(".mp3", "") || "",
  url,
}));

// Dozwolone typy plików
const allowedTypes = ["text/plain"]; // np. txt, można rozszerzyć

function App() {
  const [membersCount, setMembersCount] = useState(1);
  const [selectedVoices, setSelectedVoices] = useState<string[]>([""]);
  const [files, setFiles] = useState<File[]>([]);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  const handleVoiceSelect = (index: number, value: string) => {
    const updated = [...selectedVoices];
    updated[index] = value;
    setSelectedVoices(updated);
  };

  const addFiles = (newFiles: File[]) => {
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const filtered = newFiles.filter((f) => {
        if (existingNames.has(f.name)) return false;
        if (!allowedTypes.includes(f.type)) {
          alert(`Nieprawidłowy typ pliku: ${f.name}`);
          return false;
        }
        return true;
      });
      return [...prev, ...filtered];
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    addFiles(Array.from(fileList));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles) return;
    addFiles(Array.from(droppedFiles));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleSendToBackend = async () => {
    if (files.length === 0) return alert("Brak plików do wysłania!");

    const formData = new FormData();

    // Dynamiczne dodanie wszystkich uczestników
    selectedVoices.forEach((voiceName, idx) => {
      const voiceId = voicesList[voiceName];
      formData.append(`participant_${idx + 1}_voiceName`, voiceName);
      formData.append(`participant_${idx + 1}_voiceId`, voiceId || "");
    });

    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch(`${BACKEND_URL}/upload-podcast`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) return alert("Błąd przy wysyłaniu danych do backendu");

      const result = await response.json();
      console.log("Odpowiedź backendu:", result);
      alert("Dane wysłane pomyślnie!");
    } catch (err) {
      console.error(err);
      alert("Błąd sieci podczas wysyłania danych");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Wybór głosów uczestników podcastu</h1>

      <label>
        Liczba uczestników:{" "}
        <select
          value={membersCount}
          onChange={(e) => {
            const value = Number(e.target.value);
            setMembersCount(value);
            setSelectedVoices((prev) => {
              const copy = [...prev];
              copy.length = value;
              return copy.map((v) => v || "");
            });
          }}
        >
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <hr style={{ margin: "1.5rem 0" }} />

      {Array.from({ length: membersCount }).map((_, idx) => (
        <div key={idx} style={{ marginBottom: "1rem" }}>
          <h3>Uczestnik {idx + 1}</h3>
          <select
            value={selectedVoices[idx] || ""}
            onChange={(e) => handleVoiceSelect(idx, e.target.value)}
          >
            <option value="">-- wybierz głos --</option>
            {voiceSamples.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>

          {selectedVoices[idx] && (
            <audio
              controls
              src={voiceSamples.find((v) => v.name === selectedVoices[idx])?.url}
              style={{ display: "block", marginTop: "0.5rem" }}
            />
          )}
        </div>
      ))}

      <hr style={{ margin: "2rem 0" }} />

      <h1>Upload plików</h1>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById("fileInput")?.click()}
        style={{
          border: "2px dashed #333",
          padding: "50px",
          cursor: "pointer",
          textAlign: "center",
          marginBottom: "1rem",
        }}
      >
        Upuść pliki lub kliknij, aby wybrać
      </div>

      <input
        type="file"
        multiple
        id="fileInput"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {files.length > 0 && (
        <div>
          <h3>Wybrane pliki:</h3>
          <ul>
            {files.map((f) => (
              <li key={f.name}>{f.name}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleSendToBackend}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
      >
        Wyślij dane do backendu
      </button>
    </div>
  );
}

export default App;
