<script setup lang="ts">
import { reactive } from 'vue';
import { 
  useFormValidation,
  required,
  email,
  minLength,
  confirmed,
  FormSchema
} from '@ogza/core';

// Form schema
const schema: FormSchema = {
  name: {
    label: 'Name',
    rules: [
      required('Name is required'),
      minLength(2, 'Name must be at least 2 characters')
    ]
  },
  email: {
    label: 'Email',
    rules: [
      required('Email is required'),
      email('Invalid email format')
    ]
  },
  password: {
    label: 'Password',
    rules: [
      required('Password is required'),
      minLength(8, 'Password must be at least 8 characters')
    ]
  },
  confirmPassword: {
    label: 'Confirm Password',
    rules: [
      required('Please confirm password'),
      confirmed('password', 'Passwords do not match')
    ]
  }
};

// Form data
const formData = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// Use validation
const { validate, validateField, errors, clearErrors } = useFormValidation(schema);

// Handle submit
const handleSubmit = async () => {
  const isValid = await validate(formData);
  
  if (isValid) {
    // Submit form
    console.log('Form is valid!', formData);
  } else {
    console.log('Validation errors:', errors);
  }
};

// Handle field blur
const handleBlur = async (fieldName: string) => {
  await validateField(fieldName, formData[fieldName], formData);
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <input 
        v-model="formData.name" 
        @blur="handleBlur('name')"
        placeholder="Name"
      />
      <span v-if="errors.name" class="error">
        {{ errors.name[0] }}
      </span>
    </div>

    <div>
      <input 
        v-model="formData.email" 
        @blur="handleBlur('email')"
        type="email"
        placeholder="Email"
      />
      <span v-if="errors.email" class="error">
        {{ errors.email[0] }}
      </span>
    </div>

    <div>
      <input 
        v-model="formData.password" 
        @blur="handleBlur('password')"
        type="password"
        placeholder="Password"
      />
      <span v-if="errors.password" class="error">
        {{ errors.password[0] }}
      </span>
    </div>

    <div>
      <input 
        v-model="formData.confirmPassword" 
        @blur="handleBlur('confirmPassword')"
        type="password"
        placeholder="Confirm Password"
      />
      <span v-if="errors.confirmPassword" class="error">
        {{ errors.confirmPassword[0] }}
      </span>
    </div>

    <button type="submit">Register</button>
  </form>
</template>

---
React Örneği 

import { useState } from 'react';
import { FormValidator, required, email, minLength } from '@ogza/core';

const validator = new FormValidator();

const schema = {
  email: {
    rules: [required(), email()]
  },
  password: {
    rules: [required(), minLength(8)]
  }
};

function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await validator.validate(formData, schema);
    
    if (result.isSuccess) {
      // Submit
      console.log('Valid!');
    } else {
      setErrors(validator.getErrors());
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      {errors.email && <span>{errors.email[0]}</span>}
      
      <input 
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      {errors.password && <span>{errors.password[0]}</span>}
      
      <button type="submit">Login</button>
    </form>
  );
}

-----
Async Validation (Email uniqueness check):
import { asyncUnique, email, required } from '@ogza/core';

const checkEmailUnique = async (email: string): Promise<boolean> => {
  const response = await fetch(`/api/check-email?email=${email}`);
  const data = await response.json();
  return data.isUnique;
};

const schema = {
  email: {
    rules: [
      required(),
      email(),
      asyncUnique(checkEmailUnique, 'Email already registered')
    ]
  }
};

----
Advanced Validation:

import { creditCard, iban, strongPassword, minAge } from '@ogza/core';

const schema = {
  cardNumber: {
    rules: [creditCard('Invalid credit card')]
  },
  iban: {
    rules: [iban()]
  },
  password: {
    rules: [strongPassword(), minLength(8)]
  },
  birthDate: {
    rules: [minAge(18, 'You must be 18+')]
  }
};