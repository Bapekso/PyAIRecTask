import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from .models.CreatePodcastRequest import CreatePodcastRequest
from services.podcast_generator import generate_podcast_script, text_to_audio, join_mp3, clean_mp3_folder
from pathlib import Path

router = APIRouter()

@router.post("/generate_podcast/", response_class=JSONResponse)
async def generate_podcast(createPodcastRequest: CreatePodcastRequest):
    try:
        clean_mp3_folder()

        script = generate_podcast_script(
            topic=createPodcastRequest.podcastTitle,
            participants=createPodcastRequest.personNum,
            duration=createPodcastRequest.minutesNum,
            notes=createPodcastRequest.podcastNotes
        )

        if not script:
            raise HTTPException(status_code=500, detail="Nie udało się wygenerować skryptu podcastu")

        script_dict = json.loads(script)

        num_participants = len(createPodcastRequest.participants)
        n = 0

        for key, value in script_dict.items():
            for section, content in value.items():
                text_to_convert = content['line']

                if num_participants > 0:
                    participant_idx = n % num_participants
                    voice_id = createPodcastRequest.participants[participant_idx].id
                else:
                    voice_id = "XrExE9yKIg1WjnnlVkGX"

                n += 1
                text_to_audio(text_to_convert, n, voice_id=voice_id)

        join_mp3()

        return {
            "message": "Podcast generated successfully",
            "data": {
                "topic": createPodcastRequest.podcastTitle,
                "participants": createPodcastRequest.personNum,
                "duration": createPodcastRequest.minutesNum,
                "notes": createPodcastRequest.podcastNotes,
                "script": script_dict
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating podcast: {str(e)}")
    
@router.get("/download_podcast/")
async def download_podcast():
    mp3_path = Path("mpFiles/join.mp3")
    if not mp3_path.exists():
        raise HTTPException(status_code=404, detail="Podcast not found")
    return FileResponse(mp3_path, media_type="audio/mpeg", filename="podcast.mp3")

