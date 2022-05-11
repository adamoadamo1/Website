import { LitElement, svg } from "lit";
import { property } from "lit/decorators";
import { IconName } from "./types";

// move this into a types file, and generate it based on values from the .svg file
// what should the default be?

const url = new URL("../../a2k-icons.svg", import.meta.url).href;

export class Icon extends LitElement {
  @property({ type: String })
  name: IconName = "";

  render() {
    if (!this.name) {
      console.warn(
        "This icon is a missing a 'name', please specify the 'name' of the icon you want to display"
      );
    }

    return svg`
      <svg class="icon">
        <use href="${url}#${this.name}"></use>
      </svg>
    `;
  }
}
