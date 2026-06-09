import type { CustomerRepositoryInterface } from './customer.repository.interface.js';

export class CustomerService {
  constructor(private readonly repository: CustomerRepositoryInterface) {}

  async getAllCustomers() {
    return this.repository.getAllCustomers();
  }
}
