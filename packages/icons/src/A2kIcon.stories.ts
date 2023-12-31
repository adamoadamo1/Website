import { Meta, Story } from "@storybook/web-components";
import { css, LitElement } from "lit";
import { html } from "lit-html";
import { customElement } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import "./a2k-icon";
import iconNames from "./iconNames";

@customElement("a2k-icons")
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Icons extends LitElement {
  static styles = css`
    div {
      display: flex;
      gap: 8px;
    }
  `;

  render() {
    return map(iconNames, (name) => {
      return html`
        <div>
          <a2k-icon icon=${name}></a2k-icon>
          <p>${name}</p>
        </div>
      `;
    });
  }
}

const Template: Story = () => {
  return html` <a2k-icons></a2k-icons> `;
};

export const Default = Template.bind({});

Default.args = {};

export default {
  title: "Icons",
  argTypes: {},
} as Meta;
