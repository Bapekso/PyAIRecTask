from pydantic import BaseModel
from typing import List, Optional

class Participant(BaseModel):
    name: str
    id: str

class CreatePodcastRequest(BaseModel):
    personNum: int
    minutesNum: int
    podcastTitle: str
    podcastNotes: str
    participants: Optional[List[Participant]] = []
