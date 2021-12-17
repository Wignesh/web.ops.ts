<template>
  <div>
    <div class="flex justify-end items-center py-2">
      <b-button
        class="my-2"
        type="is-primary"
        :disabled="!formArray.groups[0].valid"
        @click="formArray.reset()"
        >Submit</b-button
      >
    </div>
    <div class="flex space-x-2 my-4">
      <pre class="bg-gray-100 text-green-500 w-1/2">
"formArray": {{ formArray.toString() }}</pre
      >
      <pre class="bg-gray-100 text-pink-500 w-1/2">
"formGroup": {{ formArray.groups[0].toString() }}</pre
      >
    </div>
    <form v-for="(formGroup, index) in formArray.groups" :key="index">
      <div class="flex items-start space-x-3 w-full">
        <label class="w-[33.33%]">
          <input
            class="
              w-full
              p-2
              border
              rounded-md
              shadow-sm
              focus:ring-2 focus:ring-blue-500
              transition-all
              ease-in-out
              block
              duration-100
            "
            @blur="formGroup.controls.property.onBlur()"
            type="text"
            placeholder="Property"
            v-model="formGroup.controls.property.value"
          />
          <span
            class="block text-red-500 bg-red-100 p-1"
            v-if="
              !formGroup.controls.property.valid &&
              formGroup.controls.property.touched
            "
            >{{ formGroup.controls.property.getBailErrorMessage() }}</span
          >
          <pre class="bg-gray-100 text-pink-500 my-4">
"formField": {{ formGroup.controls.property.toString() }}
          </pre>
        </label>
        <label class="w-[33.33%]">
          <input
            class="
              w-full
              p-2
              border
              rounded-md
              shadow-sm
              focus:ring-2 focus:ring-blue-500
              transition-all
              ease-in-out
              block
              duration-100
            "
            @blur="formGroup.controls.email.onBlur()"
            type="text"
            placeholder="Email"
            v-model="formGroup.controls.email.value"
          />
          <span
            class="block text-red-500 bg-red-100 p-1"
            v-if="
              !formGroup.controls.email.valid &&
              formGroup.controls.email.touched
            "
            >{{ formGroup.controls.email.getBailErrorMessage() }}</span
          >
          <pre class="bg-gray-100 text-pink-500 my-4">
"formField": {{ formGroup.controls.email.toString() }}
          </pre>
        </label>
        <label class="w-[33.33%]">
          <input
            class="
              w-full
              p-2
              border
              rounded-md
              shadow-sm
              focus:ring-2 focus:ring-blue-500
              transition-all
              ease-in-out
              block
              duration-100
            "
            @blur="formGroup.controls.age.onBlur()"
            type="number"
            placeholder="Age"
            v-model="formGroup.controls.age.value"
          />
          <span
            class="block text-red-500 bg-red-100 p-1"
            v-if="
              !formGroup.controls.age.valid && formGroup.controls.age.touched
            "
            >{{ formGroup.controls.age.getBailErrorMessage() }}</span
          >
          <pre class="bg-gray-100 text-pink-500 my-4">
"formField": {{ formGroup.controls.age.toString() }}
          </pre>
        </label>
      </div>
    </form>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { FormArray, FormGroup, FormField, Validators } from './CustomForm'

export default Vue.extend({
  name: 'CustomForm',
  data(): {
    formArray: FormArray
  } {
    return {
      formArray: new FormArray([
        new FormGroup({
          property: new FormField('', [
            Validators.required,
            Validators.nowhitespace,
            Validators.minLength(6),
            Validators.maxLength(10),
          ]),
          email: new FormField('', [Validators.required, Validators.email]),
          age: new FormField('', [
            Validators.required,
            Validators.min(1),
            Validators.max(100),
            Validators.double,
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