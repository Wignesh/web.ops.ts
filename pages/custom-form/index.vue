<template>
  <div class="bg-gray-100">
    <form v-for="(formGroup, index) in formArray.groups" :key="index">
      <pre> {{ formGroup.controls }}</pre>
      <label>
        <input type="text" v-model="formGroup.controls.property.value" />
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
    </form>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'

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
    public validators: FormValidatorFn[] = [],
    public valid: boolean = false,
    public disabled: boolean = false,
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
    this.validators.forEach((validator) => {
      const error = validator(value)
      console.log(validator.name)
      if (error.valid) {
        delete this.errors[error.name]
      } else {
        this.errors[error.name] = error
      }
    })
    this.valid = !(Object.keys(this.errors).length > 0)
  }
  get value() {
    return this._value
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
  static required(value: any): FormValidatorError {
    return {
      valid: value !== null && value !== undefined && value !== '',
      message: 'This field is required',
      name: 'required',
    }
  }
  static minLength(value: any, length: number): Boolean {
    return value.length >= length
  }
  static maxLength(value: any, length: number): Boolean {
    return value.length <= length
  }
  static min(min: number, value?: any): FormValidatorError {
    return {
      valid: value >= min,
      message: `This field must be greater than ${min}`,
      name: 'min',
    }
  }
  static max(value: any, max: number): Boolean {
    return value <= max
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
  static pattern(value: any, pattern: RegExp): Boolean {
    return pattern.test(value)
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
          property: new FormField('Hello', [Validators.required]),
          email: new FormField('email', [
            Validators.required,
            Validators.email,
          ]),
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