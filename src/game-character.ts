/* eslint-disable class-methods-use-this */
import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('game-character')
export class GameCharacter extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 5vh;
      width: 10vh;
      border: 2px solid gray;
      background-color: gray;
      position: absolute;
    }
  `;

  @property({ type: Object })
  player = { x: 0, y: 0, color: '' };

  @property({ type: Boolean })
  isCurrentPlayer = false;

  update(
    changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    super.update(changedProperties);
    this.style.left = `${this.player?.x}vh`;
    this.style.top = `${this.player?.y}vh`;
    this.style.backgroundColor = this.player?.color;
    this.style.borderColor = this.isCurrentPlayer
      ? 'black'
      : this.player?.color;
  }

  override render() {
    return html` <div></div> `;
  }
}
