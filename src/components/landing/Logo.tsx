export const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="7" fill="#4f98a3" />
      <path d="M16 7L9 25h4l1.5-4h7L23 25h4L16 7zm0 7l2.5 7h-5L16 14z" fill="white" />
    </svg>
    <span className="text-xl font-extrabold font-heading tracking-tight">
      Fin<span style={{ color: '#4f98a3' }}>Arrow</span>
    </span>
  </div>
);
