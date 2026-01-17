# Academia do Canto - AI Project Rules

These rules are for the AI assistant to ensure consistency and speed when developing the Academia do Canto app.

## Project Structure
- `constants.ts`: Main data file. Contains modules, vocalizes, templates and global configs.
- `screens/`: UI logic for each screen (e.g., `LibraryScreen.tsx` for the course list).
- `types.ts`: TypeScript interfaces for the entire project.

## Design System (Vanilla CSS + Tailwind)

### Colors
- **Brand Gradient**: `bg-brand-gradient` (Purple/Blue)
- **Primary Blue**: `#0081FF`
- **Secondary Purple**: `#6F4CE7`
- **Accent Pink**: `#FF00BC`
- **Background**: `#101622` (Main), `#1A202C` (Surface)

### Visual Patterns
- **Cards**: Use `rounded-2xl` or `rounded-3xl`.
- **Borders**: Subtle `border-white/5` or `border-white/10`.
- **Icons**: Always use `Material Symbols Rounded`.

## Component Templates (HTML in Constants)

### 1. Inline Player
Use `INLINE_PLAYER_TEMPLATE(url)` from `constants.ts`.
Structure includes:
- Play button with pulse shadow.
- Minimalist logo.
- Animated visualizer bars.

### 2. Slideshow Slides
Separate slides with `<!-- slide -->`.
Each slide should wrap content in a `<div class="space-y-6">`.

### 3. Quiz Options
Buttons should have classes: `quiz-option w-full p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4`.
Use `data-correct="true"` or `false`.

## Coding Workflow
1. **Plan First**: Always provide an `implementation_plan.md` for non-trivial changes.
2. **Search Before Create**: Check `constants.ts` or `components/` for existing templates before writing new HTML/JSX.
3. **Verify**: Test build and check responsiveness on both light/dark contexts (though the app is primarily dark-mode).
