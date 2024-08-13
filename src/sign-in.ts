import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import { GoogleAuthProvider, getAuth, signInAnonymously, signInWithPopup } from 'firebase/auth'

@customElement('sign-in')
export class SignIn extends LitElement {
    _signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        signInWithPopup(getAuth(), provider)
        .catch((err) => {
            console.log('something went wrong signing in: ', err.code, err.message)
        })
    }
    
    _signInAnonymously() {
        signInAnonymously(getAuth())
        .catch((err) => {
            console.log('something went wrong signing in: ', err.code, err.message)
        })
    }

   override render() {
    return html`
        <div>
            <button @click="${this._signInWithGoogle}">Sign in with the googs</button>
            <button @click="${this._signInAnonymously}">Sign in anon (limited time only!)</button>
        </div>
    `
   } 
}
