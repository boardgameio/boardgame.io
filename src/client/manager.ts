import Debug from './debug/Debug.svelte';
import type { _ClientImpl } from './client';

type SubscriptionState = {
  client: _ClientImpl;
  debuggableClients: _ClientImpl[];
};
type SubscribeCallback = (arg: SubscriptionState) => void;
type UnsubscribeCallback = () => void;

/**
 * Class to manage boardgame.io clients and limit debug panel rendering.
 */
export class ClientManager {
  private debugPanel: Debug | null;
  private currentClient: _ClientImpl | null;
  private clients: Map<_ClientImpl, _ClientImpl>;
  private subscribers: Map<symbol, SubscribeCallback>;

  constructor() {
    this.debugPanel = null;
    this.currentClient = null;
    this.clients = new Map();
    this.subscribers = new Map();
  }

  /**
   * Register a client with the client manager.
   */
  register(client: _ClientImpl): void {
    // Add client to clients map.
    this.clients.set(client, client);
    // Mount debug for this client (no-op if another debug is already mounted).
    this.mountDebug(client);
    this.notifySubscribers();
  }

  /**
   * Unregister a client from the client manager.
   */
  unregister(client: _ClientImpl): void {
    // Remove client from clients map.
    this.clients.delete(client);

    if (this.currentClient === client) {
      // If the removed client owned the debug panel, unmount it.
      this.unmountDebug();
      // Mount debug panel for next available client.
      for (const [client] of this.clients) {
        if (this.debugPanel) break;
        this.mountDebug(client);
      }
    }

    this.notifySubscribers();
  }

  /**
   * Subscribe to the client manager state.
   * Calls the passed callback each time the current client changes or a client
   * registers/unregisters.
   * Returns a function to unsubscribe from the state updates.
   */
  subscribe(callback: SubscribeCallback): UnsubscribeCallback {
    const id = Symbol();
    this.subscribers.set(id, callback);
    callback(this.getState());
    return () => {
      this.subscribers.delete(id);
    };
  }

  /**
   * Switch to a client with a matching playerID.
   */
  switchPlayerID(playerID: string): void {
    // For multiplayer clients, try switching control to a different client
    // that is using the same transport layer.
    if (this.currentClient.multiplayer) {
      for (const [client] of this.clients) {
        if (
          client.playerID === playerID &&
          client.debugOpt !== false &&
          client.multiplayer === this.currentClient.multiplayer
        ) {
          this.switchToClient(client);
          return;
        }
      }
    }

    // If no client matches, update the playerID for the current client.
    this.currentClient.updatePlayerID(playerID);
    this.notifySubscribers();
  }

  /**
   * Set the passed client as the active client for debugging.
   */
  switchToClient(client: _ClientImpl): void {
    if (client === this.currentClient) return;
    this.unmountDebug();
    this.mountDebug(client);
    this.notifySubscribers();
  }

  /**
   * Notify all subscribers of changes to the client manager state.
   */
  private notifySubscribers(): void {
    const arg = this.getState();
    this.subscribers.forEach((cb) => {
      cb(arg);
    });
  }

  /**
   * Get the client manager state.
   */
  private getState(): SubscriptionState {
    return {
      client: this.currentClient,
      debuggableClients: this.getDebuggableClients(),
    };
  }

  /**
   * Get an array of the registered clients that haven’t disabled the debug panel.
   */
  private getDebuggableClients(): _ClientImpl[] {
    return [...this.clients.values()].filter(
      (client) => client.debugOpt !== false
    );
  }

  /**
   * Mount the debug panel using the passed client.
   */
  private mountDebug(client: _ClientImpl): void {
    if (
      client.debugOpt === false ||
      this.debugPanel !== null ||
      typeof document === 'undefined'
    ) {
      return;
    }

    let DebugImpl: typeof Debug | undefined;
    let target = document.body;

    if (process.env.NODE_ENV !== 'production') {
      DebugImpl = Debug;
    }

    if (client.debugOpt && client.debugOpt !== true) {
      DebugImpl = client.debugOpt.impl || DebugImpl;
      target = client.debugOpt.target || target;
    }

    if (DebugImpl) {
      this.currentClient = client;
      this.debugPanel = new DebugImpl({
        target,
        props: { clientManager: this },
      });
    }
  }

  /**
   * Unmount the debug panel.
   */
  private unmountDebug(): void {
    this.debugPanel.$destroy();
    this.debugPanel = null;
    this.currentClient = null;
  }
}
