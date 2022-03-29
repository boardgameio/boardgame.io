FROM python:3.8-alpine
RUN apk update
RUN apk add gcc musl-dev python3-dev libffi-dev openssl-dev g++
WORKDIR /app/simpleChat/
COPY ./requirements.txt ./requirements.txt
RUN ["pip", "install", "--no-cache-dir", "--upgrade", "-r", "requirements.txt"]
COPY . .
EXPOSE 8080
CMD ls && uvicorn app_chat:app --host 0.0.0.0 --port 3117