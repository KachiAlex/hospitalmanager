// Medical Color Palette Manager
export interface MedicalColorPalette {
  blue: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  green: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  gray: {
    white: string;
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  semantic: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    shadow: string;
  };
}

export const medicalColorPalette: MedicalColorPalette = {
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  gray: {
    white: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },
  semantic: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    secondary: '#16a34a',
    secondaryHover: '#15803d',
    background: '#ffffff',
    surface: '#f9fafb',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    shadow: 'rgba(0, 0, 0, 0.1)'
  }
};

// Color validation functions
export const isValidMedicalColor = (color: string): boolean => {
  const allColors = [
    ...Object.values(medicalColorPalette.blue),
    ...Object.values(medicalColorPalette.green),
    ...Object.values(medicalColorPalette.gray),
    ...Object.values(medicalColorPalette.semantic)
  ];
  
  return allColors.includes(color.toLowerCase());
};

export const getMedicalColorByName = (colorName: string): string | null => {
  // Parse color names like 'blue-600', 'green-500', 'gray-white', etc.
  const [category, shade] = colorName.split('-');
  
  if (category === 'blue' && shade in medicalColorPalette.blue) {
    return medicalColorPalette.blue[shade as keyof typeof medicalColorPalette.blue];
  }
  
  if (category === 'green' && shade in medicalColorPalette.green) {
    return medicalColorPalette.green[shade as keyof typeof medicalColorPalette.green];
  }
  
  if (category === 'gray' && shade in medicalColorPalette.gray) {
    return medicalColorPalette.gray[shade as keyof typeof medicalColorPalette.gray];
  }
  
  if (colorName in medicalColorPalette.semantic) {
    return medicalColorPalette.semantic[colorName as keyof typeof medicalColorPalette.semantic];
  }
  
  return null;
};

// CSS Custom Properties Manager
export class ColorManager {
  private root: HTMLElement | null;

  constructor() {
    this.root = document.documentElement;
  }

  // Apply medical color palette to CSS custom properties
  applyMedicalPalette(): void {
    if (!this.root) return;

    // Apply blue colors
    Object.entries(medicalColorPalette.blue).forEach(([shade, color]) => {
      this.root!.style.setProperty(`--medical-blue-${shade}`, color);
    });

    // Apply green colors
    Object.entries(medicalColorPalette.green).forEach(([shade, color]) => {
      this.root!.style.setProperty(`--medical-green-${shade}`, color);
    });

    // Apply gray colors
    Object.entries(medicalColorPalette.gray).forEach(([shade, color]) => {
      this.root!.style.setProperty(`--medical-gray-${shade}`, color);
    });

    // Apply semantic colors
    Object.entries(medicalColorPalette.semantic).forEach(([name, color]) => {
      this.root!.style.setProperty(`--${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`, color);
    });
  }

  // Get current color value
  getColor(propertyName: string): string {
    if (!this.root) return '';
    return getComputedStyle(this.root).getPropertyValue(`--${propertyName}`).trim();
  }

  // Set custom color
  setColor(propertyName: string, value: string): void {
    if (!this.root) return;
    this.root.style.setProperty(`--${propertyName}`, value);
  }

  // Validate if current colors match medical palette
  validateCurrentPalette(): boolean {
    if (!this.root) return false;

    const currentPrimary = this.getColor('primary-color');
    const currentSecondary = this.getColor('secondary-color');
    
    return (
      isValidMedicalColor(currentPrimary) &&
      isValidMedicalColor(currentSecondary)
    );
  }

  // Reset to default medical palette
  reset(): void {
    this.applyMedicalPalette();
  }
}

// Create default color manager instance
export const defaultColorManager = new ColorManager();