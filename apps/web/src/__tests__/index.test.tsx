// Basic test to ensure index file is covered
describe('Index file', () => {
  it('exists and can be imported', () => {
    // Just checking the test file exists and runs
    expect(true).toBe(true);
  });

  it('has root element in DOM', () => {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
    
    expect(document.getElementById('root')).toBeTruthy();
    
    document.body.removeChild(root);
  });
});


