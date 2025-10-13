import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private storage = inject(Storage);
  private store!: Storage;

  async init() {
    if (this.store) {
      return;
    }
    this.store = await this.storage.create();
  }

  set<T>(key: string, value: T): Promise<void> {
    return this.store.set(key, value as any);
  }
  get<T>(key: string): Promise<T | null> {
    return this.store.get(key);
  }
  remove(key: string): Promise<void> {
    return this.store.remove(key);
  }
  clear(): Promise<void> {
    return this.store.clear();
  }
  keys(): Promise<string[]> {
    return this.store.keys();
  }
}
