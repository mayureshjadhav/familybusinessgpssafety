import { Component, Input } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { ValidationService } from "./../services/validation.service";

@Component({
  selector: 'control-messages',
  template: `<Label *ngIf="errorMessage !== null" text="{{errorMessage}}" textWrap="true" class="roboto-regular text-danger"></Label>`
})
export class ControlMessagesComponent {
  @Input() control: FormControl;

  @Input() controlName: string;
  constructor() { }

  get errorMessage() {
    for (let propertyName in this.control.errors) {
      if (this.control.errors.hasOwnProperty(propertyName) && (this.control.dirty || this.control.touched)) {
        return ValidationService.getValidatorErrorMessage(propertyName, this.controlName, this.control.errors[propertyName]);
      }
      // if (this.control.errors.hasOwnProperty(propertyName) && this.control.dirty) {
      //   return ValidationService.getValidatorErrorMessage(propertyName, this.controlName, this.control.errors[propertyName]);
      // }
    }
    
    return null;
  }
}