import logging
# Logger
logging.basicConfig(
    level=logging.DEBUG, format='%(levelname)s: %(asctime)s - %(funcName)s - %(message)s'
)
log = logging.getLogger('nbt')
