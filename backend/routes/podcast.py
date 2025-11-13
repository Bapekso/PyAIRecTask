import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from .models.CreatePodcastRequest import CreatePodcastRequest
from services.podcast_generator import generate_podcast_script

router = APIRouter()

@router.post("/generate_podcast/", response_class=JSONResponse)
async def generate_podcast(createPodcastRequest: CreatePodcastRequest):
    try:
        script = generate_podcast_script(
            topic=createPodcastRequest.podcastTitle,
            participants=createPodcastRequest.personNum,
            duration=createPodcastRequest.minutesNum,
            notes=createPodcastRequest.podcastNotes
        )

        script_dict = json.loads(script)


        if not script:
            raise HTTPException(status_code=500, detail="Nie udało się wygenerować skryptu podcastu")

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
