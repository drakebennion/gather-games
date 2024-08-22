/* eslint-disable class-methods-use-this */
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('game-character')
export class GameCharacter extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 5vh;
      width: 10vh;
      border: 1px solid gray;
      background-color: gray;
      position: relative;
    }
  `;

  // todo: could probably just hold one Position object as this property?
  @state()
  left = 0;

  @state()
  top = 0;

  @state()
  leftIncrement = 0.75;

  @state()
  topIncrmement = 0.5;

  connectedCallback(): void {
    super.connectedCallback?.();
    this.style.left = `${this.left}vh`;
    this.style.top = `${this.top}vh`;

    setInterval(() => {
      this.left += this.leftIncrement;
      this.top += this.topIncrmement;

      if (this.left >= 65) {
        this.left = 65;
        this.leftIncrement = -0.75;
      }

      if (this.left <= 0) {
        this.left = 0;
        this.leftIncrement = 0.75;
      }

      if (this.top >= 70) {
        this.top = 70;
        this.topIncrmement = -0.5;
      }

      if (this.top <= 0) {
        this.top = 0;
        this.topIncrmement = 0.5;
      }

      this.style.left = `${this.left}vh`;
      this.style.top = `${this.top}vh`;
    }, 25);
  }

  override render() {
    return html` <div class="character"></div> `;
  }
}
