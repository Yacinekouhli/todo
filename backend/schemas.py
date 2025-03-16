from pydantic import BaseModel

class TodoBase(BaseModel):
    title: str
    completed: bool = False

# Schéma pour la création (POST)
class TodoCreate(TodoBase):
    pass

# Schéma pour la lecture (GET, etc.)
class TodoRead(TodoBase):
    id: int

    class Config:
        orm_mode = True
