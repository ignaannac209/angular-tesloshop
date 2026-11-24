import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProductCarousel } from '@products/components/product-carousel/product-carousel';
import { ProductsService } from '@products/services/products.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-product-page',
  imports: [ProductCarousel],
  templateUrl: './product-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ProductPage {

  activatedRoute = inject(ActivatedRoute);
  productService = inject(ProductsService);

  productIdSlug = toSignal(
    this.activatedRoute.paramMap.pipe(
      map(params => params.get('idSlug') ?? '')
    ),
    { initialValue: '' }
  );

  productResource = rxResource({
    params: () => ({ idSlug: this.productIdSlug() }),
    stream: ({ params }) => {
      return this.productService.getProductByIdSlug(params.idSlug);
    },
  });

}
