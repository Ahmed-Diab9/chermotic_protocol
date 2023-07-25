import type { Meta, StoryObj } from '@storybook/react';

import { Modal } from '.';

const meta = {
  title: 'Template/Modal/Modal',
  component: Modal,
  // argTypes: {
  // },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Title',
    paragraph: 'this is paragraph.',
    subParagraph: 'hello world, this is sub paragraph.',
    buttonLabel: 'default',
    buttonCss: 'gray',
  },
};
