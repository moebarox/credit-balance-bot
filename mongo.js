function doMongoRequest_(action, payload) {
  const defaultPayload = {
    dataSource: MONGO_DATA_SOURCE,
    database: MONGO_DATABASE,
  };
  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "api-key": MONGO_API_KEY,
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

function dbFind(collection, filter) {
  const payload = {
    collection,
    filter,
  };

  const response = doMongoRequest_("find", payload);
  return response.documents;
}

function dbFindOne(collection, filter) {
  const payload = {
    collection,
    filter,
  };

  const response = doMongoRequest_("findOne", payload);
  return response.document;
}

function dbInsertOne(collection, document) {
  const payload = {
    collection,
    document,
  };

  const response = doMongoRequest_("insertOne", payload);
  return response.insertedId;
}

function dbInsertMany(collection, documents) {
  const payload = {
    collection,
    documents,
  };

  const response = doMongoRequest_("insertMany", payload);
  return response;
}

function dbUpdateOne(collection, filter, update) {
  const payload = {
    collection,
    filter,
    update,
  };

  const response = doMongoRequest_("updateOne", payload);
  return response;
}

function dbDeleteMany(collection, filter) {
  const payload = {
    collection,
    filter,
  };

  const response = doMongoRequest_("deleteMany", payload);
  return response;
}
