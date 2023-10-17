// typing definitions

export interface IHGMailRequest {
  to: string;
  subject: string;
  body: string;
  ip: string;
}

interface IHGResponseJSON {
  success: boolean;
  msg: string;
}

export interface IHGResponse {
  json: IHGResponseJSON;
  status: number;
}

export enum SendMailStatus {
  OK,
  INVALID_EMAIL,
  IP_LIMIT_EXCEEDED,
  EMAIL_LIMIT_EXCEEDED,
  SERVER_ERROR,
  _LIMIT_CHECKED
}
