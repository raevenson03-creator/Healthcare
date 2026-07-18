import { fireEvent, screen } from '@testing-library/react-native';

import { Button } from '@/components/ui';
import { renderWithProviders } from '@/test-utils/render';

describe('Button', () => {
  it('renders its label and is announced as a button', () => {
    renderWithProviders(<Button label="Book appointment" onPress={() => undefined} />);
    const btn = screen.getByRole('button', { name: 'Book appointment' });
    expect(btn).toBeOnTheScreen();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    renderWithProviders(<Button label="Sign in" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    renderWithProviders(<Button label="Disabled" onPress={onPress} disabled />);
    fireEvent.press(screen.getByRole('button', { name: 'Disabled' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows a busy state while loading', () => {
    renderWithProviders(<Button label="Loading" onPress={() => undefined} loading />);
    const btn = screen.getByRole('button', { name: 'Loading' });
    expect(btn).toBeBusy();
  });
});
