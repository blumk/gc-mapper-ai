interface AirportIconProps {
  isSelected?: boolean;
  isConnected?: boolean;
  isUnselected?: boolean;
}

export const AirportIcon = ({
  isSelected = false,
  isConnected = false,
  isUnselected = false,
}: AirportIconProps) => {
  // Determine size and opacity based on state
  // Using harmonious darker blue palette for dark theme
  let size = "w-8 h-8";
  let dotSize = "h-6 w-6 min-w-6 min-h-6";
  let opacity = "opacity-100";
  let bgColor = "bg-cyan-500";
  let borderColor = "border-cyan-400";
  let shadow = "shadow-lg";

  if (isSelected) {
    // Selected airport: darker blue, full opacity
    size = "w-8 h-8";
    dotSize = "h-6 w-6 min-w-6 min-h-6";
    opacity = "opacity-100";
    bgColor = "bg-cyan-500";
    borderColor = "border-cyan-400";
    shadow = "shadow-lg shadow-cyan-600/50";
  } else if (isConnected) {
    // Connected airports: medium darker blue
    size = "w-7 h-7";
    dotSize = "h-5 w-5 min-w-5 min-h-5";
    opacity = "opacity-90";
    bgColor = "bg-sky-500";
    borderColor = "border-sky-400";
    shadow = "shadow-md shadow-sky-600/40";
  } else if (isUnselected) {
    // Unselected airports: subtle darker blue, faded
    size = "w-5 h-5";
    dotSize = "h-3 w-3 min-w-3 min-h-3";
    opacity = "opacity-40";
    bgColor = "bg-sky-600";
    borderColor = "border-sky-500";
    shadow = "shadow-sm";
  }

  return (
    <div
      className={`relative cursor-pointer ${size} flex items-center justify-center transition-all duration-300 ${opacity}`}
    >
      <div
        className={`${dotSize} ${bgColor} rounded-full border-2 ${borderColor} ${shadow} transition-all duration-200 hover:scale-125 hover:shadow-xl hover:bg-cyan-400 active:scale-110 pointer-events-auto`}
        aria-label="Airport marker"
        role="button"
        tabIndex={0}
      />
    </div>
  );
};
