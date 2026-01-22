# Theming System Guide

A comprehensive theming system built with Tailwind CSS, CSS custom properties, and Redux Toolkit for the KAMPALO B2B SaaS application.

## 🎨 Color Palette

Based on your design system, we've implemented a complete color palette:

### Primary Colors
- **Primary**: `#6C5DD3` (Purple)
- **Secondary**: `#0074F2` (Blue)
- **Neutral**: `#231F23` (Dark Gray)

### Color Scale
Each color includes a full scale from 50-900:
```css
primary: {
  50: '#F5F4FF',   /* Lightest */
  100: '#E8E5FF',
  200: '#D1CCFF',
  300: '#B3ABFF',
  400: '#8B7FE8',
  500: '#6C5DD3',  /* Base */
  600: '#5A4BC7',
  700: '#4A3BB8',
  800: '#3D2F9A',
  900: '#2F2477'   /* Darkest */
}
```

## 🏗️ Architecture

### File Structure
```
src/
├── styles/
│   └── theme.css              # CSS custom properties
├── store/
│   └── slices/
│       └── themeSlice.js      # Theme state management
├── hooks/
│   └── useTheme.js            # Theme hook
├── components/ui/
│   ├── ThemeProvider.jsx      # Theme provider
│   ├── ThemeToggle.jsx        # Simple toggle
│   └── ThemeSwitcher.jsx      # Advanced switcher
└── index.css                  # Global styles
```

### Theme Modes
- **Light**: Default light theme
- **Dark**: Dark theme with proper contrast
- **High Contrast**: Accessibility-focused theme
- **Auto**: Follows system preference

## 🚀 Usage

### Basic Theme Toggle
```jsx
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from '../components/ui/ThemeToggle';

function MyComponent() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <div>
      <ThemeToggle />
      <button onClick={toggleTheme}>
        Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  );
}
```

### Advanced Theme Switcher
```jsx
import ThemeSwitcher from '../components/ui/ThemeSwitcher';

function Header() {
  return (
    <header className="bg-white dark:bg-neutral-900">
      <ThemeSwitcher />
    </header>
  );
}
```

### Using Theme Colors in Components
```jsx
function Card({ children }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 shadow-medium">
      {children}
    </div>
  );
}

function Button({ variant = 'primary', children }) {
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white',
    outline: 'border border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20',
  };
  
  return (
    <button className={`px-4 py-2 rounded-lg transition-colors ${variants[variant]}`}>
      {children}
    </button>
  );
}
```

## 🎯 Tailwind CSS Classes

### Background Colors
```css
.bg-primary-500      /* Primary color */
.bg-secondary-500    /* Secondary color */
.bg-neutral-100      /* Light neutral */
.bg-neutral-900      /* Dark neutral */
.bg-white            /* Pure white */
.bg-glass            /* Glass effect */
.bg-glass-dark       /* Dark glass effect */
```

### Text Colors
```css
.text-primary-500    /* Primary text */
.text-secondary-500  /* Secondary text */
.text-neutral-600    /* Body text */
.text-neutral-400    /* Muted text */
.text-gradient-primary /* Gradient text */
```

### Border Colors
```css
.border-primary-200  /* Light primary border */
.border-neutral-300  /* Default border */
.border-focus        /* Focus state border */
```

### Shadows
```css
.shadow-light        /* Subtle shadow */
.shadow-medium       /* Medium shadow */
.shadow-heavy        /* Heavy shadow */
.shadow-glow         /* Glow effect */
```

## 🌙 Dark Mode Support

### Automatic Dark Mode
All components automatically support dark mode using Tailwind's `dark:` prefix:

```jsx
<div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
  Content
</div>
```

### CSS Custom Properties
Dark mode variables are automatically applied:

```css
[data-theme="dark"] {
  --color-bg-primary: #231F23;
  --color-text-primary: #FFFFFF;
  --color-border-primary: #4B5563;
}
```

## ♿ Accessibility Features

### Reduced Motion
```jsx
const { reducedMotion } = useTheme();

// Components automatically respect reduced motion preferences
<motion.div
  animate={{ opacity: 1 }}
  transition={{ duration: reducedMotion ? 0 : 0.3 }}
>
  Content
</motion.div>
```

### High Contrast Mode
```css
[data-theme="high-contrast"] {
  --color-text-primary: #000000;
  --color-bg-primary: #FFFFFF;
  --color-border-primary: #000000;
}
```

### Large Text & Bold Text
```jsx
const { largeText, boldText } = useTheme();

<div className={`${largeText ? 'text-lg' : 'text-base'} ${boldText ? 'font-semibold' : 'font-normal'}`}>
  Accessible text
</div>
```

## 🎨 Customization

### Adding New Colors
1. **Update CSS Variables** in `src/styles/theme.css`:
```css
:root {
  --color-brand: #FF6B6B;
  --color-brand-light: #FF8E8E;
  --color-brand-dark: #E55555;
}
```

