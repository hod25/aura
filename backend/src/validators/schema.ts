/**
 * A tiny, dependency-free declarative validation engine.
 *
 * It provides a Zod-like, chainable builder for describing the expected
 * shape of untrusted input. Schemas are pure data: they parse, coerce and
 * collect *all* field errors in a single pass (rather than throwing on the
 * first failure), which produces far better API error responses.
 *
 * Kept intentionally small to honour the "minimize external runtime
 * dependencies" constraint while remaining strictly typed.
 */

/** A single field-level validation failure. */
export interface FieldError {
  field: string;
  message: string;
}

/** Outcome of validating a value/object against a schema. */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: FieldError[] };

/** Internal per-field outcome used while walking a schema. */
type FieldResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

/** Base class for every field schema. */
export abstract class FieldSchema<T> {
  protected isOptional = false;
  protected defaultValue: T | undefined;

  /** Marks the field as optional (absent/empty values yield `undefined`). */
  optional(): FieldSchema<T | undefined> {
    this.isOptional = true;
    return this as unknown as FieldSchema<T | undefined>;
  }

  /** Provides a fallback used when the field is absent/empty. */
  default(value: T): FieldSchema<T> {
    this.defaultValue = value;
    this.isOptional = true;
    return this;
  }

  /** Validates and coerces a single value. */
  parse(value: unknown, field: string): FieldResult<T> {
    const isAbsent =
      value === undefined || value === null || value === '';
    if (isAbsent) {
      if (this.defaultValue !== undefined) {
        return { ok: true, value: this.defaultValue };
      }
      if (this.isOptional) {
        return { ok: true, value: undefined as unknown as T };
      }
      return { ok: false, message: `${field} is required` };
    }
    return this.check(value, field);
  }

  /** Concrete type checking/coercion implemented by subclasses. */
  protected abstract check(value: unknown, field: string): FieldResult<T>;
}

class StringSchema extends FieldSchema<string> {
  private minLen?: number;
  private maxLen?: number;
  private pattern?: { re: RegExp; message: string };
  private doTrim = true;
  private doLowercase = false;

  min(n: number): this {
    this.minLen = n;
    return this;
  }
  max(n: number): this {
    this.maxLen = n;
    return this;
  }
  matches(re: RegExp, message: string): this {
    this.pattern = { re, message };
    return this;
  }
  trim(on = true): this {
    this.doTrim = on;
    return this;
  }
  lowercase(on = true): this {
    this.doLowercase = on;
    return this;
  }

  protected check(value: unknown, field: string): FieldResult<string> {
    if (typeof value !== 'string') {
      return { ok: false, message: `${field} must be a string` };
    }
    let out = this.doTrim ? value.trim() : value;
    if (this.doLowercase) out = out.toLowerCase();

    if (this.minLen !== undefined && out.length < this.minLen) {
      return {
        ok: false,
        message: `${field} must be at least ${this.minLen} character(s)`,
      };
    }
    if (this.maxLen !== undefined && out.length > this.maxLen) {
      return {
        ok: false,
        message: `${field} must be at most ${this.maxLen} character(s)`,
      };
    }
    if (this.pattern && !this.pattern.re.test(out)) {
      return { ok: false, message: this.pattern.message };
    }
    return { ok: true, value: out };
  }
}

class NumberSchema extends FieldSchema<number> {
  private minVal?: number;
  private maxVal?: number;
  private mustBeInt = false;

  int(): this {
    this.mustBeInt = true;
    return this;
  }
  min(n: number): this {
    this.minVal = n;
    return this;
  }
  max(n: number): this {
    this.maxVal = n;
    return this;
  }

  protected check(value: unknown, field: string): FieldResult<number> {
    const num =
      typeof value === 'number' ? value : Number(String(value).trim());
    if (Number.isNaN(num) || !Number.isFinite(num)) {
      return { ok: false, message: `${field} must be a number` };
    }
    if (this.mustBeInt && !Number.isInteger(num)) {
      return { ok: false, message: `${field} must be an integer` };
    }
    if (this.minVal !== undefined && num < this.minVal) {
      return { ok: false, message: `${field} must be >= ${this.minVal}` };
    }
    if (this.maxVal !== undefined && num > this.maxVal) {
      return { ok: false, message: `${field} must be <= ${this.maxVal}` };
    }
    return { ok: true, value: num };
  }
}

