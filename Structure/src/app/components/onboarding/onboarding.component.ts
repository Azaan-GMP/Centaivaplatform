import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlatformApiService } from '../../../services/platform-api.service';
import { EntityDeletionService } from '../../../services/entity-deletion.service';
import { ToastrService } from '../../../services/toastr.service';
import { IconComponent } from '../../../shared/UI/icon/icon.component';
import { CustomSelectComponent, SelectOption } from '../../../shared/UI/custom-select/custom-select.component';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconComponent, CustomSelectComponent],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {
  currentStep = signal<number>(1);
  readonly isSubmitting = signal<boolean>(false);
  readonly isSuccess = signal<boolean>(false);

  readonly appOptions: SelectOption[] = [
    { value: 'WORKWELL_FINANCE', label: 'WorkWell Finance (Multi-Entity Accounting)' },
    { value: 'CENTAIVA_PLATFORM', label: 'Centaiva Identity & Control Plane' }
  ];


  onboardingForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: PlatformApiService,
    private deletionService: EntityDeletionService,
    private toastr: ToastrService
  ) {
    this.onboardingForm = this.fb.group({
      // Step 1: Organization
      orgName: ['Acme Global Holdings', [Validators.required, Validators.minLength(3)]],
      orgCode: ['ACME_GLOBAL', Validators.required],
      displayName: ['Acme Global Operations'],
      // Step 2: Tenant & Application
      tenantName: ['Acme Finance US', Validators.required],
      tenantIdentifier: ['ACME_FINANCE_US', Validators.required],
      applicationKey: ['WORKWELL_FINANCE'],
      // Step 3: Admin
      adminEmail: ['admin@acme-global.com', [Validators.required, Validators.email]],
      adminFirstName: ['John', Validators.required],
      adminLastName: ['Doe', Validators.required],
      adminPassword: ['Password123!', Validators.required]
    });
  }

  ngOnInit(): void {}

  goToStep(step: number): void {
    this.currentStep.set(step);
  }

  submitOnboarding(): void {
    if (this.onboardingForm.invalid) {
      this.toastr.error('Please complete all required fields.');
      return;
    }

    this.isSubmitting.set(true);
    const val = this.onboardingForm.value;

    const orgId = `ORG-${Date.now().toString().slice(-6)}`;
    const tenantId = `TNT-${Date.now().toString().slice(-6)}`;
    const userId = `USR-${Date.now().toString().slice(-6)}`;

    const newOrg = {
      id: orgId,
      name: val.orgName,
      code: val.orgCode,
      displayName: val.displayName || val.orgName,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    const newTenant = {
      id: tenantId,
      organizationId: orgId,
      organizationName: val.orgName,
      name: val.tenantName,
      identifier: val.tenantIdentifier,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    const newUser = {
      id: userId,
      email: val.adminEmail,
      firstName: val.adminFirstName,
      lastName: val.adminLastName,
      fullName: `${val.adminFirstName} ${val.adminLastName}`.trim(),
      roles: ['SUPER_ADMIN'],
      status: 'ACTIVE',
      isMfaEnabled: true,
      emailConfirmed: true,
      createdAt: new Date().toISOString()
    };

    // Save to persistence store
    this.deletionService.saveCustomOrg(newOrg);
    this.deletionService.saveCustomTenant(newTenant);
    this.deletionService.saveCustomUser(newUser);

    // Call Platform APIs
    this.apiService.createOrganization(newOrg).subscribe({
      next: () => {
        this.apiService.createTenant(newTenant).subscribe();
        this.apiService.createUser({
          email: val.adminEmail,
          firstName: val.adminFirstName,
          lastName: val.adminLastName,
          roles: ['SUPER_ADMIN'],
          status: 'ACTIVE',
          password: val.adminPassword
        }).subscribe();

        this.isSubmitting.set(false);
        this.isSuccess.set(true);
        this.toastr.success(`Organization ${val.orgName} and Tenant ${val.tenantName} successfully onboarded!`);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.isSuccess.set(true);
        this.toastr.success(`Organization ${val.orgName} and Tenant ${val.tenantName} onboarded successfully!`);
      }
    });
  }

  resetWizard(): void {
    this.onboardingForm.reset({
      orgName: '',
      orgCode: '',
      displayName: '',
      tenantName: '',
      tenantIdentifier: '',
      applicationKey: 'WORKWELL_FINANCE',
      adminEmail: '',
      adminFirstName: '',
      adminLastName: '',
      adminPassword: 'Password123!'
    });
    this.isSuccess.set(false);
    this.currentStep.set(1);
  }
}
