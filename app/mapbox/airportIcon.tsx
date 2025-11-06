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
  let size = "w-8 h-8";
  let dotSize = "h-6 w-6 min-w-6 min-h-6";
  let opacity = "opacity-100";
  let bgColor = "bg-sky-400";
  let borderColor = "border-sky-800";
  let shadow = "shadow-lg";

  if (isSelected) {
    // Selected airport: normal size, full opacity
    size = "w-8 h-8";
    dotSize = "h-6 w-6 min-w-6 min-h-6";
    opacity = "opacity-100";
    bgColor = "bg-sky-400";
    borderColor = "border-sky-800";
    shadow = "shadow-lg";
  } else if (isConnected) {
    // Connected airports: medium highlight, slightly larger
    size = "w-7 h-7";
    dotSize = "h-5 w-5 min-w-5 min-h-5";
    opacity = "opacity-80";
    bgColor = "bg-blue-500";
    borderColor = "border-blue-700";
    shadow = "shadow-md";
  } else if (isUnselected) {
    // Unselected airports: smaller, faded
    size = "w-5 h-5";
    dotSize = "h-3 w-3 min-w-3 min-h-3";
    opacity = "opacity-30";
    bgColor = "bg-sky-400";
    borderColor = "border-sky-800";
    shadow = "shadow-sm";
  }

  return (
    <div
      className={`relative cursor-pointer ${size} flex items-center justify-center transition-all duration-300 ${opacity}`}
    >
      <div
        className={`${dotSize} ${bgColor} rounded-full border-2 ${borderColor} ${shadow} transition-all duration-200 hover:scale-125 hover:shadow-xl hover:bg-sky-300 active:scale-110 pointer-events-auto`}
        aria-label="Airport marker"
        role="button"
        tabIndex={0}
      />
    </div>
  );
};
