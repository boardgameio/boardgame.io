from logger import log
import socketio


sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins=[], logger=True, engineio_logger=True)
# There is some problem about how to start socketio with FastAPI
# I found some help in these links:
# https://github.com/tiangolo/fastapi/issues/129
# https://github.com/pyropy/fastapi-socketio
# After reading them, I wrote some lines below and its works as it should be!
sio_app = socketio.ASGIApp(
    sio,
    # socketio_path='socket.io'
)

# Why socket-io working with this namespace, but drop error??????????
NAMESPACE = '/'
PREFIX_SIO = '================'

@sio.on('*', namespace=NAMESPACE)
async def catch_all(event, sid, data):
    log.debug(f"{PREFIX_SIO} Take signal from socketio...")

@sio.event(namespace=NAMESPACE)
async def connect(sid, environ, auth=None):
    log.debug(f"{PREFIX_SIO} Connect with {sid}")


@sio.on('message', namespace=NAMESPACE)
async def chat_message(sid, data):
    #session_data = await sio.get_session(sid)
    session_data = {'username': "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"}
    log.debug(f"{PREFIX_SIO} Take message username={session_data['username']}, message={data['message']}")
    await sio.emit('response', data)


@sio.event(namespace=NAMESPACE)
async def identify_user(sid, data):
    log.debug(f"{PREFIX_SIO} Identify user with sid={sid} and username={data}")
    await sio.save_session(sid, {'username': data})


@sio.on("change_nickname")
async def change_nickname(sid, data):
    await sio.save_session(sid, {'username': data})
    log.debug(f"{PREFIX_SIO} User change nickname to {data}")


@sio.event(namespace=NAMESPACE)
def disconnect(sid):
    log.debug(f"{PREFIX_SIO} Disconnect user with sid={sid}")



