import { useState } from "react";

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

interface Participant {
  name: string;
  id: string;
}

export default function App() {
  const [podcastTitle, setPodcastTitle] = useState("");
  const [podcastNotes, setPodcastNotes] = useState("");
  const [minutesNum, setMinutesNum] = useState(1);
  const [personNum, setPersonNum] = useState(1);
  const [participants, setParticipants] = useState<Participant[]>(
    Array(4).fill({ name: "", id: "" })
  );

  const handleParticipantChange = (index: number, name: string) => {
    const id = voicesList[name] || "";
    const updated = [...participants];
    updated[index] = { name, id };
    setParticipants(updated);
  };

  const handleSubmit = async () => {
    const payload = {
      personNum,
      minutesNum,
      podcastTitle,
      podcastNotes,
      participants: participants.slice(0, personNum),
    };

    try {
      const response = await fetch("http://localhost:8000/generate_podcast/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Response:", data);
      alert("Podcast sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Error sending podcast.");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1>Create Podcast</h1>

      <div>
        <label>Tytuł podcastu:</label>
        <input
          type="text"
          value={podcastTitle}
          onChange={(e) => setPodcastTitle(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
      </div>

      <div>
        <label>Notatki:</label>
        <textarea
          value={podcastNotes}
          onChange={(e) => setPodcastNotes(e.target.value)}
          rows={5}
          style={{ width: "100%", marginBottom: 10 }}
        />
      </div>

      <div>
        <label>Czas podcastu (minuty):</label>
        <select
          value={minutesNum}
          onChange={(e) => setMinutesNum(Number(e.target.value))}
          style={{ width: "100%", marginBottom: 10 }}
        >
          {Array.from({ length: 15 }, (_, i) => i + 1).map((min) => (
            <option key={min} value={min}>
              {min}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Liczba uczestników:</label>
        <select
          value={personNum}
          onChange={(e) => setPersonNum(Number(e.target.value))}
          style={{ width: "100%", marginBottom: 10 }}
        >
          {Array.from({ length: 4 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {[...Array(personNum)].map((_, i) => (
        <div key={i}>
          <label>Uczestnik {i + 1}:</label>
          <select
            value={participants[i].name}
            onChange={(e) => handleParticipantChange(i, e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          >
            <option value="">-- Wybierz imię --</option>
            {Object.keys(voicesList).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        style={{ padding: "10px 20px", marginTop: 20 }}
      >
        Wyślij
      </button>
    </div>
  );
}
