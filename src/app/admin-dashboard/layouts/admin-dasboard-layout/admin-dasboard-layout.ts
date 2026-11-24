import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-admin-dasboard-layout',
  imports: [RouterOutlet, RouterLinkWithHref, RouterLink, RouterLinkActive],
  templateUrl: './admin-dasboard-layout.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class AdminDasboardLayout {
  authService = inject(AuthService);

  user = computed(() => this.authService.user());
}
