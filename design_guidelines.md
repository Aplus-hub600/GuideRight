# GuideRight Design Guidelines

## Design Approach: Reference-Based (Military/Intelligence Interface)
Drawing inspiration from modern tactical interfaces like military command centers and intelligence platforms, emphasizing clarity, efficiency, and professional aesthetics suitable for USSOCOM operations.

## Core Design Elements

### Color Palette
**Dark Mode Primary** (suitable for tactical operations):
- Background: 220 15% 8% (deep slate)
- Surface: 220 15% 12% (elevated surfaces)
- Primary: 210 100% 50% (tactical blue)
- Text: 0 0% 95% (near white)
- Accent: 25 95% 53% (amber for alerts/warnings)
- Success: 142 76% 36% (military green)
- Danger: 0 84% 60% (tactical red)

**Light Mode** (for daytime operations):
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Primary: 210 100% 45%
- Text: 220 15% 15%

### Typography
- **Primary Font**: Inter (clean, highly legible)
- **Monospace**: JetBrains Mono (for coordinates, data)
- **Hierarchy**: text-sm for body, text-base for labels, text-lg for headings, text-xl for section titles

### Layout System
**Spacing Units**: Consistent use of Tailwind units 2, 4, 6, and 8
- Tight spacing: p-2, m-2 (within components)
- Standard spacing: p-4, gap-4 (between related elements)
- Section spacing: p-6, gap-6 (between component groups)
- Page spacing: p-8, gap-8 (major layout sections)

### Component Library

#### Navigation
- **Top Bar**: Fixed header with app logo, language selector, and user controls
- **Sidebar**: Collapsible navigation with main sections (Map, Intelligence, Chat, Analytics)
- **Breadcrumbs**: For deep navigation context

#### Intelligence Dashboard
- **Tabbed PMESII Panels**: Six tabs for Political, Military, Economic, Social, Information, Infrastructure
- **Risk Score Cards**: Prominent confidence indicators with colored progress bars
- **Source Citation**: Compact cards showing data source and confidence level

#### Map Interface
- **Full-Screen Map**: Leaflet with OpenStreetMap tiles
- **Overlay Controls**: Floating panels for layers, tools, and information
- **AOI Selector**: Geographic boundary selection tools
- **Route Visualization**: Clear path rendering with waypoints

#### Chat Interface
- **Message Bubbles**: User messages right-aligned (blue), AI responses left-aligned (gray)
- **Multimodal Input**: File drop zone with drag-and-drop styling
- **Voice Controls**: Microphone button with visual feedback during recording
- **Loading States**: Typing indicators and progress animations

#### Data Visualization
- **Confidence Meters**: Circular progress indicators for Dempster-Shafer scores
- **Risk Heatmaps**: Color-coded geographic overlays
- **Timeline Components**: Chronological event display
- **Metric Cards**: Key statistics with trend indicators

#### Forms & Controls
- **Input Fields**: Consistent border styling with focus states
- **Dropdown Menus**: Custom styled selects with search capability
- **Toggle Switches**: For feature enable/disable
- **Button Hierarchy**: Primary (filled), Secondary (outline), Tertiary (ghost)

### Animations
**Minimal Approach**: Only essential feedback animations
- **Loading Spinners**: For AI processing and data fetching
- **Slide Transitions**: For panel opening/closing
- **Fade Effects**: For content updates and notifications
- **Map Animations**: Smooth zoom and pan transitions

### Images
**No Hero Image**: This is a utility-focused tactical interface
**Supporting Imagery**:
- **Map Tiles**: OpenStreetMap integration
- **Intelligence Icons**: Standardized military symbology where appropriate
- **Data Source Logos**: Small provider identification badges
- **Status Indicators**: Traffic light system for risk levels
- **Placeholder Images**: For multimodal file analysis preview

### Responsive Design
- **Desktop First**: Primary use case for command center environments
- **Tablet Support**: Secondary priority for field operations
- **Mobile Considerations**: Essential functions only, simplified interface

### Accessibility
- **High Contrast**: Ensure readability in various lighting conditions
- **Keyboard Navigation**: Full functionality without mouse
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Color Independence**: Information not conveyed by color alone

This design system prioritizes operational efficiency, clear information hierarchy, and professional military aesthetics while maintaining modern web standards and accessibility requirements.