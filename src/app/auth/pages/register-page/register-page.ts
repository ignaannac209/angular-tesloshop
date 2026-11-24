import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';
import { AuthService } from '@auth/services/auth.service';
import { FormUtils } from '@utils/form-utils';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, FormErrorLabel],
  templateUrl: './register-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  errorMessage = signal('');
  isPosting = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(50),
        Validators.pattern(/^(?![.\n])(?=.*[A-Z])(?=.*[a-z])(?=.*(?:\d|\W+)).*$/),
      ],
    ],
    confirmPassword: ['', Validators.required],
  }, {
    validators: [FormUtils.isFieldOneEqualFieldTwo('password', 'confirmPassword')],
  });

  onSubmit(): void {
    if (this.isPosting()) return;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage.set('Revisa los campos y confirma que las contraseñas coincidan.');
      return;
    }

    const { fullName, email, password } = this.registerForm.getRawValue();
    if (!fullName || !email || !password) return;

    this.isPosting.set(true);
    this.errorMessage.set('');

    this.authService.register(email, password, fullName).subscribe({
      next: (isAuthenticated) => {
        this.isPosting.set(false);

        if (isAuthenticated) {
          this.router.navigateByUrl('/');
          return;
        }

        this.errorMessage.set('No se pudo crear la cuenta. Verifica los datos ingresados.');
      },
      error: (error: unknown) => {
        console.error('Error al registrar la cuenta', error);
        this.isPosting.set(false);
        this.errorMessage.set(this.getRegisterErrorMessage(error));
      },
    });
  }

  private getRegisterErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'No se pudo crear la cuenta. Inténtalo de nuevo.';
    }

    const backendMessage = error.error?.message;
    const details = Array.isArray(backendMessage)
      ? backendMessage.join(' ').toLowerCase()
      : typeof backendMessage === 'string'
        ? backendMessage.toLowerCase()
        : '';

    if (
      details.includes('email') &&
      /(already|exists|taken|registered)/.test(details)
    ) {
      return 'Ese correo ya está registrado. Intenta con otro.';
    }

    if (
      details.includes('password') &&
      /(uppercase|lowercase|number|longer|length|short)/.test(details)
    ) {
      return 'La contraseña debe tener entre 6 y 50 caracteres, incluir mayúscula y minúscula, y al menos un número o símbolo.';
    }

    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Inténtalo de nuevo.';
    }

    return 'El servidor rechazó los datos. Verifica el correo y la contraseña.';
  }
}
