import { Subject } from 'rxjs';
import type { Observable } from 'rxjs';
import type { GenericPubSub, PubSubChannelId } from './generic-pub-sub';
import { globalChannelId } from './util';

export class InMemoryPubSub<T> implements GenericPubSub<T> {
  subjects: Map<string, Subject<T>> = new Map();

  publish(channelId: PubSubChannelId, payload: T) {
    this.initializeSubject(channelId);
    const subject = this.subjects.get(globalChannelId(channelId));
    subject.next(payload);
  }

  subscribe(channelId: PubSubChannelId): Observable<T> {
    this.initializeSubject(channelId);
    const subject = this.subjects.get(globalChannelId(channelId));
    return subject;
  }

  unsubscribe(channelId: PubSubChannelId) {
    if (this.subjects.has(globalChannelId(channelId))) {
      this.subjects.get(globalChannelId(channelId)).unsubscribe();
      this.subjects.delete(globalChannelId(channelId));
    }
  }

  private initializeSubject(channelId: PubSubChannelId) {
    if (!this.subjects.has(globalChannelId(channelId))) {
      this.subjects.set(globalChannelId(channelId), new Subject<T>());
    }
  }
}
