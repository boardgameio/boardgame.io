import { Subject } from 'rxjs';
import type { Observable } from 'rxjs';
import type { GenericPubSub, PubSubChannelId } from './generic-pub-sub';

export class InMemoryPubSub<T> implements GenericPubSub<T> {
  subjects: Map<PubSubChannelId, Subject<T>> = new Map();

  publish(channelId: PubSubChannelId, payload: T) {
    this.initializeSubject(channelId);
    const subject = this.subjects.get(channelId);
    subject.next(payload);
  }

  subscribe(channelId: PubSubChannelId): Observable<T> {
    this.initializeSubject(channelId);
    const subject = this.subjects.get(channelId);
    return subject;
  }

  private initializeSubject(channelId: PubSubChannelId) {
    if (!this.subjects.has(channelId)) {
      this.subjects.set(channelId, new Subject<T>());
    }
  }
}
