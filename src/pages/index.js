import "./index.css";
//import { initialCards } from "../scripts/cards.js";
import {
  enableValidation,
  settings,
  disableButton,
  resetValidation,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";
import { setButtonText } from "../utils/helpers.js";
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "0da939d6-ceba-4b4d-acf3-3a896b3ef4a8",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, users]) => {
    currentUserId = users._id;

    document.querySelector(".profile__avatar").src = users.avatar;
    document.querySelector(".profile__name").textContent = users.name;
    document.querySelector(".profile__description").textContent = users.about;

    cards.forEach((item) => {
      const cardEl = getCardElement(item);
      cardsList.append(cardEl);
    });
  })
  .catch(console.error);

const profileEditButton = document.querySelector(".profile__edit-btn");
const cardModalBtn = document.querySelector(".profile__add-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

// Edit form elements
const editModal = document.querySelector("#edit-modal");
const editFormElement = document.querySelector(".modal__form");
const editModalCloseBtn = document.querySelector(".modal__close-btn");

const editModalNameInput = document.querySelector("#profile-name-input");
const editModalDescriptionInput = document.querySelector(
  "#profile-description-input"
);

//Card Modal Form Elements

const cardModal = document.querySelector("#add-card-modal");
const cardForm = cardModal.querySelector(".modal__form");
const cardSubmitButton = cardModal.querySelector(".modal__submit-btn");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");

const cardNameInput = cardModal.querySelector("#add-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");
//select modal
const previewModal = document.querySelector("#preview-modal");
const previewModalImage = previewModal.querySelector(".modal__image");
const previewModalCaption = previewModal.querySelector(".modal__caption");
const cardPreviewCloseBtn = previewModal.querySelector(".modal__close-btn");
//card related elements
const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

let selectedCard, selectedCardId;

function openModal(modal) {
  function handleEscClose(evt) {
    if (evt.key === "Escape") {
      closeModal(modal);
    }
  }
  document.addEventListener("keydown", handleEscClose);
  modal.classList.add("modal_is-opened");
  modal._handleEscClose = handleEscClose;
}

function closeModal(modal) {
  document.removeEventListener("keydown", modal._handleEscClose);
  modal.classList.remove("modal_is-opened");
}

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal_is-opened")) {
      closeModal(modal);
    }
  });
});

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;

  setButtonText(submitBtn, true);

  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  const inputValues = { name: cardNameInput.value, link: cardLinkInput.value };

  api
    .createCard(inputValues)
    .then((cardData) => {
      console.log("New card received from API:", cardData);
      const cardEl = getCardElement(cardData); // ✅ Using API response ensures `_id`
      cardsList.prepend(cardEl);
      closeModal(cardModal);
      evt.target.reset();
      disableButton(cardSubmitButton, settings);
    })
    .catch(console.error);
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();

  api
    .editAvatarUserInfo(avatarInputEl.value)
    .then((data) => {
      console.log("Updated avatar:", data);
      document.querySelector(".profile__avatar").src = data.avatar;
      closeModal(avatarModal);
      avatarForm.reset();
      disableButton(avatarSubmitButton, settings);
    })
    .catch(console.error);
}

// Separate function to handle the like logic globally
function handleLike(evt, id) {
  const isLiked = evt.target.classList.contains("card__like-btn_liked");

  api
    .changeLikeStatus(id, !isLiked)
    .then(() => {
      evt.target.classList.toggle("card__like-btn_liked", !isLiked);
    })
    .catch(console.error);
}

// Function to create and return a card element
function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = `Image of ${data.name}`;

  // ✅ Ensure `data.likes` exists before checking `.some()`
  const isLikedByUser =
    Array.isArray(data.likes) &&
    data.likes.some((user) => user._id === currentUserId);
  if (isLikedByUser) {
    cardLikeBtn.classList.add("card__like-btn_liked");
  }

  // Attach event listeners correctly
  cardLikeBtn.addEventListener("click", (evt) => handleLike(evt, data._id));
  cardDeleteBtn.addEventListener("click", () =>
    handleDeleteCard(cardElement, data._id)
  );

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalCaption.textContent = data.name;
    previewModalImage.src = data.link;
    previewModalImage.alt = `Image of ${data.name}`;
  });

  return cardElement;
}

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(
    editFormElement,
    [editModalNameInput, editModalDescriptionInput],
    settings
  );

  openModal(editModal);
});

editModalCloseBtn.addEventListener("click", () => {
  console.log("Close button clicked!");
  closeModal(editModal);
});

cardModalBtn.addEventListener("click", () => {
  openModal(cardModal);
});

cardModalCloseBtn.addEventListener("click", () => {
  closeModal(cardModal);
});

cardPreviewCloseBtn.addEventListener("click", () => {
  closeModal(previewModal);
});

editFormElement.addEventListener("submit", handleEditFormSubmit);

cardForm.addEventListener("submit", handleAddCardSubmit);

//Avatar Modal Form Elements

const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const avatarModal = document.querySelector("#avatar-modal");
const avatarCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarSubmitButton = avatarModal.querySelector(".modal__submit-btn");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarInputEl = avatarModal.querySelector("#profile-avatar-input");

avatarModalBtn.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

document.querySelectorAll(".modal__close-btn").forEach((btn) => {
  btn.addEventListener("click", (evt) => {
    const modal = evt.target.closest(".modal");
    if (modal) {
      closeModal(modal);
    }
  });
});

avatarForm.addEventListener("submit", handleAvatarSubmit);

//Delete form elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;

  deleteForm.addEventListener("submit", handleDeleteSubmit);
  openModal(deleteModal);

  function handleDeleteSubmit(evt) {
    evt.preventDefault();
    api
      .deleteCard(selectedCardId)
      .then(() => {
        selectedCard.remove();
        closeModal(deleteModal);
        deleteForm.removeEventListener("submit", handleDeleteSubmit);
      })
      .catch(console.error);
  }
}
enableValidation(settings);
