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

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).lean<T>().exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).lean<T>().exec();
  }

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

  async create(data: Partial<T>): Promise<T> {
    const doc = await this.model.create(data);
    return doc.toObject() as T;
  }

  async updateById(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .lean<T>()
      .exec();
  }

  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).lean<T>().exec();
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}
