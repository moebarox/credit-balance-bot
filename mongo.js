const MONGO_HOST =
  "https://ap-southeast-1.aws.data.mongodb-api.com/app/data-gzgsj/endpoint/data/v1/action/";
const DATABASE = "bowobot";
const DATA_SOURCE = "bowobot";

function doMongoRequest_(action, payload) {
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    headers: {
      "api-key":
        PropertiesService.getScriptProperties().getProperty("MONGO_API_KEY"),
    },
  };
  return UrlFetchApp.fetch(MONGO_HOST + action, options).getContentText();
}

function dbFind(collection, filter) {
  const payload = {
    dataSource: DATA_SOURCE,
    database: DATABASE,
    collection,
    filter,
  };

  const response = doMongoRequest_("find", payload);
  return JSON.parse(response).documents;
}

function dbFindOne(collection, filter) {
  const payload = {
    dataSource: DATA_SOURCE,
    database: DATABASE,
    collection,
    filter,
  };

  const response = doMongoRequest_("findOne", payload);
  return JSON.parse(response).document;
}

function dbUpdateOne(collection, filter, update) {
  const payload = {
    dataSource: DATA_SOURCE,
    database: DATABASE,
    collection,
    filter,
    update,
  };

  const response = doMongoRequest_("updateOne", payload);
  return JSON.parse(response);
}
