import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import {
  requirePositiveInt,
  optionalPositiveNumber,
  parsePagination,
} from '../middleware/validate';
import { ProductQuery } from '../types';
import { AppError } from '../utils/AppError';

const ALLOWED_SORTS: ProductQuery['sort'][] = [
  'price_asc',
  'price_desc',
  'rating',
  'newest',
];

export const productController = {
  async list(req: Request, res: Response): Promise<void> {
    const q = req.query as Record<string, unknown>;
    const { page, limit } = parsePagination(q);

    const sortRaw = typeof q.sort === 'string' ? q.sort : undefined;
    if (sortRaw && !ALLOWED_SORTS.includes(sortRaw as ProductQuery['sort'])) {
      throw AppError.badRequest(
        `sort must be one of: ${ALLOWED_SORTS.join(', ')}`,
      );
    }

    const query: ProductQuery = {
      search:
        typeof q.search === 'string' && q.search.trim() !== ''
          ? q.search.trim()
          : undefined,
      category:
        typeof q.category === 'string' && q.category.trim() !== ''
          ? q.category.trim()
          : undefined,
      minPrice: optionalPositiveNumber(q.minPrice, 'minPrice'),
      maxPrice: optionalPositiveNumber(q.maxPrice, 'maxPrice'),
      sort: sortRaw as ProductQuery['sort'] | undefined,
      page,
      limit,
    };

    const result = await productService.list(query);
    res.status(200).json({ success: true, ...result });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = requirePositiveInt(req.params.id, 'product id');
    const product = await productService.getById(id);
    res.status(200).json({ success: true, data: { product } });
  },
};
