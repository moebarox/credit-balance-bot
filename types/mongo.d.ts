type MongoAction = "insertOne" | "insertMany" | "find" | "findOne" | "updateOne" | "deleteOne" | "deleteMany" | "aggregate";

type MongoPayload = {
  collection: string;
  filter?: Record<string, any>;
  document?: Record<string, any>;
  documents?: Record<string, any>[];
  update?: Record<string, any>;
  pipeline?: Record<string, any>[];
}
