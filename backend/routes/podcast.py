import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
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

        script_dict = json.loads(script)


        if not script:
            raise HTTPException(status_code=500, detail="Nie udało się wygenerować skryptu podcastu")

        n = 0
        for key, value in script_dict.items():
            for section, content in value.items():
                n += 1
                text_to_convert = content['line']
                text_to_audio(text_to_convert, n, voice_id="XrExE9yKIg1WjnnlVkGX")

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
