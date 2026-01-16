import React, { createContext, useContext, ReactNode } from 'react';
import { Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Icon package types
export type IconPackage = 'simple' | 'colorful' | 'none';

// Icon style mappings for different packages
// Simple = outline variants, Colorful = solid with colors, None = hidden
const iconMappings: Record<string, { simple: string; colorful: string }> = {
  // Navigation
  'home': { simple: 'home', colorful: 'home' },
  'dashboard': { simple: 'th-large', colorful: 'th-large' },
  'calendar': { simple: 'calendar-o', colorful: 'calendar' },
  'calendar-o': { simple: 'calendar-o', colorful: 'calendar' },
  'calendar-check-o': { simple: 'calendar-check-o', colorful: 'calendar-check-o' },
  'list': { simple: 'list', colorful: 'list' },
  'folder': { simple: 'folder-o', colorful: 'folder' },
  'folder-o': { simple: 'folder-o', colorful: 'folder' },
  'tags': { simple: 'tags', colorful: 'tags' },
  'users': { simple: 'users', colorful: 'users' },
  'user': { simple: 'user-o', colorful: 'user' },
  'user-o': { simple: 'user-o', colorful: 'user' },
  'cog': { simple: 'cog', colorful: 'cog' },
  'cogs': { simple: 'cogs', colorful: 'cogs' },
  
  // Actions
  'plus': { simple: 'plus', colorful: 'plus-circle' },
  'plus-circle': { simple: 'plus', colorful: 'plus-circle' },
  'minus': { simple: 'minus', colorful: 'minus-circle' },
  'check': { simple: 'check', colorful: 'check-circle' },
  'check-circle': { simple: 'check', colorful: 'check-circle' },
  'check-circle-o': { simple: 'check-circle-o', colorful: 'check-circle' },
  'times': { simple: 'times', colorful: 'times-circle' },
  'times-circle': { simple: 'times', colorful: 'times-circle' },
  'edit': { simple: 'pencil', colorful: 'edit' },
  'pencil': { simple: 'pencil', colorful: 'edit' },
  'trash': { simple: 'trash-o', colorful: 'trash' },
  'trash-o': { simple: 'trash-o', colorful: 'trash' },
  'save': { simple: 'floppy-o', colorful: 'save' },
  
  // Status
  'star': { simple: 'star-o', colorful: 'star' },
  'star-o': { simple: 'star-o', colorful: 'star' },
  'heart': { simple: 'heart-o', colorful: 'heart' },
  'heart-o': { simple: 'heart-o', colorful: 'heart' },
  'flag': { simple: 'flag-o', colorful: 'flag' },
  'flag-o': { simple: 'flag-o', colorful: 'flag' },
  'bookmark': { simple: 'bookmark-o', colorful: 'bookmark' },
  'bookmark-o': { simple: 'bookmark-o', colorful: 'bookmark' },
  'circle': { simple: 'circle-o', colorful: 'circle' },
  'circle-o': { simple: 'circle-o', colorful: 'circle' },
  'dot-circle-o': { simple: 'dot-circle-o', colorful: 'dot-circle-o' },
  
  // Communication
  'envelope': { simple: 'envelope-o', colorful: 'envelope' },
  'envelope-o': { simple: 'envelope-o', colorful: 'envelope' },
  'comment': { simple: 'comment-o', colorful: 'comment' },
  'comment-o': { simple: 'comment-o', colorful: 'comment' },
  'comments': { simple: 'comments-o', colorful: 'comments' },
  'comments-o': { simple: 'comments-o', colorful: 'comments' },
  'bell': { simple: 'bell-o', colorful: 'bell' },
  'bell-o': { simple: 'bell-o', colorful: 'bell' },
  
  // Files
  'file': { simple: 'file-o', colorful: 'file' },
  'file-o': { simple: 'file-o', colorful: 'file' },
  'file-text': { simple: 'file-text-o', colorful: 'file-text' },
  'file-text-o': { simple: 'file-text-o', colorful: 'file-text' },
  'copy': { simple: 'files-o', colorful: 'copy' },
  'files-o': { simple: 'files-o', colorful: 'copy' },
  'paperclip': { simple: 'paperclip', colorful: 'paperclip' },
  'link': { simple: 'link', colorful: 'link' },
  
  // Arrows
  'arrow-left': { simple: 'arrow-left', colorful: 'arrow-circle-left' },
  'arrow-right': { simple: 'arrow-right', colorful: 'arrow-circle-right' },
  'arrow-up': { simple: 'arrow-up', colorful: 'arrow-circle-up' },
  'arrow-down': { simple: 'arrow-down', colorful: 'arrow-circle-down' },
  'chevron-left': { simple: 'chevron-left', colorful: 'chevron-left' },
  'chevron-right': { simple: 'chevron-right', colorful: 'chevron-right' },
  'chevron-up': { simple: 'chevron-up', colorful: 'chevron-up' },
  'chevron-down': { simple: 'chevron-down', colorful: 'chevron-down' },
  'angle-left': { simple: 'angle-left', colorful: 'angle-left' },
  'angle-right': { simple: 'angle-right', colorful: 'angle-right' },
  'angle-up': { simple: 'angle-up', colorful: 'angle-up' },
  'angle-down': { simple: 'angle-down', colorful: 'angle-down' },
  
  // Misc
  'search': { simple: 'search', colorful: 'search' },
  'refresh': { simple: 'refresh', colorful: 'refresh' },
  'sync': { simple: 'refresh', colorful: 'refresh' },
  'clock-o': { simple: 'clock-o', colorful: 'clock-o' },
  'history': { simple: 'history', colorful: 'history' },
  'info': { simple: 'info', colorful: 'info-circle' },
  'info-circle': { simple: 'info', colorful: 'info-circle' },
  'question': { simple: 'question', colorful: 'question-circle' },
  'question-circle': { simple: 'question', colorful: 'question-circle' },
  'exclamation': { simple: 'exclamation', colorful: 'exclamation-circle' },
  'exclamation-circle': { simple: 'exclamation', colorful: 'exclamation-circle' },
  'exclamation-triangle': { simple: 'exclamation-triangle', colorful: 'exclamation-triangle' },
  'warning': { simple: 'exclamation-triangle', colorful: 'exclamation-triangle' },
  'ban': { simple: 'ban', colorful: 'ban' },
  'lock': { simple: 'lock', colorful: 'lock' },
  'unlock': { simple: 'unlock', colorful: 'unlock' },
  'key': { simple: 'key', colorful: 'key' },
  'sign-out': { simple: 'sign-out', colorful: 'sign-out' },
  'sign-in': { simple: 'sign-in', colorful: 'sign-in' },
  'external-link': { simple: 'external-link', colorful: 'external-link' },
  'download': { simple: 'download', colorful: 'download' },
  'upload': { simple: 'upload', colorful: 'upload' },
  'cloud': { simple: 'cloud', colorful: 'cloud' },
  'cloud-upload': { simple: 'cloud-upload', colorful: 'cloud-upload' },
  'cloud-download': { simple: 'cloud-download', colorful: 'cloud-download' },
  
  // Theme
  'sun-o': { simple: 'sun-o', colorful: 'sun-o' },
  'moon-o': { simple: 'moon-o', colorful: 'moon-o' },
  'paint-brush': { simple: 'paint-brush', colorful: 'paint-brush' },
  
  // Project/Task specific
  'building': { simple: 'building-o', colorful: 'building' },
  'building-o': { simple: 'building-o', colorful: 'building' },
  'briefcase': { simple: 'briefcase', colorful: 'briefcase' },
  'tasks': { simple: 'tasks', colorful: 'tasks' },
  'sitemap': { simple: 'sitemap', colorful: 'sitemap' },
  'bar-chart': { simple: 'bar-chart', colorful: 'bar-chart' },
  'pie-chart': { simple: 'pie-chart', colorful: 'pie-chart' },
  'line-chart': { simple: 'line-chart', colorful: 'line-chart' },
  'area-chart': { simple: 'area-chart', colorful: 'area-chart' },
  
  // Additional common icons
  'send': { simple: 'send-o', colorful: 'send' },
  'send-o': { simple: 'send-o', colorful: 'send' },
  'inbox': { simple: 'inbox', colorful: 'inbox' },
  'archive': { simple: 'archive', colorful: 'archive' },
  'filter': { simple: 'filter', colorful: 'filter' },
  'sort': { simple: 'sort', colorful: 'sort' },
  'ellipsis-h': { simple: 'ellipsis-h', colorful: 'ellipsis-h' },
  'ellipsis-v': { simple: 'ellipsis-v', colorful: 'ellipsis-v' },
  'bars': { simple: 'bars', colorful: 'bars' },
  'th': { simple: 'th', colorful: 'th' },
  'th-large': { simple: 'th-large', colorful: 'th-large' },
  'th-list': { simple: 'th-list', colorful: 'th-list' },
  'table': { simple: 'table', colorful: 'table' },
  'columns': { simple: 'columns', colorful: 'columns' },
  'repeat': { simple: 'repeat', colorful: 'repeat' },
  'undo': { simple: 'undo', colorful: 'undo' },
  'expand': { simple: 'expand', colorful: 'expand' },
  'compress': { simple: 'compress', colorful: 'compress' },
  'arrows-alt': { simple: 'arrows-alt', colorful: 'arrows-alt' },
  'exchange': { simple: 'exchange', colorful: 'exchange' },
  'random': { simple: 'random', colorful: 'random' },
  'magic': { simple: 'magic', colorful: 'magic' },
  'lightbulb-o': { simple: 'lightbulb-o', colorful: 'lightbulb-o' },
  'bolt': { simple: 'bolt', colorful: 'bolt' },
  'rocket': { simple: 'rocket', colorful: 'rocket' },
  'code': { simple: 'code', colorful: 'code' },
  'terminal': { simple: 'terminal', colorful: 'terminal' },
  'bug': { simple: 'bug', colorful: 'bug' },
  'wrench': { simple: 'wrench', colorful: 'wrench' },
  'sliders': { simple: 'sliders', colorful: 'sliders' },
  'flask': { simple: 'flask', colorful: 'flask' },
  'font': { simple: 'font', colorful: 'font' },
  'play': { simple: 'play', colorful: 'play-circle' },
  'pause': { simple: 'pause', colorful: 'pause-circle' },
  'stop': { simple: 'stop', colorful: 'stop-circle' },
  'step-forward': { simple: 'step-forward', colorful: 'step-forward' },
  'step-backward': { simple: 'step-backward', colorful: 'step-backward' },
  'forward': { simple: 'forward', colorful: 'forward' },
  'backward': { simple: 'backward', colorful: 'backward' },
  'fast-forward': { simple: 'fast-forward', colorful: 'fast-forward' },
  'fast-backward': { simple: 'fast-backward', colorful: 'fast-backward' },
  'image': { simple: 'image', colorful: 'image' },
  'picture-o': { simple: 'picture-o', colorful: 'image' },
  'camera': { simple: 'camera', colorful: 'camera' },
  'video-camera': { simple: 'video-camera', colorful: 'video-camera' },
  'microphone': { simple: 'microphone', colorful: 'microphone' },
  'volume-up': { simple: 'volume-up', colorful: 'volume-up' },
  'volume-down': { simple: 'volume-down', colorful: 'volume-down' },
  'volume-off': { simple: 'volume-off', colorful: 'volume-off' },
  'map-marker': { simple: 'map-marker', colorful: 'map-marker' },
  'map': { simple: 'map-o', colorful: 'map' },
  'map-o': { simple: 'map-o', colorful: 'map' },
  'globe': { simple: 'globe', colorful: 'globe' },
  'id-card-o': { simple: 'id-card-o', colorful: 'id-card' },
  'id-card': { simple: 'id-card-o', colorful: 'id-card' },
  'share': { simple: 'share', colorful: 'share-alt' },
  'share-alt': { simple: 'share', colorful: 'share-alt' },
  'retweet': { simple: 'retweet', colorful: 'retweet' },
  'thumb-tack': { simple: 'thumb-tack', colorful: 'thumb-tack' },
  'pin': { simple: 'thumb-tack', colorful: 'thumb-tack' },
};

// Color mappings for colorful package
const colorfulColors: Record<string, string> = {
  'star': '#F59E0B',
  'heart': '#EF4444',
  'flag': '#EF4444',
  'check': '#10B981',
  'check-circle': '#10B981',
  'times': '#EF4444',
  'times-circle': '#EF4444',
  'exclamation-circle': '#F59E0B',
  'exclamation-triangle': '#F59E0B',
  'info-circle': '#3B82F6',
  'question-circle': '#8B5CF6',
  'bell': '#F59E0B',
  'envelope': '#3B82F6',
  'folder': '#F59E0B',
  'file': '#6B7280',
  'calendar': '#3B82F6',
  'clock-o': '#6B7280',
  'user': '#3B82F6',
  'users': '#3B82F6',
  'home': '#10B981',
  'cog': '#6B7280',
  'trash': '#EF4444',
  'edit': '#3B82F6',
  'plus-circle': '#10B981',
  'minus-circle': '#EF4444',
  'rocket': '#8B5CF6',
  'bolt': '#F59E0B',
  'bug': '#EF4444',
};

// Context for icon package
interface IconContextType {
  iconPackage: IconPackage;
  setIconPackage: (pkg: IconPackage) => void;
}

const IconContext = createContext<IconContextType>({
  iconPackage: 'simple',
  setIconPackage: () => {},
});

// Load icon package from localStorage
const loadIconPackage = (): IconPackage => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('iconPackage');
      if (saved === 'simple' || saved === 'colorful' || saved === 'none') {
        return saved;
      }
    } catch {
      // Ignore
    }
  }
  return 'simple';
};

