import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-wrapper',
  standalone: true,
  imports: [],
  templateUrl: './form-wrapper.component.html',
  styleUrl: './form-wrapper.component.scss',
})
export class FormWrapperComponent {
  @Input() variant: 'default' | 'success' | 'error' | 'warning' = 'default';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() ariaLabel: string = 'Form container';
  @Input() role: string = 'group';
  @Input() customClasses: string = '';

  get wrapperClasses(): string {
    const baseClasses = this.getBaseClasses();
    const variantClasses = this.getVariantClasses();
    const sizeClasses = this.getSizeClasses();

    return `${baseClasses} ${variantClasses} ${sizeClasses} ${this.customClasses}`.trim();
  }

  get dashedBorderClasses(): string {
    const variants = {
      default: 'border-customHsl-white dark:border-gray-600 rounded-3xl',
      success: 'border-green-400 dark:border-green-500 rounded-3xl',
      error: 'border-red-400 dark:border-red-500 rounded-3xl',
      warning: 'border-yellow-400 dark:border-yellow-500 rounded-3xl',
    };

    return variants[this.variant];
  }

  get contentClasses(): string {
    return this.size === 'sm' ? 'text-sm' : this.size === 'lg' ? 'text-lg' : '';
  }

  private getBaseClasses(): string {
    return 'bg-pinkCustom dark:bg-gray-800';
  }

  private getVariantClasses(): string {
    const variants = {
      default:
        'border-l-white dark:border-l-gray-700 border-r-customHsl-bkg dark:border-r-gray-900 border-b-customHsl-bkg dark:border-b-gray-900 border-t-white dark:border-t-gray-700',
      success:
        'border-l-green-200 dark:border-l-green-800 border-r-green-600 dark:border-r-green-900 border-b-green-600 dark:border-b-green-900 border-t-green-200 dark:border-t-green-800',
      error:
        'border-l-red-200 dark:border-l-red-800 border-r-red-600 dark:border-r-red-900 border-b-red-600 dark:border-b-red-900 border-t-red-200 dark:border-t-red-800',
      warning:
        'border-l-yellow-200 dark:border-l-yellow-800 border-r-yellow-600 dark:border-r-yellow-900 border-b-yellow-600 dark:border-b-yellow-900 border-t-yellow-200 dark:border-t-yellow-800',
    };

    return variants[this.variant];
  }

  private getSizeClasses(): string {
    const sizes = {
      sm: 'p-6 rounded-[20px]',
      md: 'p-10 rounded-[25px]',
      lg: 'p-12 rounded-[30px]',
    };

    return sizes[this.size];
  }
}
