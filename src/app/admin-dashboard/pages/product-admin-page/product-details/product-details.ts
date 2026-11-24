import { ChangeDetectionStrategy, Component, computed, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '@products/interfaces/product.interface';
import { ProductsService } from '@products/services/products.service';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductCarousel } from '@products/components/product-carousel/product-carousel';
import { FormUtils } from '@utils/form-utils';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';




@Component({
  selector: 'product-details',
  imports: [ProductCarousel, ReactiveFormsModule, FormErrorLabel],
  templateUrl: './product-details.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ProductDetails implements OnInit, OnDestroy {
    product = input.required<Product>();

  router = inject(Router);
  fb = inject(FormBuilder);

  productsService = inject(ProductsService);
  saveSuccess = signal('');
  isSaving = signal(false);
  saveError = signal('');

  imageFileList: FileList | undefined = undefined;
  tempImages = signal<string[]>([]);

   imagesToCarousel = computed(() => {
    const currentProductImages = [
      ...this.product().images,
      ...this.tempImages(),
    ];
    return currentProductImages;
  });

  productForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    slug: [
      '',
      [Validators.required, Validators.pattern(FormUtils.slugPattern)],
    ],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(1)]],
    sizes: [['']],
    images: [[]],
    tags: [''],
    gender: [
      'men',
      [Validators.required, Validators.pattern(/men|women|kid|unisex/)],
    ],
  });

  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  ngOnInit(): void {
    this.setFormValue(this.product());
  }

  ngOnDestroy(): void {
    this.revokeTempImages();
  }

  setFormValue(formLike: Partial<Product>) {
    this.productForm.reset(this.product() as any);
    this.productForm.patchValue({ tags: formLike.tags?.join(',') });
    // this.productForm.patchValue(formLike as any);
  }

  onSizeClicked(size: string) {
    const currentSizes = this.productForm.value.sizes ?? [];

    if (currentSizes.includes(size)) {
      currentSizes.splice(currentSizes.indexOf(size), 1);
    } else {
      currentSizes.push(size);
    }

    this.productForm.patchValue({ sizes: currentSizes });
  }

  async onSubmit() {
    const isValid = this.productForm.valid;
    this.productForm.markAllAsTouched();

    if (!isValid) {
      this.saveError.set('Completa todos los campos requeridos');
      return;
    }

    const formValue = this.productForm.value;

    const productLike: Partial<Product> = {
      ...(formValue as any),
      tags:
        formValue.tags
          ?.toLowerCase()
          .split(',')
          .map((tag) => tag.trim()) ?? [],
    };

    this.isSaving.set(true);
    this.saveError.set('');

    try {
      if (this.product().id === 'new') {
        const product = await firstValueFrom(
          this.productsService.createProduct(productLike, this.imageFileList)
        );

        this.saveSuccess.set('Producto creado correctamente');
        setTimeout(() => {
          this.router.navigate(['/admin/products', product.id]);
        }, 1500);
      } else {
        await firstValueFrom(
          this.productsService.updateProduct(
            this.product().id,
            productLike,
            this.imageFileList
          )
        );

        this.saveSuccess.set('Datos actualizados correctamente');
        setTimeout(() => {
          this.saveSuccess.set('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error al guardar el producto', error);

      if (error instanceof HttpErrorResponse) {
        const backendMessage = error.error?.message;
        const backendMessages = Array.isArray(backendMessage)
          ? backendMessage
          : typeof backendMessage === 'string'
            ? [backendMessage]
            : [];
        const translatedMessages = backendMessages.map((message) => {
          if (typeof message !== 'string') return '';
          if (/^stock must be a positive number$/i.test(message)) {
            return 'El inventario debe ser mayor que 0';
          }
          return '';
        }).filter(Boolean);

        const message = translatedMessages.length
          ? translatedMessages.join(', ')
          : error.status === 401
            ? 'Tu sesión expiró. Vuelve a iniciar sesión'
            : 'No se pudo guardar el producto. Revisa los datos ingresados';

        this.saveError.set(message);
      } else {
        this.saveError.set('No se pudo guardar el producto');
      }
    } finally {
      this.isSaving.set(false);
    }
  }

  // Images
  onFilesChanged(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    this.revokeTempImages();
    this.imageFileList = fileList?.length ? fileList : undefined;

    const imageUrls = Array.from(this.imageFileList ?? []).map((file) =>
      URL.createObjectURL(file)
    );

    this.tempImages.set(imageUrls);
  }

  private revokeTempImages(): void {
    this.tempImages().forEach((imageUrl) => URL.revokeObjectURL(imageUrl));
    this.tempImages.set([]);
  }
}
