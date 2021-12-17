"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.Validators = exports.FormArray = exports.FormGroup = exports.FormField = void 0;
var FormField = /** @class */ (function () {
    function FormField(value, validators, valid, dirty, touched, errors) {
        if (validators === void 0) { validators = []; }
        if (valid === void 0) { valid = false; }
        if (dirty === void 0) { dirty = false; }
        if (touched === void 0) { touched = false; }
        if (errors === void 0) { errors = {}; }
        this.validators = validators;
        this.valid = valid;
        this.dirty = dirty;
        this.touched = touched;
        this.errors = errors;
        this.parent = null;
        this.initialValue = JSON.parse(JSON.stringify(value));
        this._value = value;
        this.valid = this.validators.length === 0;
        this.validate();
    }
    Object.defineProperty(FormField.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            this._value = value;
            if (!this.touched) {
                this.touched = this._value !== this.initialValue ? true : false;
            }
            this.validate();
        },
        enumerable: false,
        configurable: true
    });
    FormField.prototype.getError = function (name) {
        return this.errors[name];
    };
    FormField.prototype.getErrorMessage = function (name) {
        var error = this.getError(name);
        return error ? error.message : '';
    };
    FormField.prototype.getErrorMessages = function () {
        return Object.values(this.errors).map(function (error) { return error.message; });
    };
    FormField.prototype.getBailErrorMessage = function () {
        var errors = this.getErrorMessages();
        return errors.length > 0 ? errors[0] : '';
    };
    FormField.prototype.validate = function () {
        var _this = this;
        var _a;
        this.validators.forEach(function (validator) {
            var error = {};
            if (typeof validator === 'function') {
                error = validator(_this._value);
            }
            else {
                error = validator.validatorFn(_this._value);
            }
            if (error.valid) {
                delete _this.errors[error.name];
            }
            else {
                _this.errors[error.name] = error;
            }
        });
        this.dirty = !(JSON.stringify(this._value) == JSON.stringify(this.initialValue));
        this.valid = !(Object.keys(this.errors).length > 0);
        (_a = this.parent) === null || _a === void 0 ? void 0 : _a.update();
    };
    FormField.prototype.toString = function () {
        return JSON.stringify({
            value: this._value,
            valid: this.valid,
            dirty: this.dirty,
            touched: this.touched,
            errors: this.errors
        }, null, 2);
    };
    FormField.prototype.reset = function () {
        this._value = JSON.parse(JSON.stringify(this.initialValue));
        this.valid = false;
        this.touched = false;
        this.dirty = false;
        this.errors = {};
        this.validate();
    };
    FormField.prototype.setError = function (error) {
        this.errors[error.name] = error;
        // this.valid = !(Object.keys(this.errors).length > 0)
        this.validate();
    };
    FormField.prototype.removeError = function (name) {
        delete this.errors[name];
        // this.valid = !(Object.keys(this.errors).length > 0)
        this.validate();
    };
    FormField.prototype.setValidators = function (validators) {
        this.validators = validators;
        this.validate();
    };
    FormField.prototype.onBlur = function () {
        this.touched = true;
        this.validate();
    };
    return FormField;
}());
exports.FormField = FormField;
var FormGroup = /** @class */ (function () {
    function FormGroup(controls, parent, value, valid, dirty, touched) {
        var _this = this;
        if (parent === void 0) { parent = null; }
        if (value === void 0) { value = null; }
        if (valid === void 0) { valid = false; }
        if (dirty === void 0) { dirty = false; }
        if (touched === void 0) { touched = false; }
        this.controls = controls;
        this.parent = parent;
        this.value = value;
        this.valid = valid;
        this.dirty = dirty;
        this.touched = touched;
        this.errors = {};
        Object.keys(controls).forEach(function (key) {
            _this.controls[key].parent = _this;
        });
        this.update();
    }
    FormGroup.prototype.update = function () {
        var _a;
        this.value = Object.entries(this.controls).reduce(function (acc, curr) {
            var _a;
            return __assign(__assign({}, acc), (_a = {}, _a[curr[0]] = curr[1].value, _a));
        }, {});
        this.dirty = Object.values(this.controls)
            .map(function (control) { return control.dirty; })
            .includes(true);
        this.touched = Object.values(this.controls)
            .map(function (control) { return control.touched; })
            .includes(true);
        this.valid = !Object.values(this.controls)
            .map(function (control) { return control.valid; })
            .includes(false);
        this.errors = Object.entries(this.controls).reduce(function (acc, curr) {
            var _a;
            return __assign(__assign({}, acc), (_a = {}, _a[curr[0]] = curr[1].errors, _a));
        }, {});
        (_a = this.parent) === null || _a === void 0 ? void 0 : _a.update();
    };
    FormGroup.prototype.reset = function () {
        Object.values(this.controls).forEach(function (control) {
            control.reset();
        });
        this.update();
    };
    FormGroup.prototype.toString = function () {
        return JSON.stringify({
            value: this.value,
            valid: this.valid,
            dirty: this.dirty,
            touched: this.touched,
            errors: this.errors
        }, null, 2);
    };
    return FormGroup;
}());
exports.FormGroup = FormGroup;
var FormArray = /** @class */ (function () {
    function FormArray(groups, value, valid, dirty, touched) {
        var _this = this;
        if (value === void 0) { value = []; }
        if (valid === void 0) { valid = false; }
        if (dirty === void 0) { dirty = false; }
        if (touched === void 0) { touched = false; }
        this.groups = groups;
        this.value = value;
        this.valid = valid;
        this.dirty = dirty;
        this.touched = touched;
        this.errors = [];
        this.groups.forEach(function (group) {
            group.parent = _this;
        });
        this.update();
    }
    FormArray.prototype.update = function () {
        this.value = this.groups.map(function (group) { return group.value; });
        this.dirty = this.groups.map(function (group) { return group.dirty; }).includes(true);
        this.touched = this.groups.map(function (group) { return group.touched; }).includes(true);
        this.valid = !this.groups.map(function (group) { return group.valid; }).includes(false);
        this.errors = this.groups.map(function (group) { return group.errors; });
    };
    FormArray.prototype.reset = function () {
        this.groups.forEach(function (group) { return group.reset(); });
        this.update();
    };
    FormArray.prototype.toString = function () {
        return JSON.stringify({
            value: this.value,
            valid: this.valid,
            dirty: this.dirty,
            touched: this.touched,
            errors: this.errors
        }, null, 2);
    };
    return FormArray;
}());
exports.FormArray = FormArray;
var Validators = /** @class */ (function () {
    function Validators(options, validatorFn) {
        if (options === void 0) { options = {}; }
        this.options = options;
        this.validatorFn = validatorFn;
    }
    Validators.required = function (value) {
        return {
            valid: value !== null && value !== undefined && value !== '',
            message: 'This field is required',
            name: 'required'
        };
    };
    Validators.email = function (value) {
        return {
            valid: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value),
            message: 'This field must be a valid email',
            name: 'email'
        };
    };
    Validators.alpha = function (value) {
        return {
            valid: /^[a-zA-Z]+$/.test(value),
            message: 'This field must be alphabetic',
            name: 'alpha'
        };
    };
    Validators.alphaNumeric = function (value) {
        return {
            valid: /^[a-zA-Z0-9]+$/.test(value),
            message: 'This field must be alphanumeric',
            name: 'alphaNumeric'
        };
    };
    Validators.numeric = function (value) {
        return {
            valid: /^[0-9]+$/.test(value),
            message: 'This field must be numeric',
            name: 'numeric'
        };
    };
    Validators.domain = function (value) {
        return {
            valid: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(value),
            message: 'This field must be a valid domain',
            name: 'domain'
        };
    };
    Validators.double = function (value) {
        return {
            valid: /^[0-9]*\.?[0-9]+$/.test(value),
            message: 'This field must be a valid double',
            name: 'double'
        };
    };
    Validators.nowhitespace = function (value) {
        return {
            valid: /^\S+$/.test(value),
            message: 'This field must not contain any whitespace',
            name: 'nowhitespace'
        };
    };
    Validators.minLength = function (length) {
        return new Validators({ length: length }, function (value) {
            return {
                valid: value.length >= length,
                message: "This field must be at least " + length + " characters",
                name: 'minLength'
            };
        });
    };
    Validators.maxLength = function (length) {
        return new Validators({ length: length }, function (value) {
            return {
                valid: value.length <= length,
                message: "This field must be less than " + length + " characters",
                name: 'maxLength'
            };
        });
    };
    Validators.min = function (min) {
        return new Validators({ min: min }, function (value) {
            return {
                valid: value >= min,
                message: "This field must be greater than " + min,
                name: 'min'
            };
        });
    };
    Validators.max = function (max) {
        return new Validators({ max: max }, function (value) {
            return {
                valid: value <= max,
                message: "This field must be less than " + max,
                name: 'max'
            };
        });
    };
    Validators.pattern = function (pattern) {
        return new Validators({ pattern: pattern }, function (value) {
            return {
                valid: pattern.test(value),
                message: 'This field must match the pattern',
                name: 'pattern'
            };
        });
    };
    return Validators;
}());
exports.Validators = Validators;
