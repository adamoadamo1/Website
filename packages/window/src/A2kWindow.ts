import { html, css, LitElement } from "lit";
import { consume } from "@lit-labs/context";
import { property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { DragController, getSmallestValue } from "@a2000/utilities";
import { WindowContext, windowContext } from "./windowContext";
import { v4 as uuid } from "uuid";

import "@a2000/stack/a2k-stack.js";
import "@a2000/panel/a2k-panel.js";

import "./a2k-window-topbar";
import "./a2k-window-actions";

// TODO: add a window context that tracks the active states of the windows and adjust their position in the stacks accordingly
// TODO: this works incorrectly if the window is inside a relatively positioned element
//    Idea: Play around with setting the x/y position before setting the top:0,left:0 position in the DragController

export class A2kWindow extends LitElement {
  static styles = css`
    :host([hidden]) {
      display: none;
    }

    ::slotted(*) {
      padding: 0 var(--window-spacing-horizontal);
    }

    ::slotted([slot="toolbar"]) {
      padding: 0;
    }

    ::slotted([slot="statusbar"]) {
      padding: 0;
    }

    #window {
      font-family: var(--font-primary);
      letter-spacing: var(--font-primary-letter-spacing);
      position: absolute;
      width: var(--window-width);
      max-width: 100%;
    }

    #draggable {
      width: 100%;
      position: relative;
    }

    #draggable[data-dragging="idle"] {
      cursor: var(--cursor-grab);
    }

    #draggable[data-dragging="dragging"] {
      cursor: var(--cursor-grabbing);
    }

    #topbar-wrapper {
      display: flex;
      justify-content: space-between;
    }
  `;

  id = uuid();

  @consume({ context: windowContext, subscribe: true })
  @property({ type: String, attribute: false })
  public windows?: WindowContext;

  @property({ type: String })
  heading = "";

  @property({ type: Boolean })
  draggable = false;

  @property({ type: Boolean })
  closeable = false;

  @property({ type: Number })
  x = -1;

  @property({ type: Number })
  y = -1;

  private drag = new DragController(this, {
    initialPosition: {},
    getContainerEl: () => this.shadowRoot!.querySelector("#window"),
    getDraggableEl: () => this.getDraggableEl(),
    getIsDraggable: () => this.draggable,
  });

  async getDraggableEl() {
    await this.updateComplete;
    return this.shadowRoot!.querySelector("#draggable");
  }

  constructor() {
    super();

    this.addEventListener("close", () => {
      return this.remove();
    });
  }

  connectedCallback(): void {
    super.connectedCallback();

    if (this.windows) {
      const hasAutoPosition = this.x === -1 || this.y === -1;
      const options = {
        hasAutoPosition,
      };

      this.windows.registerWindow(this.id, options);
      this.addEventListener("pointerdown", this.handleClick);

      if (hasAutoPosition) {
        const windowsList = this.windows.windowsList;
        const autoPositionedWindowCount = windowsList.filter(
          (x) => x.hasAutoPosition
        ).length;

        this.x = autoPositionedWindowCount * 32;
        this.y = autoPositionedWindowCount * 32;
      }
    }

    if (this.x === -1) {
      this.x = 0;
    }

    if (this.y === -1) {
      this.y = 0;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.windows) {
      this.windows.unregisterWindow(this.id);
      this.removeEventListener("pointerdown", this.handleClick);
    }
  }

  protected firstUpdated(): void {
    const { offsetWidth } = this.renderRoot.querySelector(
      "#window"
    ) as HTMLDivElement;

    const availableWidth = getSmallestValue(screen.availWidth, innerWidth);

    this.drag.x = this.x;
    this.drag.y = this.y;
    this.drag.updateElPosition();

    if (this.x + offsetWidth > availableWidth) {
      this.drag.styles.transform = `translate(0px, ${this.y}px)`;
    }

    this.requestUpdate();
  }

  handleClick() {
    this.windows?.handleInteraction(this.id);
  }

  getWindowPosition() {
    if (!this.windows) return;

    return this.windows.windowOrder.indexOf(this.id);
  }

  getIsMostRecentlyUpdatedWindow() {
    if (!this.windows) return;

    const { windowOrder } = this.windows;

    return windowOrder[windowOrder.length - 1] === this.id;
  }

  render() {
    const windowPosition = this.getWindowPosition();
    const activeState = this.getIsMostRecentlyUpdatedWindow()
      ? "active"
      : "inactive";

    return html`
      <div
        id="window"
        style=${styleMap({
          ...this.drag.styles,
          zIndex: `${windowPosition}`,
        })}
      >
        <a2k-panel>
          <div id="topbar-wrapper">
            <div id="draggable" data-dragging=${this.drag.state}>
              <a2k-window-topbar data-state=${activeState}
                >${this.heading}</a2k-window-topbar
              >
            </div>
            <a2k-window-actions
              ?closeable="${this.closeable}"
            ></a2k-window-actions>
          </div>
          <slot name="toolbar"></slot>
          <a2k-stack>
            <slot></slot>
          </a2k-stack>
          <slot name="statusbar"></slot>
        </a2k-panel>
      </div>
    `;
  }
}

// https://codepen.io/rootVIII/details/VwMXxKV
// https://www.joshwcomeau.com/react/animating-the-unanimatable/
