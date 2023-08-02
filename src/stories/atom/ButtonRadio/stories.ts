import type { Meta, StoryObj } from '@storybook/react';
import { ButtonRadio } from '.';
// import { ButtonRadio, ButtonRadioOption } from ".";

const meta = {
  title: 'Atom/ButtonRadio',
  component: ButtonRadio,
  tags: ['autodocs'],
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof ButtonRadio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
  },
};

export const WithSelectedOption: Story = {
  args: {
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
    defaultSelected: 'option2',
  },
};
