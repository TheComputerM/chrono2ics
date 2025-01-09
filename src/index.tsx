/* @refresh reload */
import { render } from "solid-js/web";
import "@fontsource-variable/outfit";
import "./index.css";
import App from "./App";

const root = document.getElementById("root");

if (root) {
  render(() => <App />, root);
} else {
  console.error("Root element not found");
}
