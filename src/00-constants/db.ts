enum DBConnection {
  MongoDB = 'mongodb',
  Firestore = 'firestore',
}

(globalThis as any).DBConnection = DBConnection;
