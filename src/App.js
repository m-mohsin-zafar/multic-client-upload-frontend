import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Pages/home";
import FormPage from "./Pages/formPage";
import FourOhFour from "./Pages/404";
import Upload from "./Pages/upload";


const router = createBrowserRouter([
  {path: "/", element: <Home />, errorElement: <FourOhFour />},
  {path: "/form", element: <FormPage />},
  {path: "/upload", element: <Upload />},
  {path: "*", element: <FourOhFour />}
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
