import {decodeToken} from "../utils/decodeToken";

export default class AuthResponse {
  constructor(token, user) {
    this.token = token;
    this.user = user;
  }

  static fromApi(data) {
    const token = data.token;
    const user = decodeToken(token);

    return new AuthResponse(token, user);
  }
}