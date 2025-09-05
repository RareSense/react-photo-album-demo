# Canva-Style Photo Sidebar

A pixel-perfect recreation of Canva's left sidebar panel with justified image layout, built with modern React patterns and TypeScript.

## 🚀 Features

- **Justified Photo Layout**: Uses `react-photo-album` with `RowsPhotoAlbum` for automatic wall-to-wall justified layout
- **File Upload**: Drag & drop or click to upload multiple images (jpg, png, gif, webp)
- **Image Processing**: Automatic dimension extraction for proper layout calculation
- **Search Interface**: Professional search bar with icon (UI only)
- **Tab Navigation**: Switch between Images and Folders views
- **Fixed Sidebar**: 320px width with vertical scrolling only
- **Hover Effects**: Smooth image scaling and overlay effects
- **Error Handling**: Comprehensive file upload error management
- **Accessibility**: ARIA labels, keyboard navigation, proper alt text
- **Type Safety**: Full TypeScript coverage with strict typing

## 🛠 Tech Stack

- **React 18** with TypeScript
- **Vite** as build tool
- **Tailwind CSS v4** (latest stable version)
- **shadcn/ui** components
- **react-photo-album** for justified layout
- **Lucide React** for icons
- **Radix UI** primitives

## 📦 Installation

```bash
# Clone and navigate to the project
cd canva-sidebar

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## 🏗 Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── tabs.tsx
│   └── CanvaSidebar.tsx    # Main sidebar component
├── hooks/
│   └── useFileUpload.ts    # Custom hook for file handling
├── lib/
│   └── utils.ts            # Utility functions
├── types/
│   └── index.ts            # TypeScript interfaces
├── App.tsx                 # Main app component
├── index.css               # Tailwind CSS v4 styles
└── main.tsx                # App entry point
```

## 🎨 Key Components

### CanvaSidebar
The main sidebar component featuring:
- **Upload Section**: Gradient button with file input
- **Search Bar**: Professional search interface
- **Tab Navigation**: Images/Folders switching
- **Photo Gallery**: Justified layout with click handling

### useFileUpload Hook
Custom hook providing:
- Multiple file processing
- Image dimension extraction
- Error handling and validation
- Loading states

### Photo Interface
```typescript
interface Photo {
  src: string;
  width: number;
  height: number;
  alt?: string;
}
```

## 🔧 Configuration Details

### Vite Configuration
- **Tailwind CSS v4**: Uses `@tailwindcss/vite` plugin
- **Path Aliases**: `@/*` mapped to `src/*`
- **ES Modules**: Modern module resolution

### TypeScript Configuration
- **Strict Mode**: Full type checking enabled
- **Path Mapping**: Configured in both `tsconfig.json` and `tsconfig.app.json`
- **Verbatim Module Syntax**: For optimal tree-shaking

### Tailwind CSS v4 Setup
- **New Syntax**: Uses `@import "tailwindcss"` instead of directives
- **CSS Variables**: Custom properties for shadcn/ui theming
- **No PostCSS**: Handled automatically by Vite plugin

## 📸 Photo Album Integration

The justified layout uses `react-photo-album`'s `RowsPhotoAlbum`:

```typescript
<RowsPhotoAlbum
  photos={photos}
  targetRowHeight={120}
  spacing={2}
  onClick={({ index }) => handlePhotoClick(index)}
/>
```

**Key Properties:**
- `targetRowHeight={120}`: Compact row height for sidebar
- `spacing={2}`: Small gaps between photos
- `onClick`: Handles photo selection

## 🎯 Design Decisions

### Fixed Width Sidebar
- **320px width**: Matches Canva's sidebar dimensions
- **Vertical scroll only**: `overflow-x: hidden, overflow-y: auto`
- **No horizontal overflow**: All content fits within fixed width

### File Upload Flow
1. User clicks upload button or selects files
2. Files are validated (image types only)
3. Image dimensions extracted using Image API
4. Object URLs created for display
5. Photos added to gallery array
6. Errors collected and displayed

### Performance Optimizations
- **Lazy Loading**: Images load on scroll
- **Object URL Cleanup**: Prevents memory leaks
- **Concurrent Processing**: Multiple files processed in parallel
- **React.memo Patterns**: Optimized re-rendering

## 🚀 Usage Example

```typescript
import { CanvaSidebar } from '@/components/CanvaSidebar';
import { Photo } from '@/types';

function App() {
  const handlePhotoSelect = (photo: Photo) => {
    console.log('Selected photo:', photo);
  };

  return (
    <div className="flex h-screen">
      <CanvaSidebar onPhotoSelect={handlePhotoSelect} />
      <main className="flex-1">
        {/* Your main content */}
      </main>
    </div>
  );
}
```

## 🔍 Code Quality

### TypeScript Standards
- **Strict typing**: No `any` types used
- **Interface definitions**: Clear type contracts
- **Generic constraints**: Type-safe component props

### React Best Practices
- **Custom hooks**: Separation of concerns
- **Error boundaries**: Comprehensive error handling
- **Accessibility**: WCAG compliance
- **Modern patterns**: Functional components with hooks

### Performance
- **Bundle size**: Optimized with tree-shaking
- **Runtime performance**: Efficient re-rendering
- **Memory management**: Proper cleanup of resources

## 🎨 Styling

### Canva-Inspired Design
- **Purple gradient**: Upload button matches Canva theme
- **Professional shadows**: Subtle elevation effects
- **Clean typography**: Readable font hierarchy
- **Hover interactions**: Smooth transitions

### Responsive Behavior
- **Fixed sidebar**: Maintains 320px width
- **Flexible main content**: Adapts to remaining space
- **Mobile considerations**: Touch-friendly interactions

## 🧪 Testing

The project includes comprehensive testing setup:
- **Build verification**: `npm run build` passes
- **Linting**: `npm run lint` passes with zero errors
- **Type checking**: Full TypeScript coverage
- **Visual testing**: Sample images with various aspect ratios

## 📝 Documentation Standards

All code includes:
- **Beginner-friendly comments**: Explain react-photo-album integration
- **Step-by-step explanations**: File processing logic
- **Modern React patterns**: Hook usage and state management
- **Library integration**: How components work together

## 🔮 Future Enhancements

- **Drag & Drop**: Visual drag and drop interface
- **Folder Organization**: Implement folder functionality
- **Search Implementation**: Actual search functionality
- **Image Filters**: Color, size, and tag filtering
- **Batch Operations**: Select multiple images
- **Cloud Storage**: Integration with cloud providers

## 📄 License

This project is built for educational and demonstration purposes, showcasing modern React development practices and Canva-style UI implementation.