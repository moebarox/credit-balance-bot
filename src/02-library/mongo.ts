namespace MongoDB {
  function doMongoRequest_<T>(
    action: DataAPIAction,
    payload: DataAPIPayload
  ): T {
    const defaultPayload = {
      dataSource: MONGO_DATA_SOURCE,
      database: MONGO_DATABASE,
    };
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'post' as GoogleAppsScript.URL_Fetch.HttpMethod,
      contentType: 'application/json',
      headers: {
        'api-key': MONGO_API_KEY!,
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

  export function find<T>(
    collection: string,
    filter: Record<string, any>
  ): T[] {
    const payload = {
      collection,
      filter,
    };

    const response = doMongoRequest_<DataAPIResponse<T>>('find', payload);
    return response.documents!;
  }

  export function findOne<T>(
    collection: string,
    filter: Record<string, any>
  ): T | undefined {
    const payload = {
      collection,
      filter,
    };

    const response = doMongoRequest_<DataAPIResponse<T>>('findOne', payload);
    return response.document;
  }

  export function insertOne<T>(
    collection: string,
    document: Record<string, any>
  ): string {
    const payload = {
      collection,
      document,
    };

    const response = doMongoRequest_<DataAPIResponse<T>>('insertOne', payload);
    return response.insertedId!;
  }

  export function insertMany<T>(
    collection: string,
    documents: Record<string, any>[]
  ): DataAPIResponse<T> {
    const payload = {
      collection,
      documents,
    };

    const response = doMongoRequest_<DataAPIResponse<T>>('insertMany', payload);
    return response;
  }

  export function updateOne<T>(
    collection: string,
    filter: Record<string, any>,
    update: Record<string, any>
  ): DataAPIResponse<T> {
    const payload = {
      collection,
      filter,
      update,
    };

    const response = doMongoRequest_<DataAPIResponse<T>>('updateOne', payload);
    return response;
  }

  export function deleteMany<T>(
    collection: string,
    filter: Record<string, any>
  ): DataAPIResponse<T> {
    const payload = {
      collection,
      filter,
    };

    const response = doMongoRequest_<DataAPIResponse<T>>('deleteMany', payload);
    return response;
  }

  export function aggregate<T>(
    collection: string,
    pipeline: Record<string, any>[]
  ): T[] {
    const payload = {
      collection,
      pipeline,
    };

    const response = doMongoRequest_<DataAPIResponse<T>>('aggregate', payload);
    return response.documents!;
  }
}

(globalThis as any).MongoDB = MongoDB;
