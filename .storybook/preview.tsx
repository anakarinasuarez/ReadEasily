import type { Preview } from '@storybook/nextjs-vite'

// Load the app's global stylesheet so stories render with the real design
// tokens (Tailwind v4 theme + src/tokens/* custom properties).
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    // Render stories on the brand canvas so token-driven colors read correctly.
    backgrounds: {
      options: {
        canvas: { name: 'Canvas', value: 'var(--bg-canvas)' },
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
  initialGlobals: {
    backgrounds: { value: 'canvas' },
  },
};

export default preview;
