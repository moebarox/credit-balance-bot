import './mongo';

describe('MongoDB library', () => {
  let mockFetch: jest.Mock;
  let mockGetContentText: jest.Mock;

  beforeEach(() => {
    mockGetContentText = jest.fn();
    mockFetch = jest.fn(() => ({
      getContentText: mockGetContentText,
    }));
    (globalThis as any).UrlFetchApp = {
      fetch: mockFetch,
    };
    (globalThis as any).MONGO_API_KEY = 'test_api_key';
    (globalThis as any).MONGO_HOST = 'https://test.mongodb.com';
    (globalThis as any).MONGO_DATA_SOURCE = 'test_source';
    (globalThis as any).MONGO_DATABASE = 'test_db';
  });

  describe('find', () => {
    it('should find documents with filter', () => {
      const mockResponse = { documents: [{ _id: '1', name: 'test' }] };
      mockGetContentText.mockReturnValue(JSON.stringify(mockResponse));

      const result = globalThis.MongoDB.find('test_collection', {
        name: 'test',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.mongodb.com/action/find',
        {
          method: 'post',
          contentType: 'application/json',
          headers: {
            'api-key': 'test_api_key',
          },
          payload: JSON.stringify({
            dataSource: 'test_source',
            database: 'test_db',
            collection: 'test_collection',
            filter: { name: 'test' },
          }),
        }
      );
      expect(result).toEqual([{ _id: '1', name: 'test' }]);
    });
  });

  describe('findOne', () => {
    it('should find one document with filter', () => {
      const mockResponse = { document: { _id: '1', name: 'test' } };
      mockGetContentText.mockReturnValue(JSON.stringify(mockResponse));

      const result = globalThis.MongoDB.findOne('test_collection', {
        _id: '1',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.mongodb.com/action/findOne',
        expect.objectContaining({
          payload: JSON.stringify({
            dataSource: 'test_source',
            database: 'test_db',
            collection: 'test_collection',
            filter: { _id: '1' },
          }),
        })
      );
      expect(result).toEqual({ _id: '1', name: 'test' });
    });
  });

  describe('insertOne', () => {
    it('should insert one document', () => {
      const mockResponse = { insertedId: '1' };
      mockGetContentText.mockReturnValue(JSON.stringify(mockResponse));

      const result = globalThis.MongoDB.insertOne('test_collection', {
        name: 'test',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.mongodb.com/action/insertOne',
        expect.objectContaining({
          payload: JSON.stringify({
            dataSource: 'test_source',
            database: 'test_db',
            collection: 'test_collection',
            document: { name: 'test' },
          }),
        })
      );
      expect(result).toBe('1');
    });
  });

  describe('insertMany', () => {
    it('should insert multiple documents', () => {
      const mockResponse = { insertedIds: ['1', '2'] };
      mockGetContentText.mockReturnValue(JSON.stringify(mockResponse));

      const result = globalThis.MongoDB.insertMany('test_collection', [
        { name: 'test1' },
        { name: 'test2' },
      ]);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.mongodb.com/action/insertMany',
        expect.objectContaining({
          payload: JSON.stringify({
            dataSource: 'test_source',
            database: 'test_db',
            collection: 'test_collection',
            documents: [{ name: 'test1' }, { name: 'test2' }],
          }),
        })
      );
      expect(result).toEqual({ insertedIds: ['1', '2'] });
    });
  });

  describe('updateOne', () => {
    it('should update one document', () => {
      const mockResponse = { modifiedCount: 1 };
      mockGetContentText.mockReturnValue(JSON.stringify(mockResponse));

      const result = globalThis.MongoDB.updateOne(
        'test_collection',
        { _id: '1' },
        { $set: { name: 'updated' } }
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.mongodb.com/action/updateOne',
        expect.objectContaining({
          payload: JSON.stringify({
            dataSource: 'test_source',
            database: 'test_db',
            collection: 'test_collection',
            filter: { _id: '1' },
            update: { $set: { name: 'updated' } },
          }),
        })
      );
      expect(result).toEqual({ modifiedCount: 1 });
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple documents', () => {
      const mockResponse = { deletedCount: 2 };
      mockGetContentText.mockReturnValue(JSON.stringify(mockResponse));

      const result = globalThis.MongoDB.deleteMany('test_collection', {
        name: 'test',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.mongodb.com/action/deleteMany',
        expect.objectContaining({
          payload: JSON.stringify({
            dataSource: 'test_source',
            database: 'test_db',
            collection: 'test_collection',
            filter: { name: 'test' },
          }),
        })
      );
      expect(result).toEqual({ deletedCount: 2 });
    });
  });

  describe('aggregate', () => {
    it('should perform aggregation pipeline', () => {
      const mockResponse = {
        documents: [{ _id: 'group1', total: 100 }],
      };
      mockGetContentText.mockReturnValue(JSON.stringify(mockResponse));

      const pipeline = [
        { $match: { status: 'active' } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
      ];
      const result = globalThis.MongoDB.aggregate('test_collection', pipeline);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.mongodb.com/action/aggregate',
        expect.objectContaining({
          payload: JSON.stringify({
            dataSource: 'test_source',
            database: 'test_db',
            collection: 'test_collection',
            pipeline,
          }),
        })
      );
      expect(result).toEqual([{ _id: 'group1', total: 100 }]);
    });
  });
});
