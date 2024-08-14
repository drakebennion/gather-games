/* eslint-disable class-methods-use-this */
import {
  getAuth,
  GoogleAuthProvider,
  signInAnonymously,
  signInWithPopup,
} from 'firebase/auth';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('sign-in')
export class SignIn extends LitElement {
  _signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(getAuth(), provider);
  }

  _signInAnonymously() {
    signInAnonymously(getAuth());
  }

  override render() {
    return html`
      <div>
        <button @click="${this._signInWithGoogle}">Sign in with Google</button>
        <button @click="${this._signInAnonymously}">
          Sign in anonymously (limited time only!)
        </button>
      </div>
    `;
  }
}
