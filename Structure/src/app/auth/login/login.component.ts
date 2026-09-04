import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from '../../../services/toastr.service';
import { AuthService } from '../../../services/auth.service';
import { PlatformBootstrapService } from '../../../services/platform-bootstrap.service';
import { IconComponent } from '../../../shared/UI/icon/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  readonly isSubmitting = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  readonly qaSuggestedEmail = 'talha.hassan@centaiva.com';
  readonly qaSuggestedPassword = 'Password123!';

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private bootstrapService: PlatformBootstrapService
  ) {
    this.loginForm = this.fb.group({
      email: [this.qaSuggestedEmail, [Validators.required, Validators.email]],
      password: [this.qaSuggestedPassword, [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Ensure default valid QA Platform Owner credentials are pre-populated
    if (!this.loginForm.get('email')?.value) {
      this.fillQaCredentials();
    }
  }

  get email(): FormControl {
    return this.loginForm.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(prev => !prev);
  }

  fillQaCredentials(): void {
    this.loginForm.patchValue({
      email: this.qaSuggestedEmail,
      password: this.qaSuggestedPassword
    });
    this.errorMessage.set('');
  }

  onSubmit(): void {
    this.errorMessage.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;
    this.isSubmitting.set(true);

    this.authService.loginPlatformOwner(email, password).subscribe({
      next: () => {
        // Load Platform Bootstrap and Admin Scope (Tenantless context)
        this.bootstrapService.loadPlatformBootstrap().subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.toastr.success('Authenticated successfully as Platform Owner', 'Centaiva SSO');
            this.router.navigate(['/dashboard']);
          },
          error: (bootstrapErr) => {
            console.warn('[LoginComponent] Bootstrap loaded with partial context:', bootstrapErr);
            this.isSubmitting.set(false);
            this.toastr.success('Authenticated successfully', 'Centaiva SSO');
            this.router.navigate(['/dashboard']);
          }
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        let errorMsg = 'Invalid email or password. Please verify your credentials.';
        if (err.status === 0) {
          errorMsg = 'Unable to connect to Centaiva OAuth service (http://192.168.88.27:8081). Please check network connection.';
        } else if (err.error?.error_description) {
          errorMsg = err.error.error_description;
        } else if (err.error?.message) {
          errorMsg = err.error.message;
        }
        this.errorMessage.set(errorMsg);
        this.toastr.error(errorMsg, 'Authentication Failed');
      }
    });
  }
}
