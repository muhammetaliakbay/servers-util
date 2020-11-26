import {combineLatest, Observable} from 'rxjs';
import {IncomingMessage, ServerResponse} from 'http';
import {createServer as createHTTPSServer, Server as HTTPSServer, ServerOptions as HTTPSServerOptions} from 'https';
import {switchMap} from 'rxjs/operators';
import {Socket} from 'net';

class ReactiveLowServer extends Observable<HTTPSServer> {
    constructor(port: number, options: HTTPSServerOptions) {
        super(subscriber => {
            const server = createHTTPSServer(options) as HTTPSServer;

            const errorListener = (err: any) => subscriber.error(err)
            server.once('error', errorListener);

            const closeListener = () => subscriber.complete();
            server.once('close', closeListener);

            const listeningListener = () => subscriber.next(server);
            server.once('listening', listeningListener);

            server.listen({
                port,
                host: '0.0.0.0'
            });

            return () => {
                server.close();
                // do not clean listeners, there are more coming events even after it is closed :(
            };
        });
    }
}

export function reactiveServer(port$: Observable<number>, options$: Observable<HTTPSServerOptions>): Observable<HTTPSServer> {
    return combineLatest([
        port$, options$
    ]).pipe(
        switchMap(([port, options]) => new ReactiveLowServer(port, options))
    );
}

export function reactiveHTTPServerRequests(server: Observable<HTTPSServer>): Observable<[IncomingMessage, ServerResponse]> {
    return server.pipe(
        switchMap(server => new ReactiveHTTPServerRequests(server)),
    );
}

export function reactiveHTTPServerUpgradeRequests(server: Observable<HTTPSServer>): Observable<[IncomingMessage, Socket, UpgradeHead]> {
    return server.pipe(
        switchMap(server => new ReactiveHTTPServerUpgradeRequests(server)),
    );
}

class ReactiveHTTPServerRequests extends Observable<[IncomingMessage, ServerResponse]> {
    constructor(server: HTTPSServer) {
        super(subscriber => {
            const listener = (request: IncomingMessage, response: ServerResponse) => {
                subscriber.next([request, response]);
            };
            server.on('request', listener);

            return () => {
                server.removeListener('request', listener);
            }
        });
    }
}

export type UpgradeHead = string;
class ReactiveHTTPServerUpgradeRequests extends Observable<[IncomingMessage, Socket, UpgradeHead]> {
    constructor(server: HTTPSServer) {
        super(subscriber => {
            const listener = (request: IncomingMessage, socket: Socket, upgradeHead: UpgradeHead) => {
                subscriber.next([request, socket, upgradeHead]);
            };
            server.on('upgrade', listener);

            return () => {
                server.removeListener('upgrade', listener);
            }
        });
    }
}
