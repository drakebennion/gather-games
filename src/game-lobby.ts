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

        // oh dear this is gonna be very interesting ;)
        // todo: collision detectionnnnnn
        // start the setInterval here that updates the current player's position

        // ok so! heh. bounds of container are easy enough to detect:
        // but what about checking if colliding with other players?

        // pretend I have a map of everyone's positions
        // err maybe even just an array of occupied positions?
        // and maybe only everyone who _is not me :)_
        /**
         * todo: allOtherPlayerPositions = [{x: 1, y: 2}, {x: 10, y: 20}, {x: 5, y: 5}]
         * todo: then given my position, I might be able to detect collision by
         * todo: checking all the other positions against my x + width, y + height
         * todo: and if anyone else collides with me, well I suppose I need to know which edge is
         * todo: colliding, and negate that increment :)
         *
         * todo: so everyone will be responsible for their own checking and reversing
         */
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

          this.checkForPlayerCollision();

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

  checkForPlayerCollision = () => {
    const allOtherPlayerPositions = Object.entries(this.allPlayers)
      .filter(([id]) => id !== this.playerRef.key)
      .map(([, { x, y }]) => ({ x, y }));

    // have this.currentPlayer x and y
    // check for left or right edge collisions and flip leftIncrement as needed
    // todo: hmmmmmmmmm but won't it also matter what direction i'm currently traveling in?
    // todo: like if I'm going left already and someone bumps into my right edge, I shouldn't switch left direction right?
    // oh heavens this might be complicated!

    // ok let's just see what we can get :)
    // because yeah that might be easy neough to check? if someone is hitting my left edge && I was travelling left, now travel right
    // i htink :)

    // ok fair enoguh. now how to detect someone hitting my left edge?
    // that'd be if we're in the same y vicinity (their y is between my y and y + height)
    // and in the same x vicinity (their x is between my x and...x - width? because they're to my left? :)

    // todo: may find a more suitable home for these
    const width = 10;
    const height = 5;
    // todo: also may want to fudge the collision detection by like maybe 0.5? to account for lag?

    // oi veyyyyy I probably should check what _quadrant_ of the rectangle they're hitting lol

    // err idk. say I'm travelling left
    // eh let's try it :) find someone who fits that bill and if there is anyone, flip left direction _if i'm travling left
    const someoneCollidingOnLeft =
      /* this.currentPlayer.leftIncrement < 0 && */ allOtherPlayerPositions.find(
        ({ x, y }) =>
          this.currentPlayer.x - width <= x &&
          x <= this.currentPlayer.x &&
          this.currentPlayer.y <= y &&
          y <= this.currentPlayer.y + height,
      );

    // someone is on my right edge
    // so they're in my y vicinity (same logic as left)
    // but their x is between my x and x + width? :)
    const someoneCollidingOnRight =
      /* this.currentPlayer.leftIncrement > 0 && */ allOtherPlayerPositions.find(
        ({ x, y }) =>
          this.currentPlayer.x <= x &&
          x <= this.currentPlayer.x + width &&
          this.currentPlayer.y <= y &&
          y <= this.currentPlayer.y + height,
      );

    // if (someoneCollidingOnLeft || someoneCollidingOnRight) {
    //   this.currentPlayer.leftIncrement *= -1
    // }

    // haaaa omg that's crunchy af but it sorta works :))))))

    // let's doo top edge!
    // same x vicinity: their x is between my x and x + width
    // same y vicinity: their y is between my y - height and y?
    const someoneCollidingOnTop =
      /* this.currentPlayer.topIncrement < 0 && */ allOtherPlayerPositions.find(
        ({ x, y }) =>
          this.currentPlayer.x <= x &&
          x <= this.currentPlayer.x + width &&
          this.currentPlayer.y - height <= y &&
          y <= this.currentPlayer.y,
      );

    // bottom edge: same x logic, but their y is between my y and y + height
    // same y vicinity: their y is between my y - height and y?
    const someoneCollidingOnBottom =
      /* this.currentPlayer.topIncrement > 0 && */ allOtherPlayerPositions.find(
        ({ x, y }) =>
          this.currentPlayer.x <= x &&
          x <= this.currentPlayer.x + width &&
          this.currentPlayer.y <= y &&
          y <= this.currentPlayer.y + height,
      );

    if (someoneCollidingOnTop || someoneCollidingOnBottom) {
      this.currentPlayer.topIncrement *= -1;
    }
    if (someoneCollidingOnLeft || someoneCollidingOnRight) {
      this.currentPlayer.leftIncrement *= -1;
    }

    // if (someoneCollidingOnTop || someoneCollidingOnBottom || someoneCollidingOnLeft || someoneCollidingOnRight) {
    //   console.log('top collision: ', someoneCollidingOnTop)
    //   console.log('Bottom collision: ', someoneCollidingOnBottom)
    //   console.log('Left collision: ', someoneCollidingOnLeft)
    //   console.log('Right collision: ', someoneCollidingOnRight)
    //   this.currentPlayer.leftIncrement = 0;
    //   this.currentPlayer.topIncrement = 0;
    // }
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
