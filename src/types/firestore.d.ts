type FirestoreWhereOperator =
  | '=='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'contains'
  | 'contains_any'
  | 'in'
  | null;

type FirestoreOrderByDirection = 'asc' | 'desc';

type FirestoreQuery<T> = {
  Where: (
    field: string,
    operator: FirestoreWhereOperator,
    value?: any
  ) => FirestoreQuery<T>;
  OrderBy: (
    field: string,
    direction?: FirestoreOrderByDirection
  ) => FirestoreQuery<T>;
  Limit: (limit: number) => FirestoreQuery<T>;
  Offset: (offset: number) => FirestoreQuery<T>;
  Range: (start: number, end: number) => FirestoreQuery<T>;
  Execute: () => FirestoreDocument<T>[];
};

type Firestore = {
  createDocument: (collection: string, document: Record<string, any>) => void;
  updateDocument: (
    documentId: string,
    document: Record<string, any>,
    mask?: boolean | string[]
  ) => void;
  deleteDocument: (documentId: string) => void;
  getDocument: <T>(documentId: string) => FirestoreDocument<T>;
  getDocuments: <T>(collection: string) => FirestoreDocument<T>[];
  query: <T>(collection: string) => FirestoreQuery<T>;
};

type FirestoreDocument<T> = {
  obj: T;
  path: string;
};
