import { Model, Document, FilterQuery, UpdateQuery, SortOrder } from 'mongoose';
import type { IPaginatedResponse } from '../types';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '../utils/constants';

export interface FindManyOptions {
  page?: number;
  limit?: number;
  sort?: string | Record<string, SortOrder>;
}

export class BaseRepository<T extends Document> {
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  /**
   * Finds a document by its unique database ID.
   * 
   * @param id - The hexadecimal string ID of the document.
   * @returns A promise resolving to the document if found, or null otherwise.
   */
  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).lean<T>().exec();
  }

  /**
   * Finds a single document matching the specified query filter criteria.
   * 
   * @param filter - The Mongoose query filter object.
   * @returns A promise resolving to the matching document, or null if none is found.
   */
  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).lean<T>().exec();
  }

  /**
   * Finds and paginates multiple documents matching the query filter criteria.
   * Supports sorting options (e.g. comma-separated fields, sorting order maps).
   * 
   * @param filter - The Mongoose query filter object. Defaults to an empty object.
   * @param options - Pagination options (page, limit) and sorting specifications.
   * @returns A promise resolving to a paginated response object containing matching documents and metadata.
   */
  async findMany(
    filter: FilterQuery<T> = {},
    options: FindManyOptions = {},
  ): Promise<IPaginatedResponse<T>> {
    const page = options.page ?? DEFAULT_PAGE;
    const limit = options.limit ?? DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    let sortOption: Record<string, SortOrder> = { createdAt: -1 };
    if (typeof options.sort === 'string') {
      const sortFields: Record<string, SortOrder> = {};
      options.sort.split(',').forEach((field) => {
        const trimmed = field.trim();
        if (trimmed.startsWith('-')) {
          sortFields[trimmed.slice(1)] = -1;
        } else {
          sortFields[trimmed] = 1;
        }
      });
      sortOption = sortFields;
    } else if (options.sort) {
      sortOption = options.sort;
    }

    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sortOption).skip(skip).limit(limit).lean<T[]>().exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Inserts a new document into the collection.
   * 
   * @param data - The partial object data matching the schema of the document.
   * @returns A promise resolving to the created document.
   */
  async create(data: Partial<T>): Promise<T> {
    const doc = await this.model.create(data);
    return doc.toObject() as T;
  }

  /**
   * Updates an existing document matching the specified ID with update query operators.
   * 
   * @param id - The unique ID of the document.
   * @param data - The Mongoose update query payload.
   * @returns A promise resolving to the updated document, or null if the document was not found.
   */
  async updateById(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .lean<T>()
      .exec();
  }

  /**
   * Deletes a single document by its unique ID.
   * 
   * @param id - The unique ID of the document to delete.
   * @returns A promise resolving to the deleted document, or null if it was not found.
   */
  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).lean<T>().exec();
  }

  /**
   * Counts the number of documents in the collection matching the query criteria.
   * 
   * @param filter - The Mongoose query filter object. Defaults to an empty object.
   * @returns A promise resolving to the count of matching documents.
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}
