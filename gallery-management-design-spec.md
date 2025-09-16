# Gallery Management Flow - Design Specification

## 1. Design System Specification

### 1.1 Color Palette (From globals.css)

The design strictly adheres to the existing color tokens with light/dark mode support:

**Primary Colors:**

- `primary`: emerald-600 (light) / emerald-400 (dark)
- `primary-foreground`: zinc-50 (light) / stone-950 (dark)

**Neutral Colors:**

- `background`: stone-50 (light) / stone-950 (dark)
- `foreground`: stone-900 (light) / stone-50 (dark)
- `card`: zinc-50 (light) / stone-900 (dark)
- `card-foreground`: stone-800 (light) / stone-100 (dark)
- `muted`: stone-100 (light) / stone-800 (dark)
- `muted-foreground`: stone-600 (light) / stone-400 (dark)
- `border`: stone-200 (light) / stone-800 (dark)

**Semantic Colors:**

- `destructive`: red-600 (light) / red-500 (dark)
- `destructive-foreground`: zinc-50 (light) / stone-50 (dark)

### 1.2 Typography

- **Primary Font**: `font-kode-mono` - Used for headings, labels, and primary text
- **Secondary Font**: `font-work-sans` - Used for button text and body content
- **Tertiary Font**: `font-manuale` - Available for special use cases

**Text Sizes:**

- Small: `text-xs` (0.625rem), `text-sm` (0.75rem)
- Base: `text-base` (1rem), `text-l` (1.125rem)
- Large: `text-xl` (1.25rem), `text-2xl` (1.5rem), `text-3xl` (1.875rem)
- Display: `text-4xl` through `text-9xl`

### 1.3 Spacing & Layout

- Container: `max-w-4xl mx-auto` for consistent content width
- Padding: `px-4 py-6 sm:px-6 sm:py-8 lg:px-8` for responsive spacing
- Gaps: `gap-4`, `gap-6`, `gap-8` for consistent element spacing

## 2. User Experience Flow

### 2.1 Main Gallery Management Page

**Route:** `/admin/gallery`
**Purpose:** Landing page for gallery management

**Layout:**

```
[Header with "Gallery Management"]
[Create New Collection Button - Primary Action]
[Collections Grid/List]
  - Collection Card 1
  - Collection Card 2
  - Collection Card 3
  - ...
[Empty State if no collections]
```

**Collection Card Wireframe:**

```
┌─────────────────────────────────┐
│ [Cover Image or Placeholder]    │
├─────────────────────────────────┤
│ Collection Name                 │
│ Description (truncated)         │
│ X photos • Created: Date        │
│ [Edit] [Delete]                 │
└─────────────────────────────────┘
```

### 2.2 Create Collection Flow

**Route:** `/admin/gallery/create`
**Purpose:** Form to create new collection

**Form Fields:**

1. Collection Name (required, max 255 chars)
2. Description (optional, textarea)
3. Cover Photo (optional, photo selector)

### 2.3 Edit Collection Flow

**Route:** `/admin/gallery/[id]/edit`
**Purpose:** Edit collection details and manage photos

**Tabs/Sections:**

1. **Details Tab:** Edit name, description, cover photo
2. **Photos Tab:** Add/remove photos, reorder photos
3. **Settings Tab:** Delete collection, advanced options

## 3. Technical Architecture

### 3.1 Component Hierarchy

```
GalleryManagementPage
├── CollectionsList
│   ├── CollectionCard
│   ├── CreateCollectionButton
│   └── EmptyState
├── CreateCollectionForm
│   ├── CollectionDetailsForm
│   └── PhotoSelector
└── EditCollectionPage
    ├── CollectionDetailsForm
    ├── PhotoManagement
    │   ├── PhotoGrid
    │   ├── PhotoUploadZone
    │   └── PhotoSelectionModal
    └── CollectionSettings
```

### 3.2 Data Flow

```
UI Components → API Routes → Supabase Database

GET /api/gallery/collection → Collections List
POST /api/gallery/collection → Create Collection
PUT /api/gallery/collection/[id] → Update Collection
DELETE /api/gallery/collection/[id] → Delete Collection
GET /api/gallery/photo → Available Photos
```

### 3.3 State Management

- React state for form handling
- SWR/React Query for API data fetching and caching
- Optimistic updates for better UX

## 4. Implementation Phases

### Phase 1: Foundation

1. Create gallery management route structure
2. Set up basic layout with FormLayout component
3. Implement collections listing with API integration
4. Add empty state handling

### Phase 2: Collection CRUD

1. Create collection creation form
2. Implement collection editing interface
3. Add collection deletion with confirmation
4. Handle form validation and error states

### Phase 3: Photo Management

1. Build photo selection interface
2. Implement photo upload integration
3. Add photo removal from collections
4. Create cover photo selection

### Phase 4: Polish & UX

1. Add loading states and animations
2. Implement responsive design refinements
3. Add accessibility improvements
4. Performance optimizations

## 5. Accessibility & Responsive Design

### 5.1 Mobile-First Approach

- Stack elements vertically on mobile
- Use touch-friendly button sizes (min 44px)
- Responsive grid: 1 column (mobile) → 2-3 columns (tablet/desktop)

### 5.2 Accessibility Features

- Semantic HTML structure
- ARIA labels for complex interactions
- Keyboard navigation support
- Screen reader friendly error messages
- Color contrast compliance (using design tokens ensures this)

### 5.3 Responsive Breakpoints

