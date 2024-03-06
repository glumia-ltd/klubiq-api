import { Injectable } from '@nestjs/common';

@Injectable()
export class RentalsService {
  getHello(): string {
    return 'Hello World!';
  }
}
