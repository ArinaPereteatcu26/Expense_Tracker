/*
import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';

@Directive({
  selector: '[clickOutside]',
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<Event>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    const target = event.target as HTMLElement;
    const isInside = this.elementRef.nativeElement.contains(target);

    if (!isInside) {
      this.clickOutside.emit(event);
    }
  }
}
*/
