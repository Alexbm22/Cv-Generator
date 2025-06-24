
const DB_NAME = 'myApp-v1';
const DB_VERSION = 1;

export class IndexedDBService {
    private dbName: string;
    private storeName: string;
    private version: number = 1;
    private db: IDBDatabase | null = null;

    constructor(
        storeName: string, 
        dbName: string = DB_NAME, 
        version: number = DB_VERSION
    ) {
        this.dbName = dbName;
        this.storeName = storeName;
        if (version) {
            this.version = version;
        }
    }

    private async initDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result
                resolve();
            };

            request.onerror = (event) => {
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    }

    public async set<T>(key: string, value: T): Promise<void> {
        if(!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const checkRequest = store.get(key); // Check if the key already exists
            checkRequest.onsuccess = () => {
                if (checkRequest.result !== undefined) {
                    const updateRequest = store.put(value, key);
                    updateRequest.onsuccess = () => resolve();
                    updateRequest.onerror = (event) => reject((event.target as IDBRequest).error);
                } else {
                    const addRequest = store.add(value, key);
                    addRequest.onsuccess = () => resolve();
                    addRequest.onerror = (event) => reject((event.target as IDBRequest).error);
                }
            };
            checkRequest.onerror = (event) => {
                reject((event.target as IDBRequest).error);
            };
        });
    }

    public async get<T>(key: string): Promise<T | null> {
        
        if(!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject((event.target as IDBRequest).error);
            };
        });
    }

    public async getAll<T>(): Promise<T> {
        if(!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result as T);
            };

            request.onerror = (event) => {
                reject((event.target as IDBRequest).error);
            };
        });
    }

    public async del(key: string): Promise<void> {
        if(!this.db) await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const request = store.delete(key);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                reject((event.target as IDBRequest).error);
            };
        });
    }

}