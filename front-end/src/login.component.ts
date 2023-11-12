// login.component.ts
import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <div>
      <form (ngSubmit)="handleLogin()">
        <h2>Login</h2>
        <div *ngIf="error" style="color: red">{{ error }}</div>
        <div>
          <label>Username:</label>
          <input type="text" [(ngModel)]="username" name="username">
        </div>
        <div>
          <label>Password:</label>
          <input type="password" [(ngModel)]="password" name="password">
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  handleLogin(): void {
    this.authService.login(this.username, this.password).subscribe(
      data => {
        localStorage.setItem('user', JSON.stringify(data));
        this.router.navigate(['/']); // Navigate to home or dashboard
      },
      err => {
        this.error = 'Failed to login. Please check your credentials.';
      }
    );
  }
}
