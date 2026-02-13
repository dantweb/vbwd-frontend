export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: Record<string, string>;
  preview: {
    sidebar: string;
    primary: string;
    background: string;
    card: string;
    text: string;
  };
}

export const themePresets: ThemePreset[] = [
  {
    id: 'default',
    name: 'theme.presets.default.name',
    description: 'theme.presets.default.description',
    colors: {
      '--vbwd-sidebar-bg': '#2c3e50',
      '--vbwd-sidebar-text': 'rgba(255, 255, 255, 0.8)',
      '--vbwd-sidebar-active-bg': 'rgba(255, 255, 255, 0.1)',
      '--vbwd-page-bg': '#f5f5f5',
      '--vbwd-card-bg': '#ffffff',
      '--vbwd-color-primary': '#3498db',
      '--vbwd-color-primary-hover': '#2980b9',
      '--vbwd-text-heading': '#2c3e50',
      '--vbwd-text-body': '#333333',
      '--vbwd-text-muted': '#666666',
      '--vbwd-color-success': '#27ae60',
      '--vbwd-color-danger': '#e74c3c',
      '--vbwd-color-warning': '#f39c12',
      '--vbwd-border-color': '#dddddd',
      '--vbwd-border-light': '#eeeeee',
      '--vbwd-card-shadow': '0 2px 5px rgba(0, 0, 0, 0.05)',
    },
    preview: {
      sidebar: '#2c3e50',
      primary: '#3498db',
      background: '#f5f5f5',
      card: '#ffffff',
      text: '#333333',
    }
  },
  {
    id: 'dark',
    name: 'theme.presets.dark.name',
    description: 'theme.presets.dark.description',
    colors: {
      '--vbwd-sidebar-bg': '#1a1a2e',
      '--vbwd-sidebar-text': 'rgba(255, 255, 255, 0.7)',
      '--vbwd-sidebar-active-bg': 'rgba(255, 255, 255, 0.08)',
      '--vbwd-page-bg': '#16213e',
      '--vbwd-card-bg': '#1a1a2e',
      '--vbwd-color-primary': '#60a5fa',
      '--vbwd-color-primary-hover': '#3b82f6',
      '--vbwd-text-heading': '#f3f4f6',
      '--vbwd-text-body': '#d1d5db',
      '--vbwd-text-muted': '#9ca3af',
      '--vbwd-color-success': '#34d399',
      '--vbwd-color-danger': '#f87171',
      '--vbwd-color-warning': '#fbbf24',
      '--vbwd-border-color': '#374151',
      '--vbwd-border-light': '#2d3748',
      '--vbwd-card-shadow': '0 2px 5px rgba(0, 0, 0, 0.3)',
    },
    preview: {
      sidebar: '#1a1a2e',
      primary: '#60a5fa',
      background: '#16213e',
      card: '#1a1a2e',
      text: '#d1d5db',
    }
  },
  {
    id: 'forest',
    name: 'theme.presets.forest.name',
    description: 'theme.presets.forest.description',
    colors: {
      '--vbwd-sidebar-bg': '#1b4332',
      '--vbwd-sidebar-text': 'rgba(255, 255, 255, 0.8)',
      '--vbwd-sidebar-active-bg': 'rgba(255, 255, 255, 0.1)',
      '--vbwd-page-bg': '#f0fdf4',
      '--vbwd-card-bg': '#ffffff',
      '--vbwd-color-primary': '#059669',
      '--vbwd-color-primary-hover': '#047857',
      '--vbwd-text-heading': '#1b4332',
      '--vbwd-text-body': '#374151',
      '--vbwd-text-muted': '#6b7280',
      '--vbwd-color-success': '#10b981',
      '--vbwd-color-danger': '#ef4444',
      '--vbwd-color-warning': '#f59e0b',
      '--vbwd-border-color': '#d1d5db',
      '--vbwd-border-light': '#e5e7eb',
      '--vbwd-card-shadow': '0 2px 5px rgba(0, 0, 0, 0.05)',
    },
    preview: {
      sidebar: '#1b4332',
      primary: '#059669',
      background: '#f0fdf4',
      card: '#ffffff',
      text: '#374151',
    }
  },
  {
    id: 'ocean',
    name: 'theme.presets.ocean.name',
    description: 'theme.presets.ocean.description',
    colors: {
      '--vbwd-sidebar-bg': '#0c4a6e',
      '--vbwd-sidebar-text': 'rgba(255, 255, 255, 0.8)',
      '--vbwd-sidebar-active-bg': 'rgba(255, 255, 255, 0.1)',
      '--vbwd-page-bg': '#f0f9ff',
      '--vbwd-card-bg': '#ffffff',
      '--vbwd-color-primary': '#0284c7',
      '--vbwd-color-primary-hover': '#0369a1',
      '--vbwd-text-heading': '#0c4a6e',
      '--vbwd-text-body': '#334155',
      '--vbwd-text-muted': '#64748b',
      '--vbwd-color-success': '#22c55e',
      '--vbwd-color-danger': '#ef4444',
      '--vbwd-color-warning': '#eab308',
      '--vbwd-border-color': '#cbd5e1',
      '--vbwd-border-light': '#e2e8f0',
      '--vbwd-card-shadow': '0 2px 5px rgba(0, 0, 0, 0.05)',
    },
    preview: {
      sidebar: '#0c4a6e',
      primary: '#0284c7',
      background: '#f0f9ff',
      card: '#ffffff',
      text: '#334155',
    }
  },
  {
    id: 'sunset',
    name: 'theme.presets.sunset.name',
    description: 'theme.presets.sunset.description',
    colors: {
      '--vbwd-sidebar-bg': '#7c2d12',
      '--vbwd-sidebar-text': 'rgba(255, 255, 255, 0.8)',
      '--vbwd-sidebar-active-bg': 'rgba(255, 255, 255, 0.1)',
      '--vbwd-page-bg': '#fff7ed',
      '--vbwd-card-bg': '#ffffff',
      '--vbwd-color-primary': '#ea580c',
      '--vbwd-color-primary-hover': '#c2410c',
      '--vbwd-text-heading': '#7c2d12',
      '--vbwd-text-body': '#44403c',
      '--vbwd-text-muted': '#78716c',
      '--vbwd-color-success': '#16a34a',
      '--vbwd-color-danger': '#dc2626',
      '--vbwd-color-warning': '#d97706',
      '--vbwd-border-color': '#d6d3d1',
      '--vbwd-border-light': '#e7e5e4',
      '--vbwd-card-shadow': '0 2px 5px rgba(0, 0, 0, 0.05)',
    },
    preview: {
      sidebar: '#7c2d12',
      primary: '#ea580c',
      background: '#fff7ed',
      card: '#ffffff',
      text: '#44403c',
    }
  }
];
