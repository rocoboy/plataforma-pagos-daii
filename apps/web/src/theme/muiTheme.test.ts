import { muiTheme } from './muiTheme';

describe('MUI Theme', () => {
  it('creates a valid theme object', () => {
    expect(muiTheme).toBeDefined();
    expect(muiTheme.palette).toBeDefined();
    expect(muiTheme.typography).toBeDefined();
    expect(muiTheme.components).toBeDefined();
  });

  it('has correct primary color', () => {
    expect(muiTheme.palette.primary.main).toBe('#507BD8');
  });

  it('has correct typography settings', () => {
    expect(muiTheme.typography.fontFamily).toContain('Roboto');
  });

  it('has custom component overrides', () => {
    expect(muiTheme.components.MuiButton).toBeDefined();
    expect(muiTheme.components.MuiCard).toBeDefined();
  });
});
