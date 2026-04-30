export default class AuthResponse {
  constructor(token, user) {
    this.token = token;
    this.user = user;
  }

  static fromApi(data) {
    return new AuthResponse(
      data.token,
      data.user
    );
  }
}