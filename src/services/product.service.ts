import { productRepository } from '../repositories/product.repository';
import { AppError } from '../utils/AppError';
import { Product, ProductQuery } from '../types';

export const productService = {
  async list(query: ProductQuery): Promise<{
    items: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (
      query.minPrice !== undefined &&
      query.maxPrice !== undefined &&
      query.minPrice > query.maxPrice
    ) {
      throw AppError.badRequest('minPrice cannot be greater than maxPrice');
    }

    const { items, total } = await productRepository.search(query);
    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    };
  },

  async getById(id: number): Promise<Product> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found');
    }
    return product;
  },
};
