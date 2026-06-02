import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiAuthService } from '../../services/api-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required]]
  });
  error = '';

  constructor(private fb: FormBuilder, private auth: ApiAuthService, private router: Router) {}

  submit() {
    this.error = '';
    if (this.form.invalid) {
      console.log('Login: formulario inválido', this.form.value);
      return;
    }
    const { correo, contrasena } = this.form.value;
    console.log('Login: intento con', correo);
    this.auth.login(correo!, contrasena!).subscribe({
      next: (res) => {
        console.log('Login: éxito', res);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Login: fallo', err);
        this.error = err?.error?.error || 'Error autenticando';
      }
    });
  }
}
