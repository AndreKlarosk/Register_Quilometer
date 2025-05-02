import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@7.1.1/+esm';

const DB_NAME = 'quilio-db';
const STORE_NAME = 'records';

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('atm', 'atm');
        store.createIndex('date', 'dateTime');
        store.createIndex('lat', 'latitude');
        store.createIndex('lng', 'longitude');
      }
    },
  });
}

export async function addRecord(record) {
  const db = await initDB();
  return db.add(STORE_NAME, record);
}

export async function getRecords() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function deleteRecord(id) {
  const db = await initDB();
  return db.delete(STORE_NAME, id);
}

export async function updateRecord(id, updatedRecord) {
  const db = await initDB();
  return db.put(STORE_NAME, { ...updatedRecord, id });
}
