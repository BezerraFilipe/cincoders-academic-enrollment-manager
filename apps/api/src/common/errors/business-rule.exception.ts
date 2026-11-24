import { UnprocessableEntityException } from '@nestjs/common';

export class BusinessRuleException extends UnprocessableEntityException {
  constructor(code: string, message: string) {
    super({ code, message });
  }
}
