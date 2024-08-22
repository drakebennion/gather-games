/* eslint-disable class-methods-use-this */
import { getAuth, signOut } from 'firebase/auth';
import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import './game-character.js';

@customElement('game-lobby')
export class GameLobby extends LitElement {
  static styles = css`
    .game-container {
      height: 75vh;
      width: 75vh;
      border: 1px solid gray;
      margin-top: 24px;
    }
  `;

  override render() {
    return html`
      <div>
        <button @click="${() => signOut(getAuth())}">Sign out</button>
        <div class="game-container">
          <game-character></game-character>
        </div>
      </div>
    `;
  }
}
