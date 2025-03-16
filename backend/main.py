# main.py
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

# On importe l'engine et la factory de session depuis notre fichier database.py
from .database import engine, SessionLocal
# On importe nos modèles et schémas (définis dans models.py et schemas.py)
from . import models, schemas

app = FastAPI()

# Liste des origines autorisées
origins = [
    "http://localhost:3000",
    # Ajoute d'autres URL si besoin
]

# Ajoute le middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # Autorise uniquement ces origines
    allow_credentials=True,     # Permet l'envoi des cookies et informations d'authentification
    allow_methods=["*"],        # Autorise toutes les méthodes (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],        # Autorise tous les headers
)

# Crée les tables (si elles n'existent pas) en se basant sur les modèles SQLAlchemy
models.Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Hello World"}

# Cette fonction nous donnera une session de BDD pour chaque requête
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ========== EXEMPLES D'ENDPOINTS CRUD ==========

# CREATE
@app.post("/todos", response_model=schemas.TodoRead)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    new_todo = models.Todo(
        title=todo.title,
        completed=todo.completed
    )
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo

# READ (all)
@app.get("/todos", response_model=list[schemas.TodoRead])
def get_todos(db: Session = Depends(get_db)):
    return db.query(models.Todo).all()

# READ (one)
@app.get("/todos/{todo_id}", response_model=schemas.TodoRead)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    return db.query(models.Todo).filter(models.Todo.id == todo_id).first()

# UPDATE
@app.put("/todos/{todo_id}", response_model=schemas.TodoRead)
def update_todo(todo_id: int, todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not db_todo:
        return {"error": "Todo not found"}

    db_todo.title = todo.title
    db_todo.completed = todo.completed
    db.commit()
    db.refresh(db_todo)
    return db_todo

# DELETE
@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not db_todo:
        return {"error": "Todo not found"}

    db.delete(db_todo)
    db.commit()
    return {"message": "Todo deleted"}
