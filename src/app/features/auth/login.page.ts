import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { SessionService } from '../../core/services/session.service';

interface CapabilityCard {
  label: string;
  icon: string;
  detail: string;
}

@Component({
  selector: 'ctv-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CheckboxModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  readonly submitting = signal(false);
  readonly passwordVisible = signal(false);

  readonly capabilities: CapabilityCard[] = [
    { label: 'Identity', icon: 'pi pi-users', detail: 'Directory, federation and MFA policy' },
    { label: 'Tenancy', icon: 'pi pi-sitemap', detail: 'Unlimited organization hierarchy' },
    { label: 'Licensing', icon: 'pi pi-id-card', detail: 'Seats, activations and delegation' },
    { label: 'Security', icon: 'pi pi-shield', detail: 'Policies, sessions and audit' },
    { label: 'Provisioning', icon: 'pi pi-bolt', detail: 'Templates, routing and deployments' },
  ];

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true],
  });

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  togglePassword(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { email, password, remember } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: (tokens) => {
        this.session.signIn(tokens, remember);
        this.submitting.set(false);
        void this.router.navigate(['/app/overview']);
      },
      error: (error: Error) => {
        this.submitting.set(false);
        this.notifications.error('Sign-in failed', error.message);
      },
    });
  }

  signInWith(provider: string): void {
    this.notifications.info('SSO not connected', `${provider} sign-in is not configured yet.`);
  }

  forgotPassword(event: Event): void {
    event.preventDefault();
    this.notifications.info('Password reset', 'A reset link would be sent by Centaiva Identity.');
  }
}
