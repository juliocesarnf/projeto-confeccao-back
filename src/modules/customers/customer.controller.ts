import type { Request, Response } from 'express';
import { CustomerService } from './customer.service.js';
import { CustomerRepositoryPg } from './customer.repository.pg.js';

const service = new CustomerService(new CustomerRepositoryPg());

export class CustomerController {
  async getAllCustomers(_req: Request, res: Response) {
    const data = await service.getAllCustomers();
    return res.json(data);
  }
}
