import { Routes } from '@angular/router';
import { AdminDasboardLayout } from './layouts/admin-dasboard-layout/admin-dasboard-layout';
import { ProductAdminPage } from './pages/product-admin-page/product-admin-page';
import { ProductsAdminPage } from './pages/products-admin-page/products-admin-page';
import { IsAdminGuard } from '@auth/guards/is-admin.guard';

export const adminDashboardRoutes: Routes = [
  {
    path: '',
    component: AdminDasboardLayout,
    canMatch: [
      IsAdminGuard
    ],
    children: [
    {
      path: 'products',
      component: ProductsAdminPage
    },
    {
      path: 'products/:id',
      component: ProductAdminPage
    },
    {
      path: '**',
      redirectTo: 'products'
    }
    ]
  },
];

export default adminDashboardRoutes;
