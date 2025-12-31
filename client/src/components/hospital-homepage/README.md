# Hospital Homepage Module

A clean, modern, and trustworthy hospital homepage component built with React and TypeScript.

## Structure

```
hospital-homepage/
├── components/          # Individual React components
├── data/               # Default content and data
├── styles/             # CSS files and styling
├── types/              # TypeScript interfaces
├── utils/              # Utility functions and helpers
├── HospitalHomepage.css # Main stylesheet
├── index.ts            # Module exports
└── README.md           # This file
```

## Features

- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
- **Medical Color Palette**: Professional blue, green, and white color scheme
- **Typography**: Google Fonts (Inter, Roboto, Poppins) for readability
- **Accessibility**: WCAG 2.1 AA compliant design
- **TypeScript**: Full type safety with comprehensive interfaces
- **Modular Architecture**: Reusable components with clear separation of concerns

## Components

- `Header`: Navigation bar with logo and action buttons
- `HeroSection`: Main banner with headline and call-to-action
- `ServicesSection`: Grid of medical services
- `WhyChooseUsSection`: Key differentiators and features
- `ContactSection`: Contact information and map
- `Footer`: Legal links and copyright

## Usage

```tsx
import { HospitalHomepage } from './components/hospital-homepage';

function App() {
  return <HospitalHomepage />;
}
```

## Styling

The module uses CSS Modules with custom properties for consistent theming. All colors are defined in `styles/colors.css` and can be customized by modifying the CSS custom properties.

## Testing

Property-based tests are implemented using fast-check to validate correctness properties across all components.