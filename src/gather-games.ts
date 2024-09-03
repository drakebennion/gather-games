/* eslint-disable class-methods-use-this */
import { LitElement, html, css } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';

import './sign-in.js';
import './game-lobby.js';
import {
  Database,
  DatabaseReference,
  getDatabase,
  onDisconnect,
  ref,
  remove,
  set,
} from 'firebase/database';

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

  @state()
  user: User | null;

  @state()
  playerRef?: DatabaseReference;

  @state()
  database?: Database;

  constructor() {
    super();

    this.user = null;
    const firebaseConfig = {
      apiKey: 'AIzaSyDowXJy0RkTR6LYN_rD7VVZ7L0U06PbGHg',
      authDomain: 'gather-drake.firebaseapp.com',
      projectId: 'gather-drake',
      storageBucket: 'gather-drake.appspot.com',
      messagingSenderId: '757077115765',
      appId: '1:757077115765:web:3676439c0059173061093c',
      databaseUrl: 'https://gather-drake-default-rtdb.firebaseio.com/',
    };

    const app = initializeApp(firebaseConfig);

    const database = getDatabase(app);

    // todo: is this the right place to set this handler up?
    onAuthStateChanged(getAuth(), async user => {
      if (user) {
        this.playerRef = ref(database, `players/${user.uid}`);
        const playerColors = ['red', 'blue', 'yellow', 'gray'];
        set(this.playerRef, {
          id: user.uid,
          // todo: add input for name and color picker
          name: 'Player',
          color: playerColors[Math.floor(Math.random() * playerColors.length)],
        });

        onDisconnect(this.playerRef).remove();
      } else if (this.playerRef) {
        remove(this.playerRef);
        this.playerRef = undefined;
      }

      this.user = user;
    });
  }

  _signOut() {
    signOut(getAuth());
  }

  override render() {
    return this.playerRef
      ? html`<game-lobby .playerRef="${this.playerRef}"></game-lobby>`
      : html`<sign-in></sign-in>`;
  }
}