2. **Add to Tailwind Config** in `tailwind.config.js`:
```js
colors: {
  brand: {
    50: '#FFF5F5',
    500: '#FF6B6B',
    900: '#E55555',
  }
}
```

3. **Use in Components**:
```jsx
<div className="bg-brand-500 text-white">
  Brand content
</div>
```

### Custom Theme Modes
1. **Add to Theme Slice**:
```js
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  CUSTOM: 'custom', // New mode
};
```

2. **Add CSS Variables**:
```css
[data-theme="custom"] {
  --color-bg-primary: #your-color;
  --color-text-primary: #your-color;
}
```

3. **Update Theme Switcher**:
```jsx
const themeOptions = [
  // ... existing options
  {
    id: THEME_MODES.CUSTOM,
    name: 'Custom',
    icon: CustomIcon,
    description: 'Custom theme',
  },
];
```

## 🔧 Advanced Features

### Gradient Utilities
```jsx
<div className="gradient-primary">Primary gradient</div>
<div className="gradient-secondary">Secondary gradient</div>
<div className="text-gradient-primary">Gradient text</div>
```

### Glass Effects
```jsx
<div className="bg-glass backdrop-blur-lg">
  Glass effect content
</div>
```

### Custom Animations
```jsx
<div className="animate-fade-in">Fade in</div>
<div className="animate-slide-up">Slide up</div>
<div className="animate-scale-in">Scale in</div>
```

### Custom Scrollbars
```jsx
<div className="scrollbar-thin">
  Custom scrollbar content
</div>
```

## 📱 Responsive Theming

### Mobile-First Approach
```jsx
<div className="bg-primary-500 md:bg-secondary-500 lg:bg-neutral-500">
  Responsive background
</div>
```

### Container Queries (Future)
```css
@container (min-width: 400px) {
  .card {
    background: var(--color-primary-100);
  }
}
```

## 🧪 Testing

### Theme Testing
```jsx
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import ThemeToggle from '../components/ui/ThemeToggle';

test('theme toggle changes theme', () => {
  render(
    <Provider store={store}>
      <ThemeToggle />
    </Provider>
  );
  
  const toggle = screen.getByRole('button');
  fireEvent.click(toggle);
  
  expect(document.documentElement).toHaveClass('dark');
});
```

### Color Contrast Testing
```jsx
import { axe, toHaveNoViolations } from 'jest-axe';

test('meets accessibility standards', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 🚀 Performance Optimization

### CSS-in-JS Alternative
For better performance, consider using CSS custom properties instead of CSS-in-JS:

```jsx
// ✅ Good - CSS custom properties
<div style={{ '--custom-color': theme.color }} />

// ❌ Avoid - Inline styles for everything
<div style={{ backgroundColor: theme.color }} />
```

### Theme Persistence
Themes are automatically persisted using Redux Persist:

```js
const persistConfig = {
  whitelist: ['auth', 'ui', 'theme'], // Theme is persisted
};
```

## 📚 Best Practices

### 1. Use Semantic Color Names
```jsx
// ✅ Good
<div className="bg-primary-500 text-primary-900" />

// ❌ Avoid
<div className="bg-purple-500 text-purple-900" />
```

### 2. Consistent Spacing
```jsx
// ✅ Good - Use design system spacing
<div className="p-4 md:p-6 lg:p-8" />

// ❌ Avoid - Arbitrary values
<div className="p-16 md:p-24 lg:p-32" />
```

### 3. Dark Mode First
```jsx
// ✅ Good - Dark mode first approach
<div className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" />

// ❌ Avoid - Light mode first
<div className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white" />
```

### 4. Accessibility First
```jsx
// ✅ Good - High contrast support
<div className="bg-primary-500 text-white focus:ring-2 focus:ring-primary-300" />

// ❌ Avoid - Low contrast
<div className="bg-primary-200 text-primary-800" />
```

## 🔄 Migration Guide

### From CSS Variables Only
1. Install Redux Toolkit
2. Add theme slice to store
3. Wrap app with ThemeProvider
4. Replace CSS variable usage with Tailwind classes

### From CSS-in-JS
1. Replace styled-components with Tailwind classes
2. Use CSS custom properties for dynamic values
3. Leverage Redux for theme state management

## 📞 Support

For questions and issues:
1. Check the Tailwind CSS documentation
2. Review the Redux Toolkit documentation
3. Check component examples in the codebase
4. Open an issue in the repository

## 🎉 Conclusion

This theming system provides:
- **Complete Design System**: Full color palette with scales
- **Dark Mode Support**: Automatic dark/light mode switching
- **Accessibility**: WCAG compliant with high contrast support
- **Performance**: CSS custom properties for optimal performance
- **Developer Experience**: Easy-to-use hooks and components
- **Flexibility**: Easy customization and extension

Happy theming! 🎨 