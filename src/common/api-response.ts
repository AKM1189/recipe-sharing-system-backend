import { ApiResponse } from './api-response.interface';

export const sendResponse = <T>(
  statusCode: number,
  data?: T,
  message: string = 'Operation Success',
  success: boolean = true,
): ApiResponse<T> => {
  return {
    success,
    message,
    data,
    statusCode,
  };
};
