/**
 * A map-like cache with a fixed capacity that evicts the least recently used
 * item when out of space.
 */
export class Cache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error('Cache capacity must be greater than 0');
    }
    this.capacity = capacity;
    this.cache = new Map<K, V>();
  }

  /**
   * Get a value from the cache. Marks the key as recently used.
   */
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (mark as recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  /**
   * Set a value in the cache. If at capacity, evicts the least recently used item.
   */
  set(key: K, value: V): void {
    // If key already exists, update it and mark as recently used
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.cache.set(key, value);
      return;
    }

    // If at capacity, remove the least recently used item (first item)
    if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    // Add the new item
    this.cache.set(key, value);
  }

  /**
   * Check if a key exists in the cache. Does not affect LRU order.
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete a key from the cache.
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all items from the cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the current size of the cache.
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get the maximum capacity of the cache.
   */
  get maxSize(): number {
    return this.capacity;
  }

  /**
   * Check if the cache is at capacity.
   */
  get isFull(): boolean {
    return this.cache.size >= this.capacity;
  }

  /**
   * Get all keys in the cache (from least to most recently used).
   */
  keys(): IterableIterator<K> {
    return this.cache.keys();
  }

  /**
   * Get all values in the cache (from least to most recently used).
   */
  values(): IterableIterator<V> {
    return this.cache.values();
  }

  /**
   * Get all entries in the cache (from least to most recently used).
   */
  entries(): IterableIterator<[K, V]> {
    return this.cache.entries();
  }

  /**
   * Convert the cache to an array of key-value pairs.
   */
  toArray(): [K, V][] {
    return Array.from(this.cache.entries());
  }

  /**
   * Get a string representation of the cache.
   */
  toString(): string {
    const entries = Array.from(this.cache.entries());
    return `Cache(${entries.length}/${this.capacity}) [${entries.map(([k, v]) => `${k}: ${v}`).join(', ')}]`;
  }
}

/**
 * Create a new LRU cache with the specified capacity.
 */
export function createCache<K, V>(capacity: number): Cache<K, V> {
  return new Cache<K, V>(capacity);
}

export default Cache;
