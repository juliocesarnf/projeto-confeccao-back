import { db } from '../../database/db.js';
import type { CustomerRepositoryInterface } from './customer.repository.interface.js';
import type { Customer } from '../../types/CustomerTypes.js';

export class CustomerRepositoryPg implements CustomerRepositoryInterface {
  async getAllCustomers(): Promise<Customer[]> {
    const result = await db.query<Customer>(
      `SELECT id, name, phone, created_at AS "createdAt" FROM customer ORDER BY name`
    );
    return result.rows;
  }
}
