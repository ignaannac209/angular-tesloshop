import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layouy',
  imports: [RouterOutlet],
  templateUrl: './auth-layouy.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class AuthLayouy {}
