<template>
  <div class="bg-gray-100">
    <form v-for="(formGroup, index) in formArray.groups" :key="index">
      <pre> {{ formGroup.controls.property }}</pre>
      <label>
        <input
          @blur="formGroup.controls.property.onBlur()"
          type="text"
          v-model="formGroup.controls.property.value"
        />
        <span v-if="!formGroup.controls.property.valid">{{
          formGroup.controls.property.errors
        }}</span>
      </label>
      <label>
        <input type="text" v-model="formGroup.controls.email.value" />
        <span v-if="!formGroup.controls.email.valid">{{
          formGroup.controls.email.errors
        }}</span>
      </label>
      <label>
        <input type="text" v-model="formGroup.controls.age.value" />
        <span v-if="!formGroup.controls.age.valid">{{
          formGroup.controls.age.errors
        }}</span>
      </label>
    </form>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'

interface KV {
  [key: string]: any
}

interface ValidationErrors {
  [key: string]: any
}

interface FormValidatorFn {
  (value: any): FormValidatorError
}

interface FormValidatorError {
  valid: boolean
  message: string
  name: string
}

class FormField {
  _initialValue: any
  _value: any
  constructor(
    value: any,
    public validators: (FormValidatorFn | Validators)[] = [],
    public valid: boolean = false,
    public dirty: boolean = false,
    public touched: boolean = false,
    public errors: ValidationErrors = {}
  ) {
    this._initialValue = value
    this._value = value
    this.valid = !(Object.keys(this.errors).length > 0)
  }
  set value(value: any) {
    this._value = value
    this.validate()
  }
  get value() {
    return this._value
  }

  private validate() {
    if (!this.touched) {
      this.touched = this._value !== this._initialValue ? true : false
    }
    this.validators.forEach((validator) => {
      let error = {} as FormValidatorError
      if (typeof validator === 'function') {
        error = validator(this._value)
      } else {
        error = validator.validatorFn({
          ...validator.options,
          value: this._value,
        })
      }
      if (error.valid) {
        delete this.errors[error.name]
      } else {
        this.errors[error.name] = error
      }
    })
    this.dirty = !(this._value == this._initialValue)
    this.valid = !(Object.keys(this.errors).length > 0)
  }

  reset() {
    this._value = this._initialValue
    // this.valid = !(Object.keys(this.errors).length > 0)
    // this.touched = false
    // this.dirty = false
  }

  setError(name: string, error: FormValidatorError) {
    this.errors[name] = error
    this.valid = !(Object.keys(this.errors).length > 0)
  }

  clearError(name: string) {
    delete this.errors[name]
    this.valid = !(Object.keys(this.errors).length > 0)
  }

  clearErrors() {
    this.errors = {}
    this.valid = !(Object.keys(this.errors).length > 0)
  }

  setValidators(validators: (FormValidatorFn | Validators)[]) {
    this.validators = validators
    this.validate()
  }

  onBlur() {
    this.touched = true
    this.validate()
  }
}

class FormGroup {
  constructor(
    public controls: { [key: string]: FormField },
    public value: any | null = null,
    public valid: boolean = false,
    public dirty: boolean = false,
    public touched: boolean = false
  ) {}
}

class FormArray {
  constructor(
    public groups: FormGroup[],
    public value: any[] = [],
    public valid: boolean = false,
    public dirty: boolean = false,
    public touched: boolean = false
  ) {}
}

class Validators {
  constructor(public options: KV = {}, public validatorFn: FormValidatorFn) {}

  static required(value: any): FormValidatorError {
    return {
      valid: value !== null && value !== undefined && value !== '',
      message: 'This field is required',
      name: 'required',
    }
  }

  static email(value: any): FormValidatorError {
    return {
      valid:
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          value
        ),
      message: 'This field must be a valid email',
      name: 'email',
    }
  }

  static alpha(value: any): FormValidatorError {
    return {
      valid: /^[a-zA-Z]+$/.test(value),
      message: 'This field must be alphabetic',
      name: 'alpha',
    }
  }

  static alphaNumeric(value: any): FormValidatorError {
    return {
      valid: /^[a-zA-Z0-9]+$/.test(value),
      message: 'This field must be alphanumeric',
      name: 'alphaNumeric',
    }
  }

  static numeric(value: any): FormValidatorError {
    return {
      valid: /^[0-9]+$/.test(value),
      message: 'This field must be numeric',
      name: 'numeric',
    }
  }

  static minLength(length: number) {
    return new Validators({ length }, Validators._minLength)
  }

  static _minLength(options: KV): FormValidatorError {
    return {
      valid: options?.value.length >= options?.length,
      message: `This field must be at least ${options.length} characters`,
      name: 'minLength',
    }
  }

  static maxLength(length: number) {
    return new Validators({ length }, Validators._maxLength)
  }

  static _maxLength(options: KV): FormValidatorError {
    return {
      valid: options?.value.length <= options?.length,
      message: `This field must be less than ${options?.length} characters`,
      name: 'maxLength',
    }
  }

  static min(min: number) {
    return new Validators({ min }, Validators._min)
  }

  static _min(options: KV): FormValidatorError {
    return {
      valid: options?.value >= options?.min,
      message: `This field must be greater than ${options?.min}`,
      name: 'min',
    }
  }

  static max(max: number) {
    return new Validators({ max }, Validators._max)
  }

  static _max(options: KV): FormValidatorError {
    return {
      valid: options?.value <= options?.max,
      message: `This field must be less than ${options?.max}`,
      name: 'max',
    }
  }

  static pattern(pattern: RegExp) {
    return new Validators({ pattern }, Validators._pattern)
  }

  static _pattern(options: KV): FormValidatorError {
    return {
      valid: options?.pattern.test(options?.value),
      message: 'This field must match the pattern',
      name: 'pattern',
    }
  }
}

export default Vue.extend({
  name: 'CustomForm',
  data(): {
    formArray: FormArray
  } {
    return {
      formArray: new FormArray([
        new FormGroup({
          property: new FormField('Hello', [
            Validators.required,
            Validators.alpha,
            Validators.minLength(5),
          ]),
          email: new FormField('email', [
            Validators.required,
            Validators.email,
          ]),
          age: new FormField('', [Validators.required, Validators.numeric]),
        }),
      ]),
    }
  },
  methods: {},
  computed: {},
  watch: {},
  created() {},
  mounted() {
    console.log(this.formArray)
  },
  destroyed() {},
})
</script>