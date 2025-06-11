class Api {
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  //Reusable method to check response status
  _checkResponse(res) {
    return res.ok
      ? res.json()
      : res
          .json()
          .then((err) =>
            Promise.reject(`Error ${res.status}: ${err.message || err}`)
          );
  }

  getAppInfo() {
    return Promise.all([this.getInitialCards(), this.getUserInfo()]);
  }

  getInitialCards() {
    return fetch(`${this._baseUrl}/cards`, { headers: this._headers }).then(
      this._checkResponse
    );
  }

  createCard({ name, link }) {
    return fetch(`${this._baseUrl}/cards`, {
      method: "POST",
      headers: this._headers,
      body: JSON.stringify({
        name: name, // Card title
        link: link, // Image URL
      }),
    }).then(this._checkResponse);
  }

  getUserInfo() {
    return fetch(`${this._baseUrl}/users/me`, {
      headers: this._headers,
    }).then(this._checkResponse);
  }

  editUserInfo({ name, about }) {
    return fetch(`${this._baseUrl}/users/me`, {
      method: "PATCH",
      headers: this._headers,
      // Send the data in the body as a JSON string.
      body: JSON.stringify({
        name,
        about,
      }),
    }).then(this._checkResponse);
  }

  editAvatarUserInfo(avatar) {
    return fetch(`${this._baseUrl}/users/me/avatar`, {
      method: "PATCH",
      headers: this._headers,
      body: JSON.stringify({
        avatar,
      }),
    }).then(this._checkResponse);
  }

  deleteCard(id) {
    return fetch(`${this._baseUrl}/cards/${id}`, {
      method: "DELETE",
      headers: this._headers,
    }).then(this._checkResponse);
  }

  changeLikeStatus(id, isLiked) {
    return fetch(`${this._baseUrl}/cards/${id}/likes`, {
      method: isLiked ? "DELETE" : "PUT",
      headers: this._headers,
    }).then(this._checkResponse);
  }
}

export default Api;
