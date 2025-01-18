type DataAPIAction =
  | 'insertOne'
  | 'insertMany'
  | 'find'
  | 'findOne'
  | 'updateOne'
  | 'deleteOne'
  | 'deleteMany'
  | 'aggregate';

type DataAPIPayload = {
  collection: string;
  filter?: Record<string, any>;
  document?: Record<string, any>;
  documents?: Record<string, any>[];
  update?: Record<string, any>;
  pipeline?: Record<string, any>[];
};

type MongoObjectID = {
  $oid: string;
};

type MongoNumberLong = {
  $numberLong: string;
};
