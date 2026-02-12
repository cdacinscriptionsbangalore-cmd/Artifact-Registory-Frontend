import Nav from './Nav';

export const NavTest = () => {
  return (
    <div>
      <Nav />
      {/* Temporary content to enable scrolling */}
      <div className="mt-8 p-8">
        <h2 className="text-2xl font-bold mb-4">Test Content</h2>
        {Array(20).fill(0).map((_, i) => (
          <p key={i} className="mb-4">
            This is paragraph {i + 1} to test navbar scroll behavior.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
      </div>
    </div>
  );
};