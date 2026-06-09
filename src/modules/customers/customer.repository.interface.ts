import type { Customer } from '../../types/CustomerTypes.js';

export interface CustomerRepositoryInterface {
  getAllCustomers(): Promise<Customer[]>;
}
