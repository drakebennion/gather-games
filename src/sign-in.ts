/* eslint-disable class-methods-use-this */
import {
  browserPopupRedirectResolver,
  getAuth,
  GoogleAuthProvider,
  signInAnonymously,
  signInWithPopup,
} from 'firebase/auth';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('sign-in')
export class SignIn extends LitElement {
  // todo: make this look much less bad

  _signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(getAuth(), provider, browserPopupRedirectResolver);
  }

  _signInAnonymously() {
    signInAnonymously(getAuth());
  }

  override render() {
    return html`
      <div>
        <button @click="${this._signInAnonymously}">
          Sign in anonymously (limited time only!)
        </button>
      </div>
    `;
  }
}
