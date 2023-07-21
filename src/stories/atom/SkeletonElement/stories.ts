import type { Meta, StoryObj } from '@storybook/react';

import { SkeletonElement } from '.';
import React from 'react';
import { Avatar } from '../Avatar';

const meta = {
  title: 'Atom/SkeletonElement',
  component: SkeletonElement,
  tags: ['autodocs'],
  // argTypes: {
  // },
} satisfies Meta<typeof SkeletonElement>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    isLoading: false,
    children: 'some text value',
    width: 120,
  },
}
export const Element: Story = {
  args: {
    isLoading: false,
    children: Avatar({label:'test'}),
    width: 120,
  },
};
