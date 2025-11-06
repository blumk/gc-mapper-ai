export const AirportIcon = () => (
  <div className="relative cursor-pointer w-8 h-8 flex items-center justify-center">
    <div
      className="h-6 w-6 min-w-6 min-h-6 bg-sky-400 rounded-full border-2 border-sky-800 shadow-lg transition-all duration-200 hover:scale-125 hover:shadow-xl hover:bg-sky-300 active:scale-110 pointer-events-auto"
      aria-label="Airport marker"
      role="button"
      tabIndex={0}
    />
  </div>
);
