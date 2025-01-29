namespace Firestore {
  // @ts-ignore
  const firestore: Firestore = FirestoreApp.getFirestore(
    SA_EMAIL!,
    SA_PRIVATE_KEY!,
    SA_PROJECT_ID!
  );

  export function getDocument<T>(documentId: string) {
    return firestore.getDocument<T>(documentId);
  }

  export function getDocuments<T>(collection: string, ids?: string[]) {
    return firestore.getDocuments<T>(collection, ids);
  }

  export function query<T>(collection: string) {
    return firestore.query<T>(collection);
  }

  export function createDocument(
    collection: string,
    document: Record<string, any>
  ) {
    return firestore.createDocument(collection, document);
  }

  export function updateDocument(
    documentId: string,
    document: Record<string, any>,
    mask?: boolean | string[]
  ) {
    return firestore.updateDocument(documentId, document, mask);
  }

  export function deleteDocument(documentId: string) {
    return firestore.deleteDocument(documentId);
  }
}

globalThis.Firestore = Firestore;
