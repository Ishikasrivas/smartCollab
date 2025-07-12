const svgLines = `
<svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="800" height="600" fill="none"/>
  <g opacity="0.12" stroke="#fff" stroke-width="2">
    <path d="M 0 100 Q 400 200 800 100" />
    <path d="M 0 300 Q 400 400 800 300" />
    <path d="M 0 500 Q 400 600 800 500" />
    <path d="M 100 0 Q 200 300 100 600" />
    <path d="M 700 0 Q 600 300 700 600" />
  </g>
</svg>
`;

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animate-gradient" />
      <div
        className="absolute inset-0"
        style={{
          background: `url('data:image/svg+xml;utf8,${encodeURIComponent(svgLines)}') center/cover no-repeat`
        }}
      />
    </div>
  );
} 