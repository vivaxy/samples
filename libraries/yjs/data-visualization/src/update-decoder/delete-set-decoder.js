/**
 * @since 2021-07-08
 * @author vivaxy
 */
import * as decoding from 'lib0/decoding';

export default function readDeleteSet(decoder) {
  if (!(decoder instanceof decoding.Decoder)) {
    decoder = decoding.createDecoder(decoder);
  }
  const ds = {
    clients: {},
  };
  const numClients = decoding.readVarUint(decoder);
  for (let i = 0; i < numClients; i++) {
    const client = decoding.readVarUint(decoder);
    const numberOfDeletes = decoding.readVarUint(decoder);
    if (numberOfDeletes > 0) {
      ds.clients[client] = [];
      for (let i = 0; i < numberOfDeletes; i++) {
        ds.clients[client].push({
          clock: decoding.readVarUint(decoder),
          length: decoding.readVarUint(decoder),
        });
      }
    }
  }
  return ds;
}
