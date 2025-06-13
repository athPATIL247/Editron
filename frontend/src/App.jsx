import '@fontsource/urbanist';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { RegistrationPage } from './components/RegistrationPage';
import { Home } from './components/Home';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RoomLayout } from './layout/RoomLayout';
import { SocketProvider } from './context/SocketContext';  // Add this import

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "",
        element: <RegistrationPage />
      },
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "room/:id",
        element: <RoomLayout />
      }
    ],
  },
])

const App = () => {
  return (
    <SocketProvider>  {/* Socket wrapper */}
      <RouterProvider router={router} />
      <ToastContainer />
    </SocketProvider>
  );
}

export default App;