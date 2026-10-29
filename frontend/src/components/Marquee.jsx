function Marquee() {
  const words = ["LIPS", "FACE", "EYES", "SKINCARE", "LAKMÉ"];

  // Repeat the words so one group is wider than any screen
  const group = Array.from({ length: 4 }).flatMap(() => words);

  const renderGroup = (hidden) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {group.map((word, index) => (
        <span key={index} className="flex items-center">
          <span className="px-8 text-sm font-medium uppercase tracking-[0.35em] text-white sm:text-base">
            {word}
          </span>
          <span className="text-rose-200">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden bg-rose-400 py-3">
      {/* Two identical groups side by side: when the first has slid out, the second is exactly where it started */}
      <div className="marquee-track flex w-max">
        {renderGroup(false)}
        {renderGroup(true)}
      </div>
    </div>
  );
}

export default Marquee;