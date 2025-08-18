# Validation Utilities Guide

This guide explains how to use the shared validation utilities in your AdSynq application.

## 🚀 Quick Start

Import the validation functions you need:

```jsx
import { 
  isValidEmail, 
  isValidPhone, 
  validatePassword, 
  getPasswordStrength,
  validateUsername,
  validateName 
} from '../utils/validation';
```

## 📋 Available Validation Functions

### 1. Email Validation

```jsx
import { isValidEmail } from '../utils/validation';

// Returns true if email is valid
const isValid = isValidEmail('user@example.com'); // true
const isInvalid = isValidEmail('invalid-email'); // false
```

**Regex Pattern**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### 2. Phone Number Validation

```jsx
import { isValidPhone } from '../utils/validation';

// Supports international formats
const validPhones = [
  '+1234567890',
  '1234567890',
  '+1 (234) 567-8900',
  '123-456-7890',
  '+44 20 7946 0958'
];

validPhones.forEach(phone => {
  console.log(`${phone}: ${isValidPhone(phone)}`);
});
```

**Regex Pattern**: `/^[\+]?[1-9][\d\s\-\(\)]{7,15}$/`

### 3. Password Validation

```jsx
import { validatePassword } from '../utils/validation';

const password = 'MyPassword123';
const errors = validatePassword(password);

if (errors.length === 0) {
  console.log('Password is valid');
} else {
  console.log('Password errors:', errors);
  // Output: ['Password must contain at least one special character']
}
```

**Requirements**:
- At least 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number

### 4. Password Strength Scoring

```jsx
import { getPasswordStrength } from '../utils/validation';

const password = 'MyPassword123!';
const strength = getPasswordStrength(password);

console.log(strength);
// Output: { score: 5, label: 'Very Strong', color: 'bg-green-600' }
```

**Strength Levels**:
- 0: Very Weak (red)
- 1: Weak (orange)
- 2: Fair (yellow)
- 3: Good (blue)
- 4: Strong (green)
- 5: Very Strong (dark green)

### 5. Username Validation

```jsx
import { validateUsername } from '../utils/validation';

const username = 'john_doe123';
const error = validateUsername(username);

if (error) {
  console.log('Username error:', error);
} else {
  console.log('Username is valid');
}
```

**Requirements**:
- 3-30 characters
- Only letters, numbers, underscores, and hyphens
- Required field

### 6. Name Validation

```jsx
import { validateName } from '../utils/validation';

const firstName = 'John';
const lastName = 'Doe';
const firstNameError = validateName(firstName, 'First name');
const lastNameError = validateName(lastName, 'Last name');

if (firstNameError) console.log(firstNameError);
if (lastNameError) console.log(lastNameError);
```

**Requirements**:
- 2-50 characters
- Only letters, spaces, hyphens, and apostrophes
- Required field

## 🎯 Usage Examples

### Form Validation

```jsx
import { 
  isValidEmail, 
  validatePassword, 
  validateUsername 
} from '../utils/validation';

const validateForm = (formData) => {
  const errors = {};

  // Email validation
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Username validation
  const usernameError = validateUsername(formData.username);
  if (usernameError) {
    errors.username = usernameError;
  }

  // Password validation
  if (!formData.password) {
    errors.password = 'Password is required';
  } else {
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      errors.password = passwordErrors[0];
    }
  }

  return errors;
};
```

### Real-time Validation

```jsx
import { getPasswordStrength } from '../utils/validation';

const PasswordField = () => {
  const [password, setPassword] = useState('');
  const strength = getPasswordStrength(password);

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
      />
      
      {password && (
        <div className="mt-2">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-2 flex-1 rounded ${
                  level <= strength.score ? strength.color : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm mt-1">{strength.label}</p>
        </div>
      )}
    </div>
  );
};
```

### Custom Validation

```jsx
import { validateRequired, validateMinLength, validateMaxLength } from '../utils/validation';

const validateCustomField = (value, fieldName) => {
  // Check if required
  const requiredError = validateRequired(value, fieldName);
  if (requiredError) return requiredError;

  // Check minimum length
  const minError = validateMinLength(value, 5, fieldName);
  if (minError) return minError;

  // Check maximum length
  const maxError = validateMaxLength(value, 100, fieldName);
  if (maxError) return maxError;

  return null; // No errors
};
```

## 🔧 Helper Functions

### validateRequired(value, fieldName)
Returns an error message if the value is empty or only whitespace.

### validateMinLength(value, minLength, fieldName)
Returns an error message if the value is shorter than the minimum length.

### validateMaxLength(value, maxLength, fieldName)
Returns an error message if the value is longer than the maximum length.

## 🎨 Integration with Toast System

```jsx
import { showErrorToast } from '../hooks/useToast';
import { isValidEmail } from '../utils/validation';

const handleSubmit = (formData) => {
  if (!isValidEmail(formData.email)) {
    showErrorToast('Please enter a valid email address');
    return;
  }
  
  // Continue with form submission
};
```

## 🚀 Best Practices

1. **Use shared validation** - Don't duplicate validation logic
2. **Validate early** - Check input as users type
3. **Show clear messages** - Use descriptive error messages
4. **Combine with toasts** - Use toast notifications for immediate feedback
5. **Test edge cases** - Validate with various input formats
6. **Keep consistent** - Use the same validation across components

## 🛠️ Custom Validation

To add new validation functions:

```jsx
// Add to src/utils/validation.js
export const validateCustomField = (value) => {
  if (!value) {
    return 'Field is required';
  }
  
  // Add your custom validation logic
  if (!/your-regex/.test(value)) {
    return 'Invalid format';
  }
  
  return null; // No error
};
```

## 📚 Regex Patterns Used

- **Email**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Phone**: `/^[\+]?[1-9][\d\s\-\(\)]{7,15}$/`
- **Username**: `/^[a-zA-Z0-9_-]+$/`
- **Name**: `/^[a-zA-Z\s'-]+$/`
- **Password**: Multiple patterns for different requirements

---

The validation utilities are now ready to use throughout your application! 🎉 