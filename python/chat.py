from fastapi import APIRouter, Response, Request
from pydantic import BaseModel

from logger import log
from constants import X_AUTHORIZATION

router = APIRouter()


class RegisterValidator(BaseModel):
    username: str


@router.get('/user')
def get_user(request: Request):
    return request.cookies.get(X_AUTHORIZATION)


@router.post("/register")
async def register_user(user: RegisterValidator, response: Response):
    response.set_cookie(key=X_AUTHORIZATION, value=user.username, httponly=True)
    log.debug(f"User register with username={user.username}")
    return user.json()


@router.get("/ping")
async def test_ping():
    return "Hello from backend!"
