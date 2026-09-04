import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent {
  @Input() title = 'Upload File';
  @Input() subtitle = 'Drag & drop or choose file';
  @Input() buttonText = 'Choose';
  @Input() uploadButtonText = 'Upload';
  @Input() acceptedExtensions: string[] = ['pdf', 'doc', 'docx'];
  @Input() maxFileSizeMb = 5;
  @Input() compact = false;
  @Input() showHeader = true;

  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileRemoved = new EventEmitter<void>();
  @Output() uploadClicked = new EventEmitter<File>();

  selectedFile: File | null = null;
  isDragging = false;
  errorMessage = '';

  get acceptAttribute(): string {
    return this.acceptedExtensions.map(ext => `.${ext}`).join(',');
  }

  get fileSize(): string {
    if (!this.selectedFile) return '';
    const sizeInMb = this.selectedFile.size / (1024 * 1024);
    return `${sizeInMb.toFixed(2)} MB`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (file) {
      this.validateAndSetFile(file);
      input.value = ''; // ✅ allow reselect same file
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    const file = event.dataTransfer?.files?.[0] ?? null;
    if (file) {
      this.validateAndSetFile(file);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.errorMessage = '';
    this.fileRemoved.emit();
  }

  triggerUpload(): void {
    if (!this.selectedFile) return;
    this.uploadClicked.emit(this.selectedFile);
  }

  private validateAndSetFile(file: File): void {
    this.errorMessage = '';

    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const allowed = this.acceptedExtensions.map(e => e.toLowerCase());
    const maxBytes = this.maxFileSizeMb * 1024 * 1024;

    if (!allowed.includes(extension)) {
      this.selectedFile = null;
      this.errorMessage = `Only ${this.acceptedExtensions.join(', ').toUpperCase()} allowed.`;
      return;
    }

    if (file.size > maxBytes) {
      this.selectedFile = null;
      this.errorMessage = `Max size ${this.maxFileSizeMb} MB exceeded.`;
      return;
    }

    this.selectedFile = file;
    this.fileSelected.emit(file);
  }
}