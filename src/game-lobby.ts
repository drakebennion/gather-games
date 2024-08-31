/* eslint-disable class-methods-use-this */
import { getAuth, signOut } from 'firebase/auth';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import './game-character.js';
import {
  DatabaseReference,
  getDatabase,
  onChildAdded,
  onChildRemoved,
  onValue,
  ref,
  Unsubscribe,
  update,
} from 'firebase/database';

@customElement('game-lobby')
export class GameLobby extends LitElement {
  static styles = css`
    .game-container {
      height: 75vh;
      width: 75vh;
      border: 1px solid gray;
      margin-top: 2vh;
      position: relative;
    }
  `;

  @property({ type: Object })
  playerRef!: DatabaseReference;

  @state()
  currentPlayer = { x: 0, y: 0, leftIncrement: 0.75, topIncrement: 0.5 };

  @state()
  allPlayers: Object = {};

  @state()
  // eslint-disable-next-line no-undef
  updateInterval?: NodeJS.Timeout;

  @state()
  unsubscribeFunctions: Array<Unsubscribe> = [];

  // constructor() {
  //   super();
  //    user is not guaranteed yet!
  // }

  disconnectedCallback(): void {
    super.disconnectedCallback?.();
    clearInterval(this.updateInterval);
    this.unsubscribeFunctions.forEach(u => u());
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback?.();

    const allPlayersRef = ref(getDatabase(), 'players');

    const allPlayersUnsubscribe = onValue(allPlayersRef, snapshot => {
      this.allPlayers = snapshot.val() || {};
    });

    const removedChildUnsubscribe = onChildRemoved(allPlayersRef, snapshot => {
      const removedPlayer = snapshot.val();
      delete this.allPlayers[removedPlayer.id as keyof typeof this.allPlayers];

      if (this.playerRef.key === removedPlayer.id) {
        allPlayersUnsubscribe();
      }
    });

    const addedChildUnsubscribe = onChildAdded(allPlayersRef, snapshot => {
      const addedPlayer = snapshot.val();
      // todo: add the player to our players list
      if (addedPlayer.id === this.playerRef.key) {
        this.currentPlayer = {
          // todo: find an allowed place to start based on positions of other players
          ...this.currentPlayer,
          x: Math.floor(Math.random() * 65),
          y: Math.floor(Math.random() * 65),
        };

        update(this.playerRef, this.currentPlayer);

        // oh dear this is gonna be very interesting ;)
        // todo: collision detectionnnnnn
        // start the setInterval here that updates the current player's position...
        this.updateInterval = setInterval(() => {
          this.currentPlayer.x += this.currentPlayer.leftIncrement;
          this.currentPlayer.y += this.currentPlayer.topIncrement;

          if (this.currentPlayer.x >= 65) {
            this.currentPlayer.x = 65;
            this.currentPlayer.leftIncrement = -0.75;
          }

          if (this.currentPlayer.x <= 0) {
            this.currentPlayer.x = 0;
            this.currentPlayer.leftIncrement = 0.75;
          }

          if (this.currentPlayer.y >= 70) {
            this.currentPlayer.y = 70;
            this.currentPlayer.topIncrement = -0.5;
          }

          if (this.currentPlayer.y <= 0) {
            this.currentPlayer.y = 0;
            this.currentPlayer.topIncrement = 0.5;
          }

          // this seems like it's gonna be wild lol
          update(this.playerRef, this.currentPlayer);
        }, 25);
      }
    });

    this.unsubscribeFunctions = [
      allPlayersUnsubscribe,
      removedChildUnsubscribe,
      addedChildUnsubscribe,
    ];
  }

  override render() {
    return html`
      <div>
        <button @click="${() => signOut(getAuth())}">Sign out</button>
        <div class="game-container">
          ${Object.entries(this.allPlayers).map(
            ([id, player]) =>
              html`<game-character
                .player=${player}
                .isCurrentPlayer=${id === this.playerRef.key}
              ></game-character>`,
          )}
        </div>
      </div>
    `;
  }
}
