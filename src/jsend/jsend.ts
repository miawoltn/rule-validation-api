import { Injectable } from '@nestjs/common';
import { JMessage } from './jsend.inerface';

@Injectable()
export class JSend {
  static success(message: string, data: any): JMessage {
    return {
      message,
      status: 'success',
      data: data,
    };
  }

  static error(message: string, data: any = null): JMessage {
    return {
      message,
      status: 'error',
      data: data,
    };
  }
}
