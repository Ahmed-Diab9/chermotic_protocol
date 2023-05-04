import { createBrowserRouter } from "react-router-dom";
import Demo from "./pages/demo";
import Pool from "./pages/pool";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <h1 className="text-3xl font-bold underline">MAIN</h1>
      </div>
    ),
  },
  {
    path: "/hello",
    element: (
      <div>
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
      </div>
    ),
  },
  {
    path: "/demo",
    element: <Demo />,
  },
  {
    path: "/pool",
    element: <Pool />,
  },
]);

export { router };
