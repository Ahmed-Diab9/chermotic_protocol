import type { Preview } from "@storybook/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import "../src/index.css";
import { Provider } from "react-redux";
import { store } from "../src/store";
// import "../src/theme";

const preview: Preview = {
  globalTypes: {
    darkMode: {
      defaultValue: false,
    },
    className: {
      defaultValue: "dark",
    },
  },
  parameters: {
    backgrounds: { disable: true },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (story) => {
      return (
        <Provider store={store}>
          <MemoryRouter>{story()}</MemoryRouter>
        </Provider>
      );
    },
  ],
};

export default preview;
