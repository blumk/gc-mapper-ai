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
  // Using darker blue palette for color blindness safety with good contrast
  let size = "w-6 h-6";
  let dotSize = "h-4 w-4 min-w-4 min-h-4";
  let opacity = "opacity-100";
  let bgColor = "bg-blue-500";
  let borderColor = "border-blue-400";
  let shadow = "shadow-md";

  if (isSelected) {
    // Selected airport: darker blue, full opacity
    size = "w-6 h-6";
    dotSize = "h-4 w-4 min-w-4 min-h-4";
    opacity = "opacity-100";
    bgColor = "bg-blue-500";
    borderColor = "border-blue-400";
    shadow = "shadow-md shadow-blue-600/50";
  } else if (isConnected) {
    // Connected airports: medium darker blue
    size = "w-5 h-5";
    dotSize = "h-[14px] w-[14px] min-w-[14px] min-h-[14px]";
    opacity = "opacity-90";
    bgColor = "bg-blue-600";
    borderColor = "border-blue-500";
    shadow = "shadow-sm shadow-blue-700/40";
  } else if (isUnselected) {
    // Unselected airports: subtle darker blue, faded
    size = "w-4 h-4";
    dotSize = "h-[10px] w-[10px] min-w-[10px] min-h-[10px]";
    opacity = "opacity-40";
    bgColor = "bg-blue-700";
    borderColor = "border-blue-600";
    shadow = "shadow-sm";
  }

  return (
    <div
      className={`relative cursor-pointer ${size} flex items-center justify-center transition-all duration-300 ${opacity}`}
    >
      <div
        className={`${dotSize} ${bgColor} rounded-full border-2 ${borderColor} ${shadow} transition-all duration-200 hover:scale-125 hover:shadow-xl hover:bg-blue-400 active:scale-110 pointer-events-auto`}
        aria-label="Airport marker"
        role="button"
        tabIndex={0}
      />
    </div>
  );
};
