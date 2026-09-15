import { Decimal } from "@prisma/client/runtime/library";

/**
 * Converts Prisma types (Decimal, Date, etc.) to plain JSON-safe values
 * for passing from Server Components to Client Components.
 */
export function serializeForClient<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => {
      if (Decimal.isDecimal(value)) {
        return value.toNumber();
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    }),
  ) as T;
}
