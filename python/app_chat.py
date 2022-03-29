from socket_io import sio_app
from chat import router as chat_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

X_AUTHORIZATION = 'X-Authorization'

# Init stuff for further usage
app = FastAPI()
# Add cors
origins = [
     "http://localhost:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix='/api')

app.mount('/ws', sio_app) # Mount socket-io app to some page