class EnumSchema<T extends string> extends FieldSchema<T> {
  constructor(private readonly values: readonly T[]) {
    super();
  }
  protected check(value: unknown, field: string): FieldResult<T> {
    if (typeof value !== 'string' || !this.values.includes(value as T)) {
      return {
        ok: false,
        message: `${field} must be one of: ${this.values.join(', ')}`,
      };
    }
    return { ok: true, value: value as T };
  }
}

class ArraySchema<T> extends FieldSchema<T[]> {
  private minLen?: number;
  private maxLen?: number;

  constructor(private readonly element: FieldSchema<T>) {
    super();
  }
  min(n: number): this {
    this.minLen = n;
    return this;
  }
  max(n: number): this {
    this.maxLen = n;
    return this;
  }
  protected check(value: unknown, field: string): FieldResult<T[]> {
    if (!Array.isArray(value)) {
      return { ok: false, message: `${field} must be an array` };
    }
    if (this.minLen !== undefined && value.length < this.minLen) {
      return { ok: false, message: `${field} must have at least ${this.minLen} item(s)` };
    }
    if (this.maxLen !== undefined && value.length > this.maxLen) {
      return { ok: false, message: `${field} must have at most ${this.maxLen} item(s)` };
    }
    const out: T[] = [];
    for (let i = 0; i < value.length; i += 1) {
      const result = this.element.parse(value[i], `${field}[${i}]`);
      if (!result.ok) return { ok: false, message: result.message };
      out.push(result.value);
    }
    return { ok: true, value: out };
  }
}

/** An object schema maps field names to field schemas. */
export type ObjectShape = Record<string, FieldSchema<unknown>>;

/** Infers the validated output type of an object shape. */
export type Infer<S extends ObjectShape> = {
  [K in keyof S]: S[K] extends FieldSchema<infer T> ? T : never;
};

export class ObjectSchema<S extends ObjectShape> {
  constructor(public readonly shape: S) {}

  /** Validates an object, collecting every field error. */
  validate(input: unknown): ValidationResult<Infer<S>> {
    const source = (
      typeof input === 'object' && input !== null ? input : {}
    ) as Record<string, unknown>;

    const errors: FieldError[] = [];
    const data = {} as Infer<S>;

    for (const field of Object.keys(this.shape)) {
      const schema = this.shape[field];
      if (!schema) continue;
      const result = schema.parse(source[field], field);
      if (result.ok) {
        (data as Record<string, unknown>)[field] = result.value;
      } else {
        errors.push({ field, message: result.message });
      }
    }

    if (errors.length > 0) return { success: false, errors };
    return { success: true, data };
  }
}

/** Adapts an `ObjectSchema` so it can be used as a (possibly nested) field. */
class ObjectFieldSchema<S extends ObjectShape> extends FieldSchema<Infer<S>> {
  constructor(private readonly inner: ObjectSchema<S>) {
    super();
  }
  protected check(value: unknown, field: string): FieldResult<Infer<S>> {
    const result = this.inner.validate(value);
    if (result.success) return { ok: true, value: result.data };
    const message = result.errors
      .map((e) => `${field}.${e.field}: ${e.message}`)
      .join('; ');
    return { ok: false, message };
  }
}

/** Fluent factory for building schemas: `v.string()`, `v.object({...})`. */
export const v = {
  string: (): StringSchema => new StringSchema(),
  number: (): NumberSchema => new NumberSchema(),
  enum: <T extends string>(values: readonly T[]): EnumSchema<T> =>
    new EnumSchema(values),
  object: <S extends ObjectShape>(shape: S): ObjectSchema<S> =>
    new ObjectSchema(shape),
  /** An object usable as a nested field (e.g. an array element). */
  objectField: <S extends ObjectShape>(shape: S): ObjectFieldSchema<S> =>
    new ObjectFieldSchema(new ObjectSchema(shape)),
  array: <T>(element: FieldSchema<T>): ArraySchema<T> =>
    new ArraySchema(element),
};

