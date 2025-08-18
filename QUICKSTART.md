# Quick Start Guide

Get your B2B SaaS dashboard up and running in minutes!

## 🚀 Quick Setup

1. **Install Dependencies**
   ```bash
   # Run the setup script (recommended)
   node setup.js
   
   # Or manually install
   pnpm add recharts framer-motion @heroicons/react
   ```

2. **Start Development Server**
   ```bash
   pnpm dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:5173`

## 🎯 What You'll See

- **Responsive Sidebar**: Collapsible navigation with smooth animations
- **Modern Header**: Search bar, notifications, and user profile
- **Dashboard**: Key metrics, charts, and recent activity
- **Mobile Support**: Hamburger menu and responsive design

## 📱 Features Overview

### Desktop View
- Full sidebar with navigation
- Search bar in header
- Multi-column dashboard layout

### Mobile View
- Collapsible hamburger menu
- Stacked dashboard cards
- Touch-friendly interactions

## 🔧 Customization

### Change Colors
Edit the color variables in any component:
```jsx
const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  // Add your colors here
};
```

### Add New Pages
1. Create a new component
2. Add to sidebar navigation in `Sidebar.jsx`
3. Update routing if needed

### Modify Charts
The `ChartCard` component supports:
- Line charts
- Area charts  
- Bar charts
- Pie charts

## 🐛 Troubleshooting

### Missing Dependencies
If you see import errors:
```bash
pnpm add recharts framer-motion @heroicons/react
```

### Build Issues
Clear cache and reinstall:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Styling Issues
Make sure Tailwind CSS is properly configured in your project.

## 📞 Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Open an issue in the repository
- Review the component code for examples

## 🎉 Next Steps

1. **Customize the design** to match your brand
2. **Connect real data** from your APIs
3. **Add authentication** and user management
4. **Implement routing** for multiple pages
5. **Add more charts** and analytics features

Happy coding! 🚀 