// Save icon package to localStorage
const saveIconPackage = (pkg: IconPackage) => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('iconPackage', pkg);
    } catch {
      // Ignore
    }
  }
};

// Provider component
interface IconProviderProps {
  children: ReactNode;
}

export function IconProvider({ children }: IconProviderProps) {
  const [iconPackage, setIconPackageState] = React.useState<IconPackage>(loadIconPackage);

  const setIconPackage = React.useCallback((pkg: IconPackage) => {
    setIconPackageState(pkg);
    saveIconPackage(pkg);
  }, []);

  return (
    <IconContext.Provider value={{ iconPackage, setIconPackage }}>
      {children}
    </IconContext.Provider>
  );
}

// Hook to use icon context
export function useIconPackage() {
  return useContext(IconContext);
}

// Icon component props
interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

// Main Icon component that respects the package setting
export default function Icon({ name, size = 16, color, style }: IconProps) {
  const { iconPackage } = useIconPackage();

  // If package is 'none', render nothing
  if (iconPackage === 'none') {
    return null;
  }

  // Get the mapped icon name based on package
  const mapping = iconMappings[name];
  const iconName = mapping 
    ? (iconPackage === 'colorful' ? mapping.colorful : mapping.simple)
    : name;

  // For colorful package, use predefined colors if no color specified
  let iconColor = color;
  if (iconPackage === 'colorful' && !color) {
    iconColor = colorfulColors[name] || colorfulColors[iconName];
  }

  return (
    <FontAwesome
      name={iconName as any}
      size={size}
      color={iconColor}
      style={style}
    />
  );
}

// Export a direct FontAwesome wrapper for cases where we need the raw icon
export { FontAwesome };
