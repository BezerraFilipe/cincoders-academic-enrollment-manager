import { ConflictException } from '@nestjs/common';

export class ResourceInUseException extends ConflictException {
  constructor(message: string) {
    super({ code: 'RESOURCE_IN_USE', message });
  }
}
