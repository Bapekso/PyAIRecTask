from groq import Groq
from dotenv import load_dotenv
import os
from elevenlabs.client import ElevenLabs
from pathlib import Path


load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("Nie znaleziono klucza API. Ustaw GROQ_API_KEY.")
client = Groq(api_key=api_key)

def generate_podcast_prompt(topic, participants=1, duration=5, notes="", feedback=""):
    required_words = duration * 130
    persons = ""
    if participants > 1:
        persons_list = [f'"Person{i + 1}": {{"line": "..."}},' for i in range(participants - 1)]
        persons = "\n      " + "\n      ".join(persons_list)
        persons = persons.rstrip(',')

    prompt = f"""
        You are a professional podcast script generator.

        INPUT:
        - Topic: {topic}
        - Number of participants: {participants}
        - Expected duration in minutes: {duration}
        - General script notes: {notes}

        RULES:
        1️⃣ Generate dialogue and explanatory notes in Introduction, Main Content, and Conclusion.
        2️⃣ Return JSON only if possible, following this structure:
        {{
        "Introduction": {{"Host": {{"line": "..."}}}},
        "Main Content": {{
            "Host": {{"line": "..."}},{persons}
        }},
        "Conclusion": {{"Host": {{"line": "..."}}}}
        }}
        3️⃣ Word count enforcement: the total dialogue and notes should be approximately {required_words} words (130 words per minute of expected duration).
        4️⃣ Make sure each section (Introduction, Main Content, Conclusion) has meaningful content and contributes to the total word count.
        {feedback}
    """
    return prompt

def count_words(text):
    return len([w for w in text.split() if w.strip()])

def generate_podcast_script(topic, participants=1, duration=5, notes=""):
    required_words = duration * 130
    feedback = ""
    attempt = 0
    max_attempts = 20

    max_word_response = ""
    max_word_count = 0

    while attempt < max_attempts:
        attempt += 1
        prompt = generate_podcast_prompt(topic, participants, duration, notes, feedback)

        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            temperature=1,
            max_completion_tokens=4096,
            top_p=1,
            reasoning_effort="medium",
            stream=False
        )

        response_text = completion.choices[0].message.content
        word_count = count_words(response_text)
        print(f"\n=== PRÓBA {attempt} ===")
        print(f"Łączna liczba słów w odpowiedzi: {word_count}")

        if word_count == 0 and not max_word_response:
            max_word_response = response_text
            max_word_count = 0

        if word_count > max_word_count:
            max_word_count = word_count
            max_word_response = response_text

        if word_count >= required_words:
            print("Wymagana liczba słów osiągnięta")
            return response_text
        else:
            print("Za mało słów , prosimy model o uzupełnienie...")
            feedback = f"\nPlease expand the content so that the total word count reaches at least {required_words} words."

    if max_word_response:
        print("\nNie udało się osiągnąć wymaganego limitu słów, zwracam najlepszą próbę:")
        return max_word_response
    else:
        print("\nNie udało się wygenerować żadnej sensownej odpowiedzi.")
        return None

clienteleven = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

clienteleven = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

def text_to_audio(text, n, voice_id):
    files_dir = Path(__file__).resolve().parent.parent / "files"
    files_dir.mkdir(parents=True, exist_ok=True)

    output_file = f"podcast_output_{n}.mp3"
    output_path = files_dir / output_file

    audio = clienteleven.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128"
    )

    with open(output_path, "wb") as f:
        for chunk in audio:
            f.write(chunk)

    print(f"✅ Audio zapisane jako: {output_file}")

    




    


if __name__ == "__main__":
    topic = "Sztuczna inteligencja w edukacji"
    participants = 3
    duration = 5
    notes = "Porusz aspekty etyczne i praktyczne zastosowania AI w szkołach."

    script = generate_podcast_script(topic, participants, duration, notes)
    print("\n=== Wygenerowany skrypt ===")
    print(script)
