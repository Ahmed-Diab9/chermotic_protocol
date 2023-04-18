import { createBrowserRouter } from "react-router-dom";

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
]);

export { router };
