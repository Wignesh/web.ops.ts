/* eslint-disable */
export interface KV {
    [key: string]: any
}

export interface ValidationErrors {
    [key: string]: any
}

export interface FormValidatorFn {
    (value: any): FormValidatorError
}

export interface FormValidatorError {
    valid: boolean
    message: string
    name: string
}

export class FormField {
    initialValue: any
    _value: any
    parent: FormGroup | null = null
    constructor(
        value: any,
        public validators: (FormValidatorFn | Validators)[] = [],
        public valid: boolean = false,
        public dirty: boolean = false,
        public touched: boolean = false,
        public errors: ValidationErrors = {}
    ) {
        this.initialValue = JSON.parse(JSON.stringify(value))
        this._value = value
        this.valid = this.validators.length === 0
        this.validate()
    }

    set value(value: any) {
        this._value = value
        if (!this.touched) {
            this.touched = this._value !== this.initialValue ? true : false
        }
        this.validate()
    }

    get value() {
        return this._value
    }

    getError(name: string) {
        return this.errors[name]
    }

    getErrorMessage(name: string) {
        const error = this.getError(name)
        return error ? error.message : ''
    }

    getErrorMessages() {
        return Object.values(this.errors).map((error) => error.message)
    }

    getBailErrorMessage() {
        const errors = this.getErrorMessages()
        return errors.length > 0 ? errors[0] : ''
    }

    private validate() {
        this.validators.forEach((validator) => {
            let error = {} as FormValidatorError
            if (typeof validator === 'function') {
                error = validator(this._value)
            } else {
                error = validator.validatorFn(this._value)
            }
            if (error.valid) {
                delete this.errors[error.name]
            } else {
                this.errors[error.name] = error
            }
        })
        this.dirty = !(JSON.stringify(this._value) == JSON.stringify(this.initialValue))
        this.valid = !(Object.keys(this.errors).length > 0)
        this.parent?.update()
    }

    json() {
        return {
            value: this._value,
            valid: this.valid,
            dirty: this.dirty,
            touched: this.touched,
            errors: this.errors,
        }
    }

    toString() {
        return JSON.stringify(
            this.json(),
            null,
            2
        )
    }

    reset() {
        this._value = JSON.parse(JSON.stringify(this.initialValue))
        this.valid = false
        this.touched = false
        this.dirty = false
        this.errors = {}
        this.validate()
    }

    setError(error: FormValidatorError) {
        this.errors[error.name] = error
        // this.valid = !(Object.keys(this.errors).length > 0)
        this.validate()
    }

    removeError(name: string) {
        delete this.errors[name]
        // this.valid = !(Object.keys(this.errors).length > 0)
        this.validate()
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

export class FormGroup {
    errors: { [key: string]: ValidationErrors } = {}
    constructor(
        public controls: { [key: string]: FormField },
        public parent: FormArray | null = null,
        public value: any | null = null,
        public valid: boolean = false,
        public dirty: boolean = false,
        public touched: boolean = false
    ) {
        Object.keys(controls).forEach((key) => {
            this.controls[key].parent = this
        })
        this.update()
    }

    update() {
        this.value = Object.entries(this.controls).reduce((acc, curr) => {
            return { ...acc, [curr[0]]: curr[1].value }
        }, {})

        this.dirty = Object.values(this.controls)
            .map((control) => control.dirty)
            .includes(true)
        this.touched = Object.values(this.controls)
            .map((control) => control.touched)
            .includes(true)
        this.valid = !Object.values(this.controls)
            .map((control) => control.valid)
            .includes(false)
        this.errors = Object.entries(this.controls).reduce((acc, curr) => {
            return { ...acc, [curr[0]]: curr[1].errors }
        }, {})
        this.parent?.update()
    }

    reset() {
        Object.values(this.controls).forEach((control) => {
            control.reset()
        })
        this.update()
    }

    json() {
        return {
            value: this.value,
            valid: this.valid,
            dirty: this.dirty,
            touched: this.touched,
            errors: this.errors,
        }
    }

    toString() {
        return JSON.stringify(
            this.json(),
            null,
            2
        )
    }
}

export class FormArray {
    errors: { [key: string]: ValidationErrors }[] = []
    constructor(
        public groups: FormGroup[],
        public value: any[] = [],
        public valid: boolean = false,
        public dirty: boolean = false,
        public touched: boolean = false
    ) {
        this.groups.forEach((group) => {
            group.parent = this
        })
        this.update()
    }

    update() {
        this.value = this.groups.map((group) => group.value)
        this.dirty = this.groups.map((group) => group.dirty).includes(true)
        this.touched = this.groups.map((group) => group.touched).includes(true)
        this.valid = !this.groups.map((group) => group.valid).includes(false)
        this.errors = this.groups.map((group) => group.errors)
    }

    reset() {
        this.groups.forEach((group) => group.reset())
        this.update()
    }

    json() {
        return {
            value: this.value,
            valid: this.valid,
            dirty: this.dirty,
            touched: this.touched,
            errors: this.errors,
        }
    }

    toString() {
        return JSON.stringify(
            this.json(),
            null,
            2
        )
    }
}

export class Validators {

    constructor(public options: KV = {}, public validatorFn: FormValidatorFn) { }

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

    static domain(value: any): FormValidatorError {
        return {
            valid:
                /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(
                    value
                ),
            message: 'This field must be a valid domain',
            name: 'domain',
        }
    }

    static double(value: any): FormValidatorError {
        return {
            valid: /^[0-9]*\.?[0-9]+$/.test(value),
            message: 'This field must be a valid double',
            name: 'double',
        }
    }

    static nowhitespace(value: any): FormValidatorError {
        return {
            valid: /^\S+$/.test(value),
            message: 'This field must not contain any whitespace',
            name: 'nowhitespace',
        }
    }

    static minLength(length: number): Validators {
        return new Validators({ length }, (value: any): FormValidatorError => {
            return {
                valid: value.length >= length,
                message: `This field must be at least ${length} characters`,
                name: 'minLength',
            }
        })
    }

    static maxLength(length: number) {
        return new Validators({ length }, (value: any): FormValidatorError => {
            return {
                valid: value.length <= length,
                message: `This field must be less than ${length} characters`,
                name: 'maxLength',
            }
        })
    }

    static min(min: number) {
        return new Validators({ min }, (value: any): FormValidatorError => {
            return {
                valid: value >= min,
                message: `This field must be greater than ${min}`,
                name: 'min',
            }
        })
    }

    static max(max: number) {
        return new Validators({ max }, (value: any): FormValidatorError => {
            return {
                valid: value <= max,
                message: `This field must be less than ${max}`,
                name: 'max',
            }
        })
    }

    static pattern(pattern: RegExp) {
        return new Validators({ pattern }, (value: any): FormValidatorError => {
            return {
                valid: pattern.test(value),
                message: 'This field must match the pattern',
                name: 'pattern',
            }
        })
    }
}