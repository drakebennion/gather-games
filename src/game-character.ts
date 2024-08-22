/* eslint-disable class-methods-use-this */
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('game-character')
export class GameCharacter extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 8vh;
      width: 12vh;
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
  leftIncrement = 2;

  @state()
  topIncrmement = 1;

  connectedCallback(): void {
    super.connectedCallback?.();
    this.style.left = `${this.left}px`;
    this.style.top = `${this.top}px`;

    setInterval(() => {
      this.left += this.leftIncrement;
      this.top += this.topIncrmement;

      if (this.left >= 493) {
        this.left = 493;
        this.leftIncrement = -2;
      }

      if (this.left <= 0) {
        this.left = 0;
        this.leftIncrement = 2;
      }

      if (this.top >= 524) {
        this.top = 524;
        this.topIncrmement = -1;
      }

      if (this.top <= 0) {
        this.top = 0;
        this.topIncrmement = 1;
      }

      this.style.left = `${this.left}px`;
      this.style.top = `${this.top}px`;
    }, 10);
  }

  override render() {
    return html` <div class="character"></div> `;
  }
}
