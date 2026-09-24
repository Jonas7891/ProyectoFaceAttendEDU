import BaseModel from '../BaseModel';

export default class AuthRequest extends BaseModel {
  constructor(data = {}) {
    super();
    this.username = data.username || data.email || '';
    this.password = data.password || '';
  }

  static fromCredentials(username, password) {
    return new AuthRequest({ username, password });
  }

  toApi() {
    return {
      username: this.username,
      password: this.password,
    };
  }
}
