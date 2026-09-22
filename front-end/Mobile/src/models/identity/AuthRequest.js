import BaseModel from '../BaseModel';

export default class AuthRequest extends BaseModel {
  constructor(data = {}) {
    super();
    this.email = data.email || '';
    this.password = data.password || '';
  }

  static fromCredentials(email, password) {
    return new AuthRequest({ email, password });
  }

  toApi() {
    return {
      email: this.email,
      password: this.password,
    };
  }
}
