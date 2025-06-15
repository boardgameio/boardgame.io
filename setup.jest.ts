// https://stackoverflow.com/a/68468204

import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });
