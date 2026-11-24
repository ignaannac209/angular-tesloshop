import { Routes } from "@angular/router";
import { AuthLayouy } from "./layout/auth-layouy/auth-layouy";
import { LoginPage } from "./pages/login-page/login-page";
import { RegisterPage } from "./pages/register-page/register-page";



export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayouy,
    children:[
      {
         path: 'login',
         component: LoginPage,
      },
      {
         path: 'register',
         component: RegisterPage,
      },
      {
        path: '**',
        redirectTo: 'login',
      },
    ],
  },
];

export default authRoutes;
