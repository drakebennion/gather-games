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
  currentPlayer = {
    x: 0,
    y: 0,
    leftIncrement: Math.random() > 0.5 ? 0.75 : -0.75,
    topIncrement: Math.random() > 0.5 ? 0.5 : -0.5,
  };

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
      if (addedPlayer.id === this.playerRef.key) {
        this.currentPlayer = {
          // todo: find an allowed place to start based on positions of other players
          // woof how do
          // eh let's just start w/ collision detection :)
          ...this.currentPlayer,
          x: Math.floor(Math.random() * 65),
          y: Math.floor(Math.random() * 65),
        };

        update(this.playerRef, this.currentPlayer);

        this.updateInterval = setInterval(() => {
          this.currentPlayer.x += this.currentPlayer.leftIncrement;
          this.currentPlayer.y += this.currentPlayer.topIncrement;

          // todo: pull this all into a "checkForWallCollision func"
          if (this.currentPlayer.x >= 65) {
            this.currentPlayer.x = 65;
            this.currentPlayer.leftIncrement *= -1;
          }

          if (this.currentPlayer.x <= 0) {
            this.currentPlayer.x = 0;
            this.currentPlayer.leftIncrement *= -1;
          }

          if (this.currentPlayer.y >= 70) {
            this.currentPlayer.y = 70;
            this.currentPlayer.topIncrement *= -1;
          }

          if (this.currentPlayer.y <= 0) {
            this.currentPlayer.y = 0;
            this.currentPlayer.topIncrement *= -1;
          }

          const collidingPlayers = this.findCollidingPlayers();
          this.handleCollisions(collidingPlayers);

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

  findCollidingPlayers = () => {
    const allOtherPlayerPositions = Object.entries(this.allPlayers)
      .filter(([id]) => id !== this.playerRef.key)
      .map(([id, { x, y }]) => ({ id, x: Number(x), y: Number(y) }));

    const isCollidingWithCurrentPlayer = (otherPlayer: {
      id: string;
      x: number;
      y: number;
    }) => {
      const playerWidth = 10;
      const playerHeight = 5;

      if (this.currentPlayer.x + playerWidth <= otherPlayer.x) {
        return false;
      }

      if (otherPlayer.x + playerWidth <= this.currentPlayer.x) {
        return false;
      }

      if (this.currentPlayer.y + playerHeight <= otherPlayer.y) {
        return false;
      }

      if (otherPlayer.y + playerHeight <= this.currentPlayer.y) {
        return false;
      }

      return true;
    };

    return allOtherPlayerPositions.filter(isCollidingWithCurrentPlayer);
  };

  handleCollisions = (
    collidingPlayers: Array<{ id: string; x: number; y: number }>,
  ) => {
    // todo: order by distance

    // todo: global const
    const playerWidth = 10;
    const playerHeight = 5;

    collidingPlayers.forEach(otherPlayer => {
      const { x: currentX, y: currentY } = this.currentPlayer;
      const { x: otherX, y: otherY } = otherPlayer;

      const collidingOnTop =
        currentY - playerHeight <= otherY && otherY <= currentY;
      const collidingOnBottom =
        currentY <= otherY && otherY <= currentY + playerHeight;
      const collidingOnLeft =
        currentX - playerWidth <= otherX && otherX <= currentX;
      const collidingOnRight =
        currentX <= otherX && otherX <= currentX + playerWidth;

      if (collidingOnTop) {
        this.currentPlayer.topIncrement *= -1;
        this.currentPlayer.y = otherY + playerHeight;
      } else if (collidingOnBottom) {
        this.currentPlayer.topIncrement *= -1;
        this.currentPlayer.y = otherY - playerHeight;
      } else if (collidingOnLeft) {
        this.currentPlayer.leftIncrement *= -1;
        this.currentPlayer.x = otherX + playerWidth;
      } else if (collidingOnRight) {
        this.currentPlayer.leftIncrement *= -1;
        this.currentPlayer.x = otherX - playerWidth;
      }
    });
  };

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