- `sm:` 640px - Tablet portrait
- `md:` 768px - Tablet landscape
- `lg:` 1024px - Desktop
- `xl:` 1280px - Large desktop

## 6. File Structure

```
src/app/admin/gallery/
├── page.tsx                     # Main gallery management page
├── create/
│   └── page.tsx                 # Create collection page
├── [id]/
│   └── edit/
│       └── page.tsx             # Edit collection page
└── components/
    ├── CollectionCard.tsx
    ├── CollectionsList.tsx
    ├── CreateCollectionButton.tsx
    ├── CollectionDetailsForm.tsx
    ├── PhotoManagement.tsx
    ├── PhotoGrid.tsx
    ├── PhotoSelector.tsx
    ├── PhotoUploadZone.tsx
    ├── CollectionSettings.tsx
    └── EmptyState.tsx
```

## 7. Component Specifications

### 7.1 CollectionCard Component

```typescript
interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    description?: string;
    cover_photo?: {
      id: string;
      filename: string;
      blob_url: string;
    };
    photo_count: number;
    created_at: string;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Design:**

- Card component with hover effects
- Cover photo (16:9 aspect ratio) or placeholder
- Title with font-kode-mono
- Description truncated to 2 lines
- Metadata row with photo count and date
- Action buttons (Edit/Delete) with proper spacing

### 7.2 CollectionDetailsForm Component

```typescript
interface CollectionDetailsFormProps {
  initialData?: {
    name: string;
    description?: string;
    cover_photo_id?: string;
  };
  onSubmit: (data: CollectionFormData) => Promise<void>;
  isLoading?: boolean;
}
```

**Features:**

- Uses shared FormLayout and FormField components
- Real-time validation for name field
- Character count for description
- Cover photo selector with preview

### 7.3 PhotoManagement Component

```typescript
interface PhotoManagementProps {
  collectionId: string;
  photos: Photo[];
  availablePhotos: Photo[];
  onAddPhotos: (photoIds: string[]) => Promise<void>;
  onRemovePhoto: (photoId: string) => Promise<void>;
  onSetCoverPhoto: (photoId: string) => Promise<void>;
}
```

**Features:**

- Drag-and-drop photo reordering
- Multi-select for bulk operations
- Photo upload integration
- Cover photo designation

## 8. API Integration Strategy

### 8.1 Collections API

- **GET /api/gallery/collection?include_photo_counts=true** - Fetch all collections with photo counts
- **POST /api/gallery/collection** - Create new collection
- **PUT /api/gallery/collection/[id]** - Update collection details
- **DELETE /api/gallery/collection/[id]** - Delete collection

### 8.2 Photos API

- **GET /api/gallery/photo** - Fetch available photos for selection
- **POST /api/gallery/photo-collection-link** - Add photo to collection
- **DELETE /api/gallery/photo-collection-link** - Remove photo from collection

### 8.3 Error Handling

- Network errors: Retry mechanism with exponential backoff
- Validation errors: Display field-specific error messages
- Server errors: Show generic error message with retry option
- Optimistic updates: Rollback on failure

## 9. Error Handling & Loading States

### 9.1 Loading States

- **Initial Load:** Skeleton cards for collections list
- **Form Submission:** Disable form with loading button text
- **Photo Operations:** Individual photo loading indicators
- **Navigation:** Loading overlay during route transitions

### 9.2 Error States

- **Network Errors:** Toast notifications with retry actions
- **Validation Errors:** Inline field errors using FormErrorMessage
- **Not Found:** 404 page for invalid collection IDs
- **Permission Errors:** Redirect to admin login

### 9.3 Success Feedback

- **Collection Created:** Success toast + redirect to edit page
- **Collection Updated:** Success toast + optimistic update
- **Photo Added:** Visual feedback with smooth animation
- **Collection Deleted:** Success toast + remove from list

## 10. Testing Strategy

### 10.1 Unit Testing

- Component rendering with various props
- Form validation logic
- API response handling
- Error state management

### 10.2 Integration Testing

- Complete collection CRUD flows
- Photo management operations
- Form submission with API integration
- Error handling scenarios

### 10.3 E2E Testing

- User journey from collection creation to photo management
- Responsive design testing across devices
- Accessibility testing with screen readers
- Performance testing with large photo collections

### 10.4 API Testing

- All CRUD operations with valid/invalid data
- Authentication and authorization
- Rate limiting and error responses
- Database consistency checks

## 11. Performance Considerations

### 11.1 Image Optimization

- Use Next.js Image component for automatic optimization
- Lazy loading for photo grids
- Progressive loading for large collections
- WebP format support

### 11.2 Data Fetching

- SWR for automatic caching and revalidation
- Pagination for large photo collections
- Optimistic updates for immediate feedback
- Background refetching for fresh data

### 11.3 Bundle Size

- Code splitting at route level
- Dynamic imports for heavy components
- Tree shaking for unused exports
- Minimize third-party dependencies

## 12. Security Considerations

### 12.1 Authentication

- Admin-only access with requireAdminAuth()
- Session validation on all API routes
- Automatic logout on session expiry

### 12.2 Data Validation

- Server-side validation for all inputs
- SQL injection prevention (Supabase handles this)
- XSS prevention through React's built-in escaping

### 12.3 File Uploads

- File type validation for images only
- File size limits
- Secure upload to Vercel Blob Storage
- Content scanning for malicious files

This specification provides a comprehensive foundation for implementing the gallery management flow while maintaining consistency with the existing codebase architecture and design system.
