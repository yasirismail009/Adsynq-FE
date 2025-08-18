# AdSynq - B2B SaaS Dashboard

A modern, responsive B2B SaaS dashboard built with React, Vite, Tailwind CSS, Framer Motion, and Recharts.

## 🚀 Features

- **Modern UI/UX**: Clean, professional design optimized for business users
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Interactive Components**: Smooth animations and transitions using Framer Motion
- **Data Visualization**: Beautiful charts and graphs powered by Recharts
- **Collapsible Sidebar**: Space-efficient navigation with smooth animations
- **Search Functionality**: Global search with responsive design
- **Notification System**: Real-time notifications with unread counts
- **Mobile-First**: Optimized mobile experience with hamburger menu

## 📦 Installation

1. **Install Dependencies**
   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # Or using npm
   npm install
   
   # Or using yarn
   yarn install
   ```

2. **Install Required Packages**
   ```bash
   # Install Recharts and Framer Motion
   pnpm add recharts framer-motion
   
   # Install Heroicons for icons
   pnpm add @heroicons/react
   ```

3. **Start Development Server**
   ```bash
   pnpm dev
   ```

4. **Build for Production**
   ```bash
   pnpm build
   ```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.jsx          # Main layout wrapper
│   │   ├── Sidebar.jsx         # Collapsible navigation sidebar
│   │   └── Header.jsx          # Top header with search and user menu
│   └── dashboard/
│       ├── Dashboard.jsx       # Main dashboard page
│       ├── StatCard.jsx        # Reusable stat/metric cards
│       └── ChartCard.jsx       # Reusable chart components
├── App.jsx                     # Main app component
└── main.jsx                    # App entry point
```

## 🎨 Component Usage

### Layout Component
The main layout wrapper that provides the overall structure:

```jsx
import Layout from './components/layout/Layout';

function App() {
  return (
    <Layout title="Dashboard">
      <YourContent />
    </Layout>
  );
}
```

### StatCard Component
Display key metrics with trend indicators:

```jsx
import StatCard from './components/dashboard/StatCard';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

<StatCard
  title="Total Revenue"
  value="$124,563"
  change="+12.5%"
  changeType="positive"
  icon={CurrencyDollarIcon}
  color="green"
/>
```

### ChartCard Component
Display various types of charts:

```jsx
import ChartCard from './components/dashboard/ChartCard';

const data = [
  { name: 'Jan', value: 45 },
  { name: 'Feb', value: 52 },
  // ... more data
];

<ChartCard
  title="Revenue Trend"
  subtitle="Monthly revenue performance"
  data={data}
  type="line" // 'line', 'area', 'bar', 'pie'
  height={300}
/>
```

## 🎯 Key Features

### Responsive Sidebar
- Collapsible navigation with smooth animations
- Mobile overlay with backdrop
- Active state indicators
- User profile section

### Header Features
- Global search functionality
- Notification system with unread counts
- User profile menu
- Mobile hamburger menu

### Dashboard Components
- **Stat Cards**: Display key metrics with trend indicators
- **Line Charts**: Show trends over time
- **Area Charts**: Display cumulative data
- **Bar Charts**: Compare categories
- **Pie Charts**: Show distribution data
- **Activity Feed**: Recent system activities

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Gray scale

### Typography
- **Headings**: Inter font family
- **Body**: System font stack
- **Monospace**: For code and data

### Spacing
- Consistent 4px grid system
- Responsive padding and margins
- Proper component spacing

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Performance Optimizations

- **Code Splitting**: Components loaded on demand
- **Lazy Loading**: Images and heavy components
- **Optimized Animations**: Hardware-accelerated transforms
- **Efficient Re-renders**: Proper React patterns

## 🔧 Customization

### Theme Colors
Modify the color scheme in the component files or create a theme configuration:

```jsx
const theme = {
  colors: {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  }
};
```

### Layout Configuration
Customize the sidebar width, header height, and other layout properties:

```jsx
<Layout 
  title="Dashboard"
  sidebarWidth={280}
  headerHeight={64}
>
  <YourContent />
</Layout>
```

## 📊 Data Integration

The dashboard is designed to work with any data source. Simply replace the sample data with your API calls:

```jsx
const [dashboardData, setDashboardData] = useState(null);

useEffect(() => {
  // Fetch your data here
  fetchDashboardData().then(setDashboardData);
}, []);
```

## 🛠️ Development

### Adding New Pages
1. Create a new component in the appropriate directory
2. Add navigation item to the sidebar
3. Update routing if needed

### Adding New Charts
1. Extend the ChartCard component
2. Add new chart types to the renderChart function
3. Import additional Recharts components as needed

### Styling
- Use Tailwind CSS classes for styling
- Follow the existing design patterns
- Maintain consistency with the design system

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.
