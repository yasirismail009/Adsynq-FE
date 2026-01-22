# Toast Notification System Guide

This guide explains how to use the integrated react-hot-toast notification system in your KAMPALO application.

## 🚀 Quick Start

The toast system is already integrated and ready to use! Here's how to get started:

### Basic Usage

```jsx
import { useToast } from '../hooks/useToast';

const MyComponent = () => {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };

  const handleError = () => {
    toast.error('Something went wrong!');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  );
};
```

### Direct Import Usage

```jsx
import { showSuccessToast, showErrorToast } from '../hooks/useToast';

const handleAction = () => {
  showSuccessToast('Success message');
  showErrorToast('Error message');
};
```

## 📋 Available Toast Types

### 1. Success Toast
```jsx
toast.success('Success message');
// or
showSuccessToast('Success message');
```

### 2. Error Toast
```jsx
toast.error('Error message');
// or
showErrorToast('Error message');
```

### 3. Warning Toast
```jsx
toast.warning('Warning message');
// or
showWarningToast('Warning message');
```

### 4. Info Toast
```jsx
toast.info('Info message');
// or
showInfoToast('Info message');
```

### 5. Loading Toast
```jsx
const loadingToast = toast.loading('Loading...');
// Do something async
setTimeout(() => {
  toast.dismiss(loadingToast);
  toast.success('Completed!');
}, 2000);
```

### 6. Promise Toast
```jsx
const promise = fetch('/api/data');
toast.promise(promise, {
  loading: 'Loading...',
  success: 'Data loaded!',
  error: 'Failed to load data',
});
```

## 🎨 Customization

### Toast Options

Each toast function accepts an optional options object:

```jsx
toast.success('Message', {
  duration: 5000, // Custom duration
  id: 'unique-id', // Custom ID
  // ... other react-hot-toast options
});
```

### Global Configuration

The toast system is configured in `src/components/ui/Toast.jsx` with:

- **Position**: Top-right
- **Duration**: 4 seconds (success/info), 5 seconds (error)
- **Styling**: Tailwind classes that match your design system
- **Dark mode**: Fully supported
- **Icons**: Heroicons integration

## 🔧 Advanced Usage

### Dismissing Toasts

```jsx
const toastId = toast.success('Message');
toast.dismiss(toastId); // Dismiss specific toast
toast.dismissAll(); // Dismiss all toasts
```

### Custom Toast Content

```jsx
toast.custom((t) => (
  <div className="bg-blue-100 p-4 rounded">
    <h3>Custom Title</h3>
    <p>Custom message</p>
  </div>
));
```

### Toast with Actions

```jsx
toast.success('Message', {
  duration: 10000,
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo clicked'),
  },
});
```

## 🎯 Integration Examples

### Authentication

```jsx
// In AuthContext.jsx
const login = async (email, password) => {
  const loadingToast = showLoadingToast('Signing in...');
  
  try {
    const result = await apiService.auth.login({ email, password });
    toast.dismiss(loadingToast);
    showSuccessToast('Successfully signed in!');
  } catch (error) {
    toast.dismiss(loadingToast);
    showErrorToast('Login failed');
  }
};
```

### Form Validation

```jsx
const handleSubmit = async (formData) => {
  if (!formData.email) {
    showErrorToast('Email is required');
    return;
  }
  
  try {
    await submitForm(formData);
    showSuccessToast('Form submitted successfully!');
  } catch (error) {
    showErrorToast('Failed to submit form');
  }
};
```

### API Calls

```jsx
const fetchData = async () => {
  const promise = apiService.getData();
  
  toast.promise(promise, {
    loading: 'Loading data...',
    success: 'Data loaded successfully!',
    error: 'Failed to load data',
  });
};
```

## 🎨 Styling

The toast system uses Tailwind classes that automatically adapt to your theme:

- **Light mode**: Clean white backgrounds with colored borders
- **Dark mode**: Dark backgrounds with appropriate contrast
- **Icons**: Heroicons with semantic colors
- **Animations**: Smooth enter/exit animations

### Color Scheme

- **Success**: Green (`bg-green-50`, `border-green-200`)
- **Error**: Red (`bg-red-50`, `border-red-200`)
- **Warning**: Yellow (`bg-yellow-50`, `border-yellow-200`)
- **Info**: Blue (`bg-blue-50`, `border-blue-200`)

## 🔄 Migration from Old System

If you were using the old Redux-based toast system:

### Old Way
```jsx
import { useAppDispatch } from '../store/hooks';
import { showToast } from '../store/slices/uiSlice';

const dispatch = useAppDispatch();
dispatch(showToast({ type: 'success', message: 'Success!' }));
```

### New Way
```jsx
import { useToast } from '../hooks/useToast';

const toast = useToast();
toast.success('Success!');
```

## 🚀 Best Practices

1. **Keep messages concise** - Users scan notifications quickly
2. **Use appropriate types** - Success for confirmations, error for failures
3. **Provide context** - Include relevant information in error messages
4. **Don't overuse** - Too many toasts can be annoying
5. **Handle loading states** - Show loading toasts for async operations
6. **Dismiss appropriately** - Clear loading toasts when operations complete

## 🛠️ Troubleshooting

### Toast not appearing?
- Ensure `<Toast />` component is rendered in your app
- Check that react-hot-toast is installed
- Verify import paths are correct

### Styling issues?
- Check Tailwind classes in `Toast.jsx`
- Ensure dark mode classes are applied correctly
- Verify Heroicons are imported properly

### Performance issues?
- Use `toast.dismiss()` to clear unnecessary toasts
- Avoid showing too many toasts simultaneously
- Consider using `toast.promise()` for async operations

## 📚 Additional Resources

- [react-hot-toast Documentation](https://react-hot-toast.com/)
- [Heroicons Documentation](https://heroicons.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

The toast system is now fully integrated and ready to enhance your user experience! 🎉 