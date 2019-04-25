import { Directive, HostListener, Input, Injectable, Self, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';
import { SimpleMask } from '../simple-mask';

@Directive({
  selector: '[simpleMask]'
})

/** Mask used on answer component */
@Injectable()
export class SimpleMaskDirective extends SimpleMask {
  @Input('simpleMask') mask: string;
  @Input() clearIfNotMatch: boolean;

  constructor(
    @Self() public ngControl: NgControl,
    private renderer: Renderer2
  ) { 
    super();
  }

  @HostListener('input', ['$event'])
  onInput(event: KeyboardEvent): void {
    const el: HTMLInputElement = <HTMLInputElement>event.target;
    const value = this.fitToMask(el.value);
    this.writeValue(value, event.target);
  }

  @HostListener('blur', ['$event'])
  onBlur(event: Event) {
    const el: HTMLInputElement = <HTMLInputElement>event.target;
    if (el.value && !this.matchMask(el.value) && this.clearIfNotMatch) {
      this.writeValue(null, event.target);
    }
  }

  @HostListener('ionBlur', ['$event'])
  inputOnblur(event: Event): void {
    this.onBlur(event);
  }

  @Input('addPatterns')
  set addPatterns(values: any) {
    if (!values) {
      return;
    }
    try {
      JSON.parse(JSON.stringify(values));
    } catch {
      throw new Error('Invalid object on addPatterns field');
    }
    Object.keys(values).forEach((key) => {
      this.patterns[key] = new RegExp(values[key]);
    });
  }

  @Input('newPatterns')
  set newPatterns(values: any) {
    if (!values) {
      return;
    }
    try {
      JSON.parse(JSON.stringify(values));
    } catch {
      throw new Error('Invalid object on newPatterns field');
    }
    this.patterns = {};
    Object.keys(values).forEach((key) => {
      this.patterns[key] = new RegExp(values[key]);
    });
  }

  /**
   * write the new value on input element and form control
   * @param value value to write
   * @param target input element
   */
  private writeValue(value: string | null, target: any): void {
    target.value = value;
    this.renderer.setProperty(target, 'value', value);
    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setValue(value);
      this.ngControl.control.markAsDirty();
      this.ngControl.control.updateValueAndValidity();
    }
  }

  /**
   * Checks if the value matches with the mask and is completed
   * @param value value to check
   * @returns true if match, false if not match
   */
  private matchMask(value: string): boolean {
    // value size adjust to mask size
    const size = this.mask.replace('\\', '').length;
    value = value.substring(0, size);

    return value.length === size ? true : false;
  }
}