# Podcast Generator

## Opis projektu
Aplikacja webowa umożliwiająca generowanie podcastów z tekstu, z możliwością wyboru głosów uczestników.

## Architektura
- Backend: FastAPI, Python
- Frontend: React+VITE + TypeScript
- Audio: generowane przez API TTS (np. OpenAI, ElevenLabs)
- DB: Postgres ( dla możliwego późniejszego rozwoju )


## Wymagane klucze API
- GROQ_API_KEY– do generowania treści i TTS
- ELEVENLABS_API_KEY - do generowania plików mp3

## Zdobywanie kluczy
- GROQ_API_KEY:
    1. Wejśc na strone https://groq.com/
    2. Zalogować/Zarejestrować się
    3. W prawym górnym klikamy "API Keys"
    4. Klikamy "Create API key"
    5. Wpisujemy nazwe dla klucza i weryfikujemy sie
    6. Kopiujemy klucz
- ELEVENLABS_API_KEY 
    1. Wejśc na strone https://elevenlabs.io
    2. Zalogować/Zarejestrować się
    3. W lewym dolnym klikamy "developers"
    4. Klikamy "API Keys"
    5. Wpisujemy nazwe dla klucza
    6. Wyłączamy Restric Key
    7. Klikamy Create Key
    8. Pobieramy klucz



## Uruchomienie
1. Uruchomić Dockera
2. Skopiuj `.env.example` do `.env` i uzupełnij klucze ( PS: W każdym miejscu, gdzie jest env.example, czyli w trzech miejscach, wstawić plik .env )
3. Uruchom całość:
```bash
docker-compose up --build
