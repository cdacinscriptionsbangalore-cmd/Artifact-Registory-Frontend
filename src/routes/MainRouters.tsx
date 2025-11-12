import { ProtectedRoute, PublicRoute } from "@/layouts/ProtectedLayOut/ProtectedLayout";
import HomePage from "@/views/Home/Home";
import InscriptionDetails from "@/views/InscriptionDetailPage/InscriptionDetails";
import Upload from "@/views/Upload/Upload";
import BaseLayout from "@layouts/MainLayout/BaseLayout";
import AuthPage from "@views/Auth/AuthPage";
import Feed from "@views/Feed/Feed";
import Gallery from "@views/Gallery/Gallery";
import Profile from "@views/Profile/Profile";
import Setting from "@views/Setting/Setting";
import { Navigate } from "react-router-dom";

const MainRoutes = {
  path: '/',
  element: <BaseLayout />,
  children: [
    {
      index: true,
      element: (
        // <ProtectedRoute>
          <Navigate to="home" replace />
        // </ProtectedRoute>
      )
    },
    {
      path: 'home',
      element: (
        <HomePage />
      )
    },
    {
      path: 'Feed',
      element: (
        <ProtectedRoute>
          <Feed />
        </ProtectedRoute>
      )
    },
    {
      path: 'upload',
      element: (
        <ProtectedRoute>
          <Upload />
        </ProtectedRoute>
      )
    },
    {
      path: 'Feed/:id',
      element: (
        <ProtectedRoute>
          <InscriptionDetails />
        </ProtectedRoute>
      )
    },
    {
      path: 'settings',
      element: (
        <ProtectedRoute>
          <Setting />
        </ProtectedRoute>
      )
    },
    {
      path: 'profile',
      element: (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      )
    },
    {
      path: 'photos',
      element: (
        <ProtectedRoute>
          <Gallery />
        </ProtectedRoute>
      )
    },
    {
      path: 'login',
      element: (
        <PublicRoute>
          <AuthPage />
        </PublicRoute>
      )
    }
  ]
};

export default MainRoutes;