export interface EmployeeRepositoryInterface {
  findAllEmployees(): Promise<any[]>;
}