import { useState } from "react";

// Pełna lista głosów i ich ID
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

function App() {
  const [membersCount, setMembersCount] = useState(1);
  const [minutesNum, setMinutesNum] = useState(5);
  const [podcastTitle, setPodcastTitle] = useState("");
  const [podcastNotes, setPodcastNotes] = useState("");
  const [selectedVoices, setSelectedVoices] = useState<string[]>([""]);
  const [podcastGenerated, setPodcastGenerated] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  const handleVoiceSelect = (index: number, value: string) => {
    const updated = [...selectedVoices];
    updated[index] = value;
    setSelectedVoices(updated);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinutesNum(Number(e.target.value));
  };

  const handleGeneratePodcast = async () => {
    if (!podcastTitle.trim()) return alert("Podaj tytuł podcastu!");
    if (!podcastNotes.trim()) return alert("Podaj notatki / treść podcastu!");

    const participants = selectedVoices
      .filter(Boolean)
      .map(name => ({ name, id: voicesList[name] }));

    const payload = {
      personNum: membersCount,
      minutesNum,
      podcastTitle,
      podcastNotes,
      participants,
    };

    try {
      const response = await fetch(`${BACKEND_URL}/generate_podcast/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        return alert(`Błąd backendu: ${error.detail || response.statusText}`);
      }

      await response.json();
      console.log("Podcast wygenerowany pomyślnie!");
      setPodcastGenerated(true);

    } catch (err) {
      console.error(err);
      alert("Błąd sieci podczas wysyłania danych");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Generator podcastu</h1>

      <label>
        Tytuł podcastu:
        <input
          type="text"
          value={podcastTitle}
          onChange={(e) => setPodcastTitle(e.target.value)}
          style={{ width: "100%", margin: "0.5rem 0" }}
        />
      </label>

      <label>
        Notatki / treść podcastu:
        <textarea
          value={podcastNotes}
          onChange={(e) => setPodcastNotes(e.target.value)}
          rows={8}
          style={{ width: "100%", margin: "0.5rem 0" }}
        />
      </label>

      <label>
        Liczba uczestników:
        <select
          value={membersCount}
          onChange={(e) => {
            const value = Number(e.target.value);
            setMembersCount(value);
            setSelectedVoices(prev => {
              const copy = [...prev];
              copy.length = value;
              return copy.map(v => v || "");
            });
          }}
          style={{ margin: "0.5rem 0" }}
        >
          {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>

      <label>
        Czas trwania (minuty):
        <input
          type="number"
          value={minutesNum}
          onChange={handleMinutesChange}
          min={1}
          max={120}
          style={{ margin: "0.5rem 0" }}
        />
      </label>

      {Array.from({ length: membersCount }).map((_, idx) => (
        <div key={idx} style={{ marginBottom: "1rem" }}>
          <h3>Uczestnik {idx + 1}</h3>
          <select
            value={selectedVoices[idx] || ""}
            onChange={(e) => handleVoiceSelect(idx, e.target.value)}
          >
            <option value="">-- wybierz głos --</option>
            {Object.keys(voicesList).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      ))}

      <button
        onClick={handleGeneratePodcast}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
      >
        Generuj podcast
      </button>

      {podcastGenerated && (
        <div style={{ marginTop: "1rem" }}>
          <audio
            controls
            src={`${BACKEND_URL}/download_podcast/`}
            style={{ display: "block", marginBottom: "0.5rem" }}
          />
          <a
            href={`${BACKEND_URL}/download_podcast/`}
            download="podcast.mp3"
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              backgroundColor: "#4CAF50",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            Pobierz podcast
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
