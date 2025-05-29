class Api {
  constructor(options) {
    // constructor body
  }

  getInitialCards() {
    return fetch("https://around-api.en.tripleten-services.com/v1/cards", {
      headers: {
        authorization: "0da939d6-ceba-4b4d-acf3-3a896b3ef4a8",
      },
    }).then((res) => res.json());
  }

  // other methods for working with the API
}

export default Api;
