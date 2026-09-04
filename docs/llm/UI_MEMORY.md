# CENTAIVA PLATFORM — UI MEMORY

## Official Brand Identity & Assets
- **Logo Assets**:
  - `public/assets/images/centaiva-icon.png`: Official 4-point Centaiva Star Icon (metallic silver + glowing electric cyan).
  - `public/assets/images/centaiva-wordmark.png`: Official metallic chrome `CENTAIVA` wordmark with electric cyan `A` and `I`.
- **Palette**:
  - Background Base: `#050811` (Deep Obsidian / Pure Luxury Black)
  - Surface Background: `#080d1a` / `#090f1e`
  - Metallic Accents: `#ffffff` -> `#e2e8f0` -> `#94a3b8` (Chrome/Silver highlights)
  - Centaiva Cyan: `#00d2ff` / `#00f0ff` (Primary Glow & Focus)
  - Electric Blue: `#0066ff` / `#2563eb` (Secondary Accent)
  - Dark Glass Panels: `#0c1324` with `rgba(30, 41, 59, 0.7)` borders and `backdrop-blur-2xl`.
- **Typography**: Inter + JetBrains Mono for codes/tokens, high legibility.

## Reusable UI Primitives (`src/shared/UI`)
- `ButtonComponent`: Primary, secondary, outline, danger states with loading spinner.
- `FormInputComponent`: Floating labels, validation state, error messaging, password reveal.
- `GenericTableComponent`: Search, pagination, sticky header, responsive actions, loading skeletons, empty states.
- `DialogComponent`: Accessible modals for destructive actions (e.g. MFA reset, password reset).
- `IconComponent`: SVG icon registry + FontAwesome icon support.
- `PageBreadcrumbComponent` & `TitleComponent`: Standardized page headers and context paths.
- `LoaderComponent` / `ErrorMessageComponent` / `NoInternetScreenComponent`.

## State & Feedback Standards
- Initial Loading: Centaiva pulse loader / skeleton shimmer.
- Empty State: Informative illustration with clear call-to-action.
- API Error / 401 / 403: User-friendly error message banners with retry option.
- Toastr: Global alerts for action success/failure via `ToastrService`.
