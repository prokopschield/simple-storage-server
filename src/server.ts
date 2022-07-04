import { decode } from 'doge-json';
import http from 'http';
import { sanitizeRecord } from 'ps-std';

import { host, port } from './config';
import { database } from './database';
import { normalize } from './util';

/* eslint sonarjs/cognitive-complexity: 0 */
/* eslint sonarjs/no-duplicate-string: 0 */

export const listener: http.RequestListener = (request, response) => {
    const input_chunks = new Array<Buffer>();

    request.on('data', (chunk) => input_chunks.push(chunk));
    request.on('end', () => {
        try {
            const input = Buffer.concat(input_chunks);

            input_chunks.length = 0; // delete

            let name = normalize(request.url);
            const headers = sanitizeRecord(request.headers);

            if (input.length > 0) {
                const hash = database.store(input);

                const payload = JSON.stringify(
                    sanitizeRecord({
                        'content-type': headers['content-type'] || '',
                        'x-hash': hash,
                    })
                );

                if (!name || database.getCompressed(name)) {
                    name = database.store(payload);
                }

                database.set(name, payload);

                response.statusCode = 200;
                response.setHeader('x-name', name);
                response.setHeader('x-hash', hash);

                return response.end();
            } else {
                if (headers['if-modified-since']) {
                    response.statusCode = 304;

                    return response.end();
                }

                const payload = sanitizeRecord(
                    decode(database.getString(Buffer.from(name)))
                );

                if (!payload['x-hash']) {
                    response.statusCode = 404;

                    return response.end();
                }

                const give_compressed =
                    headers['accept-encoding']?.includes('deflate');

                const data = give_compressed
                    ? database.fetchCompressed(payload['x-hash'])
                    : database.fetchBuffer(payload['x-hash']);

                if (!data) {
                    response.statusCode = 410;

                    return response.end();
                }

                response.setHeader('content-type', payload['content-type']);
                response.setHeader('content-length', data.length);
                response.setHeader(
                    'content-encoding',
                    give_compressed ? 'deflate' : 'identity'
                );

                if (request.method === 'GET') {
                    response.write(data);
                }

                return response.end();
            }
        } catch {
            response.statusCode = 500;
            response.end();
        }
    });
};

export const server = http.createServer(listener);

server.listen(port, host);
