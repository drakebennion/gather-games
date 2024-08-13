import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, User } from "firebase/auth"

@customElement('gather-games')
export class GatherGames extends LitElement {
  @property({ type: String }) header = 'My app';

  static styles = css`
    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      background-color: var(--gather-games-background-color);
    }
  `;

  @property({type: Object})
  user: User | null;

  constructor() {
    super();

    this.user = null;
    const firebaseConfig = {
        apiKey: "AIzaSyDowXJy0RkTR6LYN_rD7VVZ7L0U06PbGHg",
        authDomain: "gather-drake.firebaseapp.com",
        projectId: "gather-drake",
        storageBucket: "gather-drake.appspot.com",
        messagingSenderId: "757077115765",
        appId: "1:757077115765:web:3676439c0059173061093c"
    };

    initializeApp(firebaseConfig);

    // todo: is this the right place to set this handler up?
    onAuthStateChanged(getAuth(), (user) => {
        if (user) {
          // console.log(user)
        }
        this.user = user;

    })
  }

  override render() {
    return this.user
    ? html`<p>Welcome to the lobby</p>`
    : html`<p>pls sign in</p>`
  }
}
