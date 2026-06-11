import { BaseRepository } from '../../repositories/BaseRepository';
import { Model } from 'mongoose';

describe('BaseRepository Unit Tests', () => {
  let mockModel: any;
  let repository: BaseRepository<any>;

  beforeEach(() => {
    mockModel = {
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };
    repository = new BaseRepository<any>(mockModel as unknown as Model<any>);
  });

  it('findById should query database successfully', async () => {
    const mockQuery = {
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({ _id: '123' }),
    };
    mockModel.findById.mockReturnValue(mockQuery);

    const result = await repository.findById('123');
    expect(mockModel.findById).toHaveBeenCalledWith('123');
    expect(result).toEqual({ _id: '123' });
  });

  it('findOne should query database successfully', async () => {
    const mockQuery = {
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({ name: 'test' }),
    };
    mockModel.findOne.mockReturnValue(mockQuery);

    const result = await repository.findOne({ name: 'test' });
    expect(mockModel.findOne).toHaveBeenCalledWith({ name: 'test' });
    expect(result).toEqual({ name: 'test' });
  });

  it('findMany should support pagination and complex string sorting', async () => {
    const mockFindQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([{ name: 'item1' }]),
    };
    mockModel.find.mockReturnValue(mockFindQuery);

    const mockCountQuery = {
      exec: jest.fn().mockResolvedValue(15),
    };
    mockModel.countDocuments.mockReturnValue(mockCountQuery);

    const result = await repository.findMany(
      { category: 'transport' },
      { page: 2, limit: 5, sort: 'name,-date' }
    );

    expect(mockModel.find).toHaveBeenCalledWith({ category: 'transport' });
    expect(mockFindQuery.sort).toHaveBeenCalledWith({ name: 1, date: -1 });
    expect(mockFindQuery.skip).toHaveBeenCalledWith(5); // page 2 skip 5
    expect(mockFindQuery.limit).toHaveBeenCalledWith(5);
    expect(mockModel.countDocuments).toHaveBeenCalledWith({ category: 'transport' });

    expect(result).toEqual({
      data: [{ name: 'item1' }],
      total: 15,
      page: 2,
      limit: 5,
      totalPages: 3,
    });
  });

  it('findMany should fallback to default sorting map if options.sort is an object', async () => {
    const mockFindQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };
    mockModel.find.mockReturnValue(mockFindQuery);

    const mockCountQuery = {
      exec: jest.fn().mockResolvedValue(0),
    };
    mockModel.countDocuments.mockReturnValue(mockCountQuery);

    await repository.findMany({}, { sort: { score: 1 } });
    expect(mockFindQuery.sort).toHaveBeenCalledWith({ score: 1 });
  });

  it('create should insert and return document as object', async () => {
    const mockDoc = {
      toObject: jest.fn().mockReturnValue({ _id: 'new-doc', name: 'created' }),
    };
    mockModel.create.mockResolvedValue(mockDoc);

    const result = await repository.create({ name: 'created' });
    expect(mockModel.create).toHaveBeenCalledWith({ name: 'created' });
    expect(result).toEqual({ _id: 'new-doc', name: 'created' });
  });

  it('updateById should execute findByIdAndUpdate with validation', async () => {
    const mockQuery = {
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({ _id: '123', updated: true }),
    };
    mockModel.findByIdAndUpdate.mockReturnValue(mockQuery);

    const result = await repository.updateById('123', { name: 'new name' });
    expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
      '123',
      { name: 'new name' },
      { new: true, runValidators: true }
    );
    expect(result).toEqual({ _id: '123', updated: true });
  });

  it('deleteById should execute findByIdAndDelete', async () => {
    const mockQuery = {
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({ _id: '123', deleted: true }),
    };
    mockModel.findByIdAndDelete.mockReturnValue(mockQuery);

    const result = await repository.deleteById('123');
    expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('123');
    expect(result).toEqual({ _id: '123', deleted: true });
  });

  it('count should query Mongoose countDocuments', async () => {
    const mockQuery = {
      exec: jest.fn().mockResolvedValue(42),
    };
    mockModel.countDocuments.mockReturnValue(mockQuery);

    const result = await repository.count({ category: 'food' });
    expect(mockModel.countDocuments).toHaveBeenCalledWith({ category: 'food' });
    expect(result).toBe(42);
  });
});
