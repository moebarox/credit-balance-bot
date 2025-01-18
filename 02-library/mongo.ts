function doMongoRequest_(action: MongoAction, payload: MongoPayload) {
  const defaultPayload = {
    dataSource: MONGO_DATA_SOURCE,
    database: MONGO_DATABASE,
  };
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post" as GoogleAppsScript.URL_Fetch.HttpMethod,
    contentType: "application/json",
    headers: {
      "api-key": MONGO_API_KEY!,
    },
    payload: JSON.stringify({
      ...defaultPayload,
      ...payload,
    }),
  };

  const response = UrlFetchApp.fetch(
    `${MONGO_HOST}/action/${action}`,
    options
  ).getContentText();
  return JSON.parse(response);
}

function dbFind(collection: string, filter: Record<string, any>) {
  const payload = {
    collection,
    filter,
  };

  const response = doMongoRequest_("find", payload);
  return response.documents;
}

function dbFindOne(collection: string, filter: Record<string, any>) {
  const payload = {
    collection,
    filter,
  };

  const response = doMongoRequest_("findOne", payload);
  return response.document;
}

function dbInsertOne(collection: string, document: Record<string, any>) {
  const payload = {
    collection,
    document,
  };

  const response = doMongoRequest_("insertOne", payload);
  return response.insertedId;
}

function dbInsertMany(collection: string, documents: Record<string, any>[]) {
  const payload = {
    collection,
    documents,
  };

  const response = doMongoRequest_("insertMany", payload);
  return response;
}

function dbUpdateOne(
  collection: string,
  filter: Record<string, any>,
  update: Record<string, any>,
) {
  const payload = {
    collection,
    filter,
    update,
  };

  const response = doMongoRequest_("updateOne", payload);
  return response;
}

function dbDeleteMany(collection: string, filter: Record<string, any>) {
  const payload = {
    collection,
    filter,
  };

  const response = doMongoRequest_("deleteMany", payload);
  return response;
}

function dbAggregate(collection: string, pipeline: Record<string, any>[]) {
  const payload = {
    collection,
    pipeline,
  };

  const response = doMongoRequest_("aggregate", payload);
  return response.documents;
}
