from pydantic import BaseModel

class CreatePodcastRequest(BaseModel):
    personNum: int
    minutesNum: int
    podcastTitle: str
    podcastNotes: